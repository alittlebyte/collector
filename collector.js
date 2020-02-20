/* Переписывал костяк трижды, остановился на текущем варианте - у нас есть основной класс, от него 3 расширения, в конце одна строчка для сборки и запуска. Начинал с конструкции вида: 

var CollectorModel = function CollectorModel()
CollectorModel.prototype.sendCollectionsRequest = function sendCollectionsRequest()

...и далее, пока дело не дошло до контроллера. Он переставал выполнять свою функцию и просто был списком статичных методов. Вырисовывался большой блок "вне концепта MVC", в районе app, где надо было бы по очереди вызывать все методы, прикреплять их друг к другу - и для каждого экрана по новой подменять model и view. Отказался от такого подхода.

Пробовал скрестить расширение прототипа и классы - вышла ещё большая мешанина. 

Оставил чисто классы. Да, в JS они не объекты, а функции, но всё же они понятнее и удобнее. И лучше поддаются расширению: нужен выполняющийся при запуске метод - пихаем в constructor, нужно вызвать позже - прописываем в тело и вызываем через другую функцию и event listener. */

//main class
class Collector{
	constructor(model, view){
		this.options = {
			headers:{
				'SameSite':'None',
				'Accept-Version':'v1',
				'Authorization':'Client-ID 4a0afb8e8be67a1d66da9019e96ba732ea4554a19d4bfe514e363c516ce62ae8'
			}
		}
		this.element1 = document.getElementById('collections')
		this.element2 = document.getElementById('collections__photos')	
		this.element3 = document.getElementById('photos__details')
		this.model = model
		this.view = view
		this.temp = []
	}
}

//model
class CollectorModel extends Collector{
	constructor(options){
		super(options)
	}

	sendCollectionsRequest(){
		return axios.get('https://api.unsplash.com/collections?per_page=20',this.options)
	}

	sendPhotosRequest(idx){
		return axios.get(`https://api.unsplash.com/collections/${idx}/photos`,this.options)		
	}

	/*	Альтернативный вариант приема данных "как в SPA": достать список коллекций и, с помощью .map разобрав их id на отдельные запросы, отправить на сервер. Минусы: 
	- За раз отправляется минимум 11 запросов, и не факт, что пользователь их все будет просматривать. В API ограничение, конечно, щедрое, и повторные запросы не считаются. Но надо ли его так заспамливать?
	- Данные о полученных коллекциях нам тоже нужны - но если их выдернуть в функцию или переменную в первом then'е, дальше данные о коллекциях не проходят
	- Так как с запросов возвращается список ответов - массив, запакованный в массив, запакованный в..., через них надо несколько раз пройтись .map'ом в .map'е в..., а отправлять их по одному и последовательно - значит вешать приложение до получения данных секунд так на 5.
			
	sendCollectionsRequest(){
	return axios.get('https://api.unsplash.com/collections?per_page=10',this.options)
		.then(
			v => v.data.map(el => el.id)				
		)
		.then(
			asd => axios.all([
				asd.map(
					hm => axios.get(`https://api.unsplash.com/collections/${hm}/photos`,this.options)
				)
			])	
		)
		.then(
			rsp => rsp.map(
				sf => sf.map(
					idk => idk
						.then(el => console.log(el.data))
				)
			)
		)
	} */
} 

//view
class CollectorView extends Collector{
	constructor(element1, element2, element3){
		super(element1, element2, element3)
	}

	/* Имитация template engine: создание конструктора для каждой из страниц. Какие-то части можно убирать, какие-то добавлять, кастомные классы и значения прописываются в styles.css. Если с масштабизацией приложения будет расти и количество экранов - если их вместо 3х станет штук так десять, придется кстати. Потому что, по сути, я каждый раз создаю одни и те же элементы, помещаю их в контейнер, контейнер привинчиваю к текущему view. Зачем писать одно и то же, даже три раза, с небольшими отличиями, если можно автоматизировать?

	Главный минус: 
	- Ооооочень длинный список передаваемых вводных. Как минимум это контейнер, основной див, див-покрытие (чтобы на фото с белым фоном текст был виден), изображение, кнопка "на следующий экран" и полученные с API данные. Как бы это улучшить, не разбивая на десяток функций...*/

	renderGeneral(clrscr,element,container,prevPage,prevpage__href,firstPage){
		if(clrscr){
			element.innerHTML = '' 
		}

		container.setAttribute("class","container")
		element.appendChild(container)

		let upperMenu = document.createElement("div")
		upperMenu.setAttribute("class","rectangle")
		container.append(upperMenu)

		if(prevPage){
			prevPage = document.createElement("a")
			prevPage.textContent = '< Назад'
			prevPage.setAttribute("href",prevpage__href)
			upperMenu.append(prevPage)
		}

		if(firstPage){
			firstPage = document.createElement("a")
			firstPage.textContent = '<< На главную'
			firstPage.setAttribute("href","#collections")
			upperMenu.append(firstPage)
		}
	}

	renderTemplate(container,main__class,cover,cover__class,image,image__src,title,title__text,count,count__text,descript,descript__text,nextPage,nextPage__text,nextPage__href,nextPage__id,nextPage__class){

		let main = document.createElement("div")
		main.setAttribute("class",main__class)		


		if(cover){
			cover = document.createElement("div")
			cover.setAttribute("class",cover__class)
			main.appendChild(cover)
		}

		if(image){
			image = document.createElement("img")
			image.setAttribute("src",image__src)
			main.appendChild(image)		
		}

		if(title){
			title = document.createElement("h4")
			title.textContent = title__text 
			main.appendChild(title)
		}

		if(count){
			count = document.createElement("p")
			count.textContent = count__text
			main.appendChild(count)
		}

		if(descript){
			descript = document.createElement("h5")
			descript.textContent = descript__text
			main.appendChild(descript)
		}

		if(nextPage){
			nextPage = document.createElement("a")
			nextPage.textContent = nextPage__text
			nextPage.setAttribute("href",nextPage__href)
			nextPage.setAttribute("id",nextPage__id)
			nextPage.setAttribute("class",nextPage__class)
			main.appendChild(nextPage)
		}

		container.appendChild(main)
	}

	renderCollections(viewModel){
		let container1 = document.createElement("div")
		this.renderGeneral(false,this.element1,container1,false,false,false)
		viewModel.map(el => this.renderTemplate(container1,"hoverable",true,"cover",true,el.cover_photo.urls.regular,true,el.title,true,'Всего фото: ' + el.total_photos,true,el.description,true,'К фото',"#collections__photos",el.id,"circle"))			
	}

	renderPhotos(viewModel){
		let container2 = document.createElement("div")
		this.renderGeneral(true,this.element2,container2,true,"#collections",false)

		viewModel.map(el => this.renderTemplate(container2,"hoverable",true,"cover",true,el.urls.regular,true,el.user.name,true,'Лайков: ' + el.likes,true,el.description?el.description:el.alt_description,true,'Подробнee',"#photos__details",viewModel.indexOf(el),"circle"))
	}

	renderPhotoDetails(viewModel){
		let container3 = document.createElement("div")
		this.renderGeneral(true,this.element3,container3,true,"#collections__photos",true)

		this.renderTemplate(container3,"watchable",true,"saver",true,viewModel.urls.regular,true,(viewModel.description?viewModel.description:viewModel.alt_description) + '\r\n От ' + viewModel.user.name + '\r\n Из ' + (viewModel.location?viewModel.location:'неизвестной страны'),true,'Всего фото от этого автора: ' + viewModel.user.total_photos,true,'Об авторе: \r\n' + viewModel.user.bio)
	}
}

//controller
class CollectorController extends Collector{
	constructor(element1, element2, model, view, temp){
		super(element1, element2, model, view, temp)

		this.getCollectionsAndRender(this.model.sendCollectionsRequest())
		this.returnCollectionsId()
		this.returnPhotoDetailsId()
	}

	async getCollectionsAndRender(data){
		let collectionsArray = await data.then(resp => resp.data)
		this.view.renderCollections(collectionsArray)
	}

	async getIdAndRender(idx){
		let photosPromise = this.model.sendPhotosRequest(idx)
		let photosArray = await photosPromise.then(rsp => rsp.data)
		this.view.renderPhotos(photosArray)	
		this.temp = [...photosArray]
	}

	getPhotoIdAndRender(idx){
		let photoDetails = this.temp[idx]
		this.view.renderPhotoDetails(photoDetails)
	}

	returnCollectionsId(){	
		this.element1.addEventListener('click', e => {
			if (e.target.id && e.target.id !== 'collections') { 
				this.getIdAndRender(e.target.id) 
			}
		})
	} 

	returnPhotoDetailsId(){
		this.element2.addEventListener('click', e => {
			if (e.target.id && e.target.id !== 'collections__photos') { 
				this.getPhotoIdAndRender(e.target.id)
			}
		})
	}
}

//app
new CollectorController(new CollectorModel(), new CollectorView())
