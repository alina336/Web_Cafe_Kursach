//проверка корректности пароля
var checkPassword = function (userObjects, login, password) {
	console.log(userObjects);
	var check = 0 //проверка пути к изображению (если изображение не найдено, то вернет -1)
	for (var i = userObjects.length-1; i>=0; i--) {
		if (userObjects[i].login == login) { 
			console.log("пользователь найден");
			if (userObjects[i].password == password) {
				console.log("пароли совпадают");
				check = userObjects[i].pathToImg; //возвращаем строку-путь к изображению
				if (userObjects[i].pathToImg == "") {
					check = -1;
				}
				console.log(userObjects[i].pathToImg);
			} 
			else { console.log("пароли не совпадают"); }
		}
	}
	return check
}

//заполнение сайта при первом запуске (при создании аккаунта админа)
var initialize = function (password, callback) {
	console.log("Первый запуск приложения!");
	// добавляем пользователей
	$.get("/users.json", function (userObjects) {	
		// создаем админа
		var admin = {"login": "admin", "password" : password, "username" : "admin", "pathToImg" : null};
		$.post("/users", admin, function(result) {
			console.log(result); 
			userObjects.push(admin); // отправляем на клиент
		}).done(function(responde) {
			console.log(responde);
		}).fail(function(jqXHR, textStatus, error) {
			console.log(error);
			alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 
		});

		//создаем пользователя
		var user = {"login": "user-1", "password" : "1111", "username" : "Иванов Иван Иванович", "pathToImg" : "/images/users/user1.jpeg"};
		$.post("/users", user, function(result) {
			console.log(result); 
			userObjects.push(user); // отправляем на клиент
		}).done(function(responde) {
			console.log(responde);
		}).fail(function(jqXHR, textStatus, error) {
			console.log(error);
			alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 
		});
	});

	// создаем меню
	$.get("/menus.json", function (userObjects) {
		var menu = {"nameOfMenu" : "Фастфуд"};
		$.post("/menus", menu, function(result) {
			console.log(result); 
			userObjects.push(menu); // отправляем на клиент
		}).done(function(responde) {
			console.log(responde);
		}).fail(function(jqXHR, textStatus, error) {
			console.log(error);
			alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 
		});
	});

	// создаем блюдо
	$.get("/meals.json", function (userObjects) {
		var meal = {"description": "Бургер", "tags": ["Булка","Котлета","Сыр","Помидорка"], "status": 'Есть в меню', "price": 50, "pathToImg" : "/images/meals/burger.jpeg"};
		$.post("/meals", meal, function(result) {
			console.log(result); 
			userObjects.push(meal); // отправляем на клиент
		}).done(function(responde) {
			console.log(responde);
		}).fail(function(jqXHR, textStatus, error) {
			console.log(error);
			alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 
		});	
	})

}

var main = function (UsersObjects) {
	"use strict";
	var $info = $("<p align=center>").text("Введите свой логин и пароль"),
		$loginInput = $("<input width = 10px>").addClass("login"),
		$passwordInput = $("<input>").addClass("password"),
		$butLogin = $("<button>").text("Войти в аккаунт");

	$loginInput.attr('placeholder','Логин');
	$passwordInput.attr('placeholder','Пароль');

	//обработка нажатия на кнопку "войти"
	function btnfunc() {
		var login = $loginInput.val();
		var password = $passwordInput.val();

		// переходим на страницу админа
		if (login == "admin" && password !== null && password.trim() !== "") {
			$.ajax({
				'url': '/users/'+login,
				'type': 'GET'
			}).done(function(responde) {
				console.log("заходим под админом");
				let pathToImg = checkPassword(UsersObjects, login, password);
				if (pathToImg != 0) {
					window.location.replace('users/' + login + '/');
				} else {
					alert("Пароль администратора введен неверно!!!");	
				}

			}).fail(function(jqXHR, error) {
				console.log("ошибка");
				if (jqXHR.status) {
					initialize(password, function() {
						$butLogin.trigger("click");
					});
					alert(" Аккаунт администратора создан! \n Добро пожаловать на сайт кафе 'У семерки'!");	 
					window.location.reload();
				} else {
					alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	
				}
			});
		} 
		// переходим на страницу работника
		else if (login !== null && login.trim() !== "" && password !== null && password.trim() !== "") {
			let pathToImg = checkPassword(UsersObjects, login, password);
			if (pathToImg != 0) {
				Cookies.set('CurrentUser', login);
				Cookies.set('PathToImgOfUser', pathToImg);
				$.ajax({
					'url': '/users/'+login,
					'type': 'GET'
				}).done(function(responde) {
					window.location.replace('users/' + login + '/');
				}).fail(function(jqXHR, error) {
					console.log(error);
					alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	
				});
			} 
			else {
				alert("Пароль введен неверно или пользователя не существует!");	
			};
		} 
		else {
			alert("Одно из полей пустое!");	
		}
	}
	$butLogin.on("click", function() { btnfunc(); });
	$loginInput.on('keydown',function(e){ if (e.which === 13) { btnfunc(); } });
	$passwordInput.on('keydown',function(e){ if (e.which === 13) { btnfunc(); } });


	$("main .authorization").append($info);
	$("main .authorization").append($loginInput);
	$("main .authorization").append('<p>');
	$("main .authorization").append($passwordInput);
	$("main .authorization").append('<p>');
	$("main .authorization").append($butLogin);
}

$(document).ready(function() {
	$.getJSON("users.json", function (UsersObjects) {
		main(UsersObjects);
	});
});