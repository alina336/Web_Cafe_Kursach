var organizeByTags = function (mealObjects) { 
	// создание пустого массива для тегов
	var tags = [];
	// перебираем все задачи meals 
	mealObjects.forEach(function (Receipt) {
		// перебираем все теги для каждой задачи 
		Receipt.tags.forEach(function (tag) {
			// убеждаемся, что этого тега еще нет в массиве
			if (tags.indexOf(tag) === -1) { 
				tags.push(tag);
			}
		});
	}); 
	var tagObjects = tags.map(function (tag) {
		// здесь мы находим все задачи,
		// содержащие этот тег
		var mealsWithTag = []; 
		mealObjects.forEach(function (Receipt) {
			// проверка, что результат
			// indexOf is *не* равен -1
			if (Receipt.tags.indexOf(tag) !== -1) { 
				mealsWithTag.push(Receipt.description);
			}
		});
		// мы связываем каждый тег с объектом, который содержит название тега и массив
		return { "name": tag, "meals": mealsWithTag };
	});
	return tagObjects;
};

var addMealToMenu = function (Receipt, callback) {
	var $mealListItem = $("<li>").text(Receipt.description),
		$mealEditLink = $("<a>").attr("href", "/meals/" + Receipt._id),
		$mealReturnLink = $("<a>").attr("href", "/meals/" + Receipt._id);

	$mealEditLink.addClass("linkEdit");
	$mealReturnLink.addClass("linkRemove");

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
					// location.reload();
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
				// location.reload();
				callback();
			}).fail(function (err) {
				console.log("Произошла ошибка: " + err);
			});
			return false;
		});
		$mealListItem.append($mealReturnLink);
	}

	return $mealListItem;
}

var main = function (mealObjects) {
	"use strict";
	// создание пустого массива с вкладками
	var tabs = [];

	// добавляем вкладку Меню
	tabs.push({
		"name": "Все наши меню",
		"content": function(callback) {
			var arr = [];
			var $content = $("<ul>");
			$.getJSON("/menus.json", function (menusObjects) {
				console.log("вызов 1");
				for (var i = menusObjects.length-1; i>=0; i--) {
					let size = menusObjects[i].meals.length;
					// console.log(size);	
					if (size != 0) { arr.push(menusObjects[i]);	 }
				}
				// console.log(arr);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});

			$.getJSON("/meals.json", function (mealsObjects) {	
				console.log("вызов 2");
				for (var i = arr.length-1; i>=0; i--) {
					var $textInput = $("<h3>").text(arr[i].nameOfMenu);
					$textInput.addClass("nameOfMenu");
					let id = arr[i]._id
					$content.append($textInput);
					for (var j = 0; j<=mealsObjects.length-1; j++) {
						if (mealsObjects[j].owner == id) {
							console.log("вызов 3");
							var $mealListItem = addMealToMenu(mealsObjects[j], function() {
								console.log("вызов 4");
								$(".tabs a:first-child span").trigger("click");
								console.log("есть нажатие");
							});
							var $text = $("<p>").text("");
							var $ingredients = $("<li>").text("Состав: " + mealsObjects[j].tags);
							var $price = $("<li>").text("Цена: " + mealsObjects[j].price + " рублей");
							$content.append($mealListItem);
							$content.append($ingredients);
							$content.append($price);
							$content.append($text);
						}
					}
					
				}
				callback(null, $content);
				
			}).done(function(responde) {
				callback(null, $content);
				console.log("responde : " + responde[0].textStatus);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	// добавляем вкладку Сегодня в меню
	tabs.push({
		"name": "Сегодня в продаже",
		"content": function(callback) {
			$.getJSON("/meals.json", function (mealObjects) {
				var $content;
				$content = $("<ul>");
				for (var i = 0; i < mealObjects.length; i++) {
					if (mealObjects[i].status === 'Есть в меню') {
						var $mealListItem = addMealToMenu(mealObjects[i], function() {
							$(".tabs a:nth-child(2) span").trigger("click");
						});
						var $text = $("<p>").text("");
						var $ingredients = $("<li>").text("Состав: " + mealObjects[i].tags);
						var $price = $("<li>").text("Цена: " + mealObjects[i].price + " рублей");
						$content.append($text);
						$content.append($mealListItem);
						$content.append($ingredients);
						$content.append($price);
					}
				}
				callback(null, $content);
			}).fail(function(jqXHR, textStatus, error) {
				callback(error, null);
			});
		}
	});

	// добавляем вкладку Нет в меню
	tabs.push({
		"name": "Нет в продаже",
		"content": function(callback) {
			$.getJSON("/meals.json", function (mealObjects) {
				var $content;
				$content = $("<ul>");
				for (var i = 0; i < mealObjects.length; i++) {
					if (mealObjects[i].status === 'Сегодня не в меню') {
						var $mealListItem = addMealToMenu(mealObjects[i], function() {
							$(".tabs a:nth-child(3) span").trigger("click");
						});
						var $text = $("<p>").text("");
						var $ingredients = $("<li>").text("Состав: " + mealObjects[i].tags);
						var $price = $("<li>").text("Цена: " + mealObjects[i].price + " рублей");
						$content.append($text);
						$content.append($mealListItem);
						$content.append($ingredients);
						$content.append($price);
					}
				}
				callback(null, $content);
			}).fail(function(jqXHR, textStatus, error) {
				callback(error, null);
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
	$.getJSON("/meals.json", function (mealObjects) {
		var $userPhoto;
		var login  = Cookies.get('CurrentUser'); 
		var pathToImgOfUser = Cookies.get('PathToImgOfUser');
		console.log(pathToImgOfUser);
		
		$.ajax({
			url: pathToImgOfUser,
			type:'HEAD',
			error: function()
			{
				console.log("изображения нет!!!");
				pathToImgOfUser = "/images/user_default.png";
				$userPhoto = $("<img>").attr("src", pathToImgOfUser).addClass("main_image");
				$("header .image").append($userPhoto);
			},
			success: function()
			{
				console.log("изображение есть!!!");
				$userPhoto = $("<img>").attr("src", pathToImgOfUser).addClass("main_image");
				$("header .image").append($userPhoto);
			}
		});

		
		
		
		var $place = $("<p>").text("Здравствуйте, " + login + "!");
		$("header .username").append($place);
		console.log(login);
		main(mealObjects);
	});
});
