var liaWithEditOrDeleteOnClick = function (User, callback) {
	
	var $content = $("<ul>");

	var $userListItem = $("<li>").text("ФИО: " + User.username + ", Логин: " + User.login + ", Пароль: " + User.password);
	$content.append($userListItem);
	//поменять проверку с имени на тип
    if (User.login != "admin") {
        var $userRemoveLink = $("<a>").attr("href", "/users/" + User.login);

		var $image = $("<li align = center>");
		let pathToImgOfUser = User.pathToImg;

		$.ajax({
			url: pathToImgOfUser,
			type:'HEAD',
			error: function()
			{
				// console.log("изображения нет!!!");
				pathToImgOfUser = "/images/user_default.png";
				$image.append($("<img>").attr("src", pathToImgOfUser).addClass("main_image"));
				$content.append($image);
			},
			success: function()
			{
				// console.log("изображение есть!!!");
				$image.append($("<img>").attr("src", pathToImgOfUser).addClass("main_image"));
				$content.append($image);
			}
		});

		var $userPhotoPath = $("<li>").text("Путь к изображению: " + User.pathToImg);
		$content.append($userPhotoPath);

        $userRemoveLink.addClass("linkRemove");
        $userRemoveLink.text("Удалить");
        $userRemoveLink.on("click", function () {
            $.ajax({
                url: "/users/" + User.login,
                type: "DELETE"
            }).done(function (responde) {
                callback();
            }).fail(function (err) {
                console.log("Произошла ошибка: " + err.textStatus);
            });
            return false;
        });
        $userListItem.append($userRemoveLink); 
    }
	
	return $content;
}

var addMealToMenu = function(Receipt, callback) {

	var $content = $("<ul>");

	var $mealListItem = $("<li>"),
		$mealEditLink = $("<a>").attr("href", "/meals/" + Receipt._id),
		$mealReturnLink = $("<a>").attr("href", "/meals/" + Receipt._id),
		$menusList = $("<select name = 'menus'>"),
		$addMealToMenu = $("<a>").attr("href", "/meals/" + Receipt._id),
		$removeMealFromMenu = $("<a>").attr("href", "/meals/" + Receipt._id);
		$removeMeal = $("<a>").attr("href", "/meals/" + Receipt._id);

		
	$mealListItem.text(Receipt.description);
			

	$mealEditLink.addClass("linkEdit");
	$mealReturnLink.addClass("linkRemove");
	$menusList.prepend('<option value="-1">Выберете меню</option>');
	$menusList.addClass("linkList");
	$addMealToMenu.addClass("linkEdit");
	$removeMealFromMenu.addClass("linkEdit");
	$removeMeal.addClass("linkRemove");

	var $image = $("<li align = center>");
	let pathToImgOfMeal = Receipt.pathToImg;
	$content.append($image);
	$.ajax({
		url: pathToImgOfMeal,
		type:'HEAD',
		error: function()
		{
			pathToImgOfMeal = "/images/user_default.png";
			$image.append($("<img>").attr("src", pathToImgOfMeal).addClass("main_image"));
		},
		success: function()
		{
			$image.append($("<img>").attr("src", pathToImgOfMeal).addClass("main_image"));
		}
	});

	if (Receipt.status === 'Есть в меню') {
		$mealEditLink.text("Сегодня не подаем");
		$mealEditLink.on("click", function() {
			var newDescription = Receipt.description + " [Сегодня не в меню]";
			if (newDescription !== null && newDescription.trim() !== "") {
				$.ajax({
					"url": "/meals/" + Receipt._id,
					"type": "PUT",
					"data": { "description": newDescription, "status": 'Сегодня не в меню',"price" : Receipt.price, "owner" : Receipt.owner }
				}).done(function (responde) {
					Receipt.status = 'Сегодня не в меню';
					callback();
				}).fail(function (err) {
					console.log("Произошла ошибка: " + err);
				});
			}
			return false;
		});	
		$mealListItem.append($mealEditLink); 
	}
	else {
		$mealReturnLink.text("Сегодня подаем");
		$mealReturnLink.on("click", function () {
			var oldDes = Receipt.description
			var newDescription = oldDes.split(' [Сегодня не в меню]').join(' '); 
			var newDescription = newDescription.substring(0, newDescription.length - 1);
			$.ajax({
				"url": "/meals/" + Receipt._id,
				"type": "PUT",
				"data": { "description": newDescription, "status": 'Есть в меню',"price" : Receipt.price, "owner" : Receipt.owner }
			}).done(function (responde) {
				Receipt.status = 'Есть в меню';
				callback();
			}).fail(function (err) {
				console.log("Произошла ошибка: " + err);
			});
			return false;
		});
		$mealListItem.append($mealReturnLink);
	}

	//добавляем меню в список
	$.getJSON("/menus.json", function (menusObjects) {
		for (var i = menusObjects.length-1; i>=0; i--) {
			$menusList.append('<option value="' + menusObjects[i]._id + '">' + menusObjects[i].nameOfMenu + '</option>');
		}	
	}).fail(function (jqXHR, textStatus, error) {
		callback(error, null);
	});

	$removeMeal.text("Удалить блюдо");
	$removeMeal.on("click", function() {
		$.ajax({
			"url": "/meals/" + Receipt._id,
			"type": "DELETE"
		}).done(function (responde) {
			callback();
		}).fail(function (err) {
			console.log("Произошла ошибка: " + err);
		});
		return false;
	});	
	$mealListItem.append($removeMeal); 

	if (Receipt.owner === null) {
		$mealListItem.append($menusList); 
		$addMealToMenu.text("Добавить в меню ");
		$addMealToMenu.on("click", function() {
			console.log("выбрано меню: " + $menusList.val());
			if ($menusList.val() == -1) {
				alert ("Вы не выбрали меню!!!");
			} else {
				var selectedMenuID = $menusList.val(); //id выбранного Меню
				$.ajax({
					"url": "/meals/" + Receipt._id,
					"type": "PUT",
					"data": { "description": Receipt.description, "status": Receipt.status, "price" : Receipt.price, "owner" : selectedMenuID },
				}).done(function (responde) {
					callback();
				}).fail(function (err) {
					console.log("Произошла ошибка: " + error);
				});
				$.getJSON("/menus.json", function (menusObjects) {
					console.log(menusObjects);
					var newArray = [];
					for (var i = menusObjects.length-1; i>=0; i--) {
						console.log(newArray);
						if (menusObjects[i]._id == selectedMenuID) {
							console.log("меню найдено");
							newArray = menusObjects[i].meals;
							newArray.push(Receipt);
							console.log(newArray);
							$.ajax({
								"url": "/menus/" + menusObjects[i]._id,
								"type": "PUT",
								"data": { "meals": newArray, "nameOfMenu" :  menusObjects[i].nameOfMenu},
							}).done(function (responde) {
								// callback();
							}).fail(function (err) {
								console.log("Произошла ошибка: " + error);
							});
						}
					}	
					// callback();
				}).fail(function (jqXHR, textStatus, error) {
					callback(error, null);
				});
			}
			
			return false;
		});	
		$mealListItem.append($addMealToMenu); 
	} else {
		$removeMealFromMenu.text("Удалить из меню");
		$removeMealFromMenu.on("click", function() {
			let mealID = Receipt._id;
			$.ajax({
				"url": "/meals/" + Receipt._id,
				"type": "PUT",
				"data": { "description": Receipt.description, "status": Receipt.status, "price" : Receipt.price, "owner" : null },
			}).done(function (responde) {
				callback();
			}).fail(function (err) {
				console.log("Произошла ошибка: " + err);
			});

			$.getJSON("/menus.json", function (menusObjects) {
				console.log(menusObjects);
				var check = 0;
				for (var i = menusObjects.length-1; i>=0; i--) {
					var oldArray = [];
					var newArray = [];
					console.log("menuID : " + menusObjects[i]._id);
					let menuID = menusObjects[i]._id; //id Меню
					let menuName = menusObjects[i].nameOfMenu;
					oldArray = menusObjects[i].meals;
					for (var j = 0; j<=oldArray.length; j++) {
						if (oldArray[j] == Receipt._id) {
							console.log("меню найдено, удаляем блюдо из него");
							check = 1;
						} else {
							console.log("добавляем в массив newArray");
							newArray.push(oldArray[j]);
						}
					}						
					console.log(newArray);
					if (check === 1 ) {
						$.ajax({
							"url": "/menus/" + menuID,
							"type": "PUT",
							"data": { "meals": newArray, "nameOfMenu" :  menuName},
						})
						.done(function (responde) {
							// callback();
						})
						.fail(function(jqXHR, textStatus, error) {
							if (jqXHR.status === 501) { console.log("Блюдо с таким названием уже существует!"); } 
							else { console.log("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 }
						});
					
						console.log("i = " + i);
						
							break;
						
					}
				}	
				// callback();
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});

			return false;
		});	
		$mealListItem.append($removeMealFromMenu); 
	}
	
	var $ingredients = $("<li>").text("Состав: " + Receipt.tags);
	var $price = $("<li>").text("Цена: " + Receipt.price + " рублей");
	var $mealPhotoPath = $("<li>").text("Путь к изображению: " + Receipt.pathToImg);
	$content.append($mealListItem);

	var $nameOfMenu = $("<li>");
	$.getJSON("/menus.json", function (menusObjects) {
		for (var i = menusObjects.length-1; i>=0; i--) {
			if (menusObjects[i]._id == Receipt.owner) {
				nameOfMenu = menusObjects[i].nameOfMenu
				$nameOfMenu.text("Меню: " + nameOfMenu)
			} 
		}
		if (Receipt.owner == null) {
			$nameOfMenu.text("Меню: не указано")
		}
	});

	$content.append($nameOfMenu);
	$content.append($ingredients);
	$content.append($price);
	$content.append($mealPhotoPath);
	return $content;
}

var editOrDeleteMenu = function(Menu, callback) {
	var $menuListItem = $("<li>").text(Menu.nameOfMenu + " (" + "" + Menu.meals.length + " блюд)"),
		$editMenu = $("<a>").attr("href", "/menus/" + Menu._id),
		$removeMenu = $("<a>").attr("href", "/menus/" + Menu._id);
	$editMenu.addClass("linkEdit");
	$removeMenu.addClass("linkRemove");

	$editMenu.text("Переименовать меню");
	$editMenu.on("click", function() {
		var newNameOfMenu = prompt("Введите новое наименование для задачи", Menu.nameOfMenu);
		$.ajax({
			"url": "/menus/" + Menu._id,
			"type": "PUT",
			"data": { "meals": Menu.meals, "nameOfMenu": newNameOfMenu },
		}).done(function (responde) {
			callback();
		}).fail(function (err) {
			console.log("Произошла ошибка: " + err.val);
		});
		return false;
	});

	$menuListItem.append($editMenu); 

	$removeMenu.text("Удалить меню");
	$removeMenu.on("click", function() {
		$.ajax({
			"url": "/menus/" + Menu._id,
			"type": "DELETE"
		}).done(function (responde) {
			callback();
		}).fail(function (err) {
			console.log("Произошла ошибка: " + err);
		});
		return false;
	});
	$menuListItem.append($removeMenu); 

	return $menuListItem;
}

var main = function(userObjects) {
	"use strict";
	// создание пустого массива с вкладками
	var tabs = [];

	// добавляем вкладку Пользователи
	tabs.push({
		"name": "Пользователи",
		"content": function(callback) {
			$.getJSON("/users.json", function (userObjects) {
				var $content = $("<ul>");
				$content.append($("<p>").text(""));
				for (var i = userObjects.length-1; i>=0; i--) {
					// console.log("test");
					var $userListItem = liaWithEditOrDeleteOnClick(userObjects[i], function() {
						$(".tabs a:first-child span").trigger("click");
					});
					$content.append($userListItem);
					$content.append($("<p>").text(""));

				}
				callback(null, $content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});
	
	// создаем вкладку Добавить пользователя
	tabs.push({
		"name": "Новый сотрудник",
		"content":function () {
			$.get("/users.json", function (userObjects) {	
				// создание $content для Добавить 
				var $loginInput = $("<input>").addClass("login"), 
					$passwordInput = $("<input>").addClass("password"),
					$usernameInput = $("<input>").addClass("username"), 
					$userPhotoPathInput = $("<input>").addClass("pathToImg"), 
					$button = $("<button>").text("Добавить"),
					$contentForLogin = $("<ul>"),
					$contentForPassword = $("<ul>"),
					$contentForUsername = $("<ul>"),
					$contentForImg = $("<ul>");

					$loginInput.attr('placeholder','Логин');
					$passwordInput.attr('placeholder','Пароль');
					$usernameInput.attr('placeholder','ФИО');
					$userPhotoPathInput.attr('placeholder','Путь к изображению (папка клиента, начиная с /images/...)');

				$contentForLogin.append($loginInput);
				$contentForPassword.append($passwordInput);
				$contentForUsername.append($usernameInput);
				$contentForImg.append($userPhotoPathInput);
				$("main .content").append($("<p>"));
				$("main .content").append($contentForLogin);
				$("main .content").append($contentForPassword);
				$("main .content").append($contentForUsername);
				$("main .content").append($contentForImg);
				$("main .content").append($button); 
				
				function btnfunc() {
					var login = $loginInput.val();
					var password = $passwordInput.val();
					var username = $usernameInput.val();
					var pathToImg = $userPhotoPathInput.val();
					// создаем нового пользователя
					$.ajax({
						url: pathToImg,
						type:'HEAD',
						error: function()
						{
							console.log("изображения нет!!!");
							alert('Изображения по указанному пути не существует!')
						},
						success: function()
						{
							console.log("изображение есть!!!");

							if (login !== null && login.trim() !== "" && 
							password !== null && password.trim() !== "" &&
							username !== null && username.trim() !== "" && 
							pathToImg !== null && pathToImg.trim() !== "" ) {
								var newUser = {"login": login, "password" : password, "username" : username, "pathToImg" : pathToImg};
								$.post("/users", newUser, function(result) {
									console.log(result); 
									userObjects.push(newUser); // отправляем на клиент
									$loginInput.val(""); 
									$passwordInput.val(""); 
									$(".tabs a:nth-child(2) span").trigger("click");
								}).done(function(responde) {
									console.log(responde);
									alert('Аккаунт успешно создан!')
								}).fail(function(jqXHR, textStatus, error) {
									console.log(error);
									if (jqXHR.status === 501) {
										alert("Такой пользователь уже существует!\nИзмените логин и повторите "
											+ "попытку");
									} 
									else { alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 }
								});
							} else {
								alert('Введите все данные!')
							}
						}
					});
				}
				$button.on("click", function() { btnfunc(); });
				$('.tags').on('keydown',function(e){ if (e.which === 13) { btnfunc(); } });
			});
		}
	});

	//вкладка "Все меню"
	tabs.push({
		"name": "Все меню",
		"content": function(callback) {
			var $content = $("<ul>");
			$.getJSON("/menus.json", function (menusObjects) {
				var $text = $("<p>").text("");
				$content.append($text);
				for (var i = menusObjects.length-1; i>=0; i--) {
					var $menuListItem = editOrDeleteMenu(menusObjects[i], function() {
						$(".tabs a:nth-child(3) span").trigger("click");
					});
					$content.append($menuListItem);
				}
				callback(null, $content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	//вклакда "Создать меню"
	tabs.push({
		"name": "Создать меню",
		"content":function (callback) {
			$.getJSON("/menus.json", function(menuObjects) {
				var $input = $("<input>").addClass(""), 
					$button = $("<button>").text("Добавить"),
					$content = $("<ul>");
				$content.append($input);
				$input.attr('placeholder','Название для нового меню');
				$("main .content").append($("<p>"));
				$("main .content").append($content);
				$("main .content").append($button); 
				function btnfunc() {
					var nameOfMenu = $input.val();
					if (nameOfMenu !== null && nameOfMenu.trim() !== "") {
						// создаем новое меню
						var newMenu = {"nameOfMenu" : nameOfMenu};
						$.post("/menus", newMenu, function(result) {
							console.log(result); 
							menuObjects.push(newMenu); // отправляем на клиент
							$input.val(""); 
							$(".tabs a:nth-child(4) span").trigger("click");
						}).done(function(responde) {
							console.log(responde);
							alert('Меню успешно создано!')
						}).fail(function(jqXHR, textStatus, error) {
							console.log(error);
							if (jqXHR.status === 501) { alert("Меню с таким названием уже существует!"); } 
							else { alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 }
						});
					} else {
						alert('Введите все данные!')
					}
				}
				$button.on("click", function() { btnfunc(); });
				$('.tags').on('keydown',function(e){ if (e.which === 13) { btnfunc(); } });


			}).fail(function (jqXHR, textStatus, error) {
				console.log(error);
				callback(error, null);
			});

		}
	});

	//вкладка "Все блюда"
	tabs.push({
		"name": "Все блюда",
		"content": function(callback) {
			$.getJSON("/meals.json", function (mealObjects) {
				var $content = $("<ul>");
				for (var i = mealObjects.length-1; i>=0; i--) {
					var $mealListItem = addMealToMenu(mealObjects[i], function() {
						$(".tabs a:nth-child(5) span").trigger("click");
					});
					$content.append($("<p>").text(""));
					$content.append($mealListItem);
				}
				callback(null, $content);
				
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
			
		}
	});

	// создаем вкладку Добавить блюдо
	tabs.push({
		"name": "Добавить блюдо",
		"content":function () {
			$.get("/meals.json", function (mealObjects) {	
				// создание $content для Добавить 
				var $input = $("<input>").addClass("description"), 
					$tagInput = $("<input>").addClass("tags"),
					$priceInput = $("<input>").addClass("price"),
					$pathToImg = $("<input>").addClass("pathToImg"),
					$button = $("<button>").text("Добавить"),
					$content = $("<ul>");

				$input.attr('placeholder','Название для нового блюда');
				$tagInput.attr('placeholder','Ингредиенты (через запятую)');
				$priceInput.attr('placeholder','Стоимость (в рублях)');
				$pathToImg.attr('placeholder','Путь к изображению (папка клиента, начиная с /images/...)');
				
				$content.append($input);
				$content.append($tagInput);
				$content.append($priceInput);
				$content.append($pathToImg);

				$("main .content").append($("<p>"));
				$("main .content").append($content);
				$("main .content").append($button); 
				
				function btnfunc() {
					var description = $input.val(),
						tags = $tagInput.val().split(","),
						price = $priceInput.val(),
						pathToImg = $pathToImg.val();


					$.ajax({
						url: pathToImg,
						type:'HEAD',
						error: function()
						{
							console.log("изображения нет!!!");
							alert('Изображения по указанному пути не существует!')
						},
						success: function()
						{
							console.log("изображение есть!!!");

						if (description !== null && description.trim() !== "" && 
							$tagInput.val() !== null && $tagInput.val().trim() !== "" &&
							price !== null && price.trim() !== "" &&
							pathToImg !== null && pathToImg.trim() !== "") {
							// создаем новый элемент списка задач
							var newMeal = {"description":description, "tags":tags, "status": 'Есть в меню', "price": price, "pathToImg" : pathToImg};
														
							$.post("/meals", newMeal, function(result) {
								console.log(result); 
								mealObjects.push(newMeal); // отправляем на клиент
								$input.val("");
								$tagInput.val("");
								$priceInput.val("");
								$pathToImg.val("");
								$(".tabs a:nth-child(6) span").trigger("click");
							})
							.done(function(responde){ 
								console.log(responde);
								alert('Блюдо успешно создано!')
							 })
							.fail(function(jqXHR, textStatus, error) {
								console.log(error);
								if (jqXHR.status === 501) { alert("Блюдо с таким названием уже существует!"); } 
								else if (jqXHR.status === 500) { alert("Проверьте правильность введенных данных!"); } 
								else { alert("Произошла ошибка!\n"+jqXHR.status + " " + jqXHR.textStatus);	 }
							});

							
						} else {
							alert('Введите все данные!')
						}
					}
				});
					
				}
				$button.on("click", function() { btnfunc(); });
				$('.tags').on('keydown',function(e){
					if (e.which === 13) { btnfunc(); }
				});
			});
		}
	});

	tabs.forEach(function (tab) {
		var $aElement = $("<a>").attr("href",""),
			$spanElement = $("<span>").text(tab.name);
		$aElement.append($spanElement);
		$("main .tabs").append($aElement);

		$spanElement.on("click", function () {
			$(".tabs a span").removeClass("active");
			$spanElement.addClass("active");
			$("main .content").empty();
			tab.content(function (err, $content) {
				if (err !== null) { alert ("Возникла проблема при обработке запроса: " + err); } 
				else { $("main .content").append($content); }
			});
			return false;
		});
	});

	$(".tabs a:first-child span").trigger("click");
}

$(document).ready(function() {
    $.getJSON("/users.json", function (userObjects) {
        var $place = $("<p>").text("Здравствуйте, админ!");
        $("header .username").append($place);
        main(userObjects);
    });	
});