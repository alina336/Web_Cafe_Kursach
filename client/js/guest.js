var organizeByTags = function (mealObjects) { 
	// создание пустого массива для тегов
	var tags = [];
	// перебираем все задачи meals 
	mealObjects.forEach(function (Receipt) {
		// перебираем все теги для каждой задачи 
		Receipt.tags.forEach(function (tag) {
			// убеждаемся, что этого тега еще нет в массиве
			if (tags.indexOf(tag) === -1) {  tags.push(tag); }
		});
	}); 
	var tagObjects = tags.map(function (tag) {
		// здесь мы находим все блюда с тегом
		var mealsWithTag = []; 
		mealObjects.forEach(function (Receipt) {
			if (Receipt.tags.indexOf(tag) !== -1) {  mealsWithTag.push(Receipt.description); }
		});
		// мы связываем каждый тег с объектом, который содержит название тега и массив
		return { "name": tag, "meals": mealsWithTag };
	});
	return tagObjects;
};

var mealListItem = function (Meal, callback) {
	var $content = $("<ul>");
	var $mealListItem = $("<li>");

	$mealListItem.text(Meal.description);

	var $image = $("<li align = center>");
	$content.append($image);
	let pathToImgOfMeal = Meal.pathToImg;
	$.ajax({
		url: pathToImgOfMeal,
		type:'HEAD',
		error: function() {
			pathToImgOfMeal = "/images/user_default.png";
			$image.append($("<img>").attr("src", pathToImgOfMeal).addClass("main_image"));
		},
		success: function() {
			$image.append($("<img>").attr("src", pathToImgOfMeal).addClass("main_image"));
		}
	});

	var $ingredients = $("<li>").text("Состав: " + Meal.tags);
	var $price = $("<li>").text("Цена: " + Meal.price + " рублей");
	$content.append($mealListItem);
	$content.append($ingredients);
	$content.append($price);
	return $content;
}

var main = function (mealObjects) {
	"use strict";
	// создание пустого массива с вкладками
	var tabs = [];
	// добавляем вкладку Меню
	tabs.push({
		"name": "Меню",
		"content": function(callback) {
			var arr = [];
			var $content = $("<ul>");
			$.getJSON("/menus.json", function (menusObjects) {
				for (var i = menusObjects.length-1; i>=0; i--) {
					let size = menusObjects[i].meals.length;
					if (size != 0) { arr.push(menusObjects[i]);	 }
				}
				callback(null);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});

			$.getJSON("/meals.json", function (mealsObjects) {	
				for (var i = arr.length-1; i>=0; i--) {
					var $textInput = $("<h3>").text(arr[i].nameOfMenu);
					$textInput.addClass("nameOfMenu");
					let id = arr[i]._id
					$content.append($textInput);
					
					for (var j = 0; j<=mealsObjects.length-1; j++) {
						if (mealsObjects[j].owner == id) {

							var $mealListItem = mealListItem(mealsObjects[j], function() {
								$(".tabs a:nth-child(1) span").trigger("click");
							});
							
							$content.append($mealListItem);
							$content.append($("<p>").text(""));
						}
					}
				}
				callback(null, $content);
			}).fail(function (jqXHR, textStatus, error) {
				callback(error, null);
			});
			
			
		}
	});

	// добавляем вкладку Сегодня в меню
	tabs.push({
		"name": "Сегодня в продаже",
		"content": function(callback) {
			// $.getJSON("/meals.json", function (mealObjects) {
				var arr = [];
				var $content = $("<ul>");
				$.getJSON("/menus.json", function (menusObjects) {
					for (var i = menusObjects.length-1; i>=0; i--) {
						let size = menusObjects[i].meals.length;
						if (size != 0) { arr.push(menusObjects[i]);	 }
					}
					callback(null);
				}).fail(function (jqXHR, textStatus, error) {
					callback(error, null);
				});


				$.getJSON("/meals.json", function (mealsObjects) {	
					for (var i = arr.length-1; i>=0; i--) {
						console.log("test 1");
						var $textInput = $("<h3>").text(arr[i].nameOfMenu);
						$textInput.addClass("nameOfMenu");
						let id = arr[i]._id
						$content.append($textInput);
						var count = 0;
						for (var j = 0; j<=mealsObjects.length-1; j++) {
							console.log("test 2");
							if (mealsObjects[j].status == 'Есть в меню' && mealsObjects[j].owner == id) {
								count++;
								var $mealListItem = mealListItem(mealsObjects[j], function() {
									$(".tabs a:nth-child(2) span").trigger("click");
								});
								
								$content.append($mealListItem);
								$content.append($("<p>").text(""));
							}
						}

						if (count == 0) {
							$content.append($("<p align=center>").text("сегодня из этого меню ничего нет :("));
						}
					}
					callback(null, $content);
				}).fail(function (jqXHR, textStatus, error) {
					callback(error, null);
				});

				callback(null, $content);
			
		}
	});

	// добавляем вкладку Поиск по ингредиентам
	tabs.push({
		"name": "Ингредиенты",
		"content":function (callback) {
			$.get("meals.json", function (mealObjects) {	
				// создание $content для Теги 
				var organizedByTag = organizeByTags(mealObjects), $content;
				organizedByTag.forEach(function (tag) {
					var $tagName = $("<h3>").text(tag.name);
						$content = $("<ul>");
					tag.meals.forEach(function (description) {
						var $li = $("<li>").text(description);
						$content.append($li);
					});
					$("main .content").append($tagName);
					$("main .content").append($content);
				});
				callback(null,$content);
			}).fail(function (jqXHR, textStatus, error) { callback(error, null); });
		}
	});

	tabs.forEach(function (tab) {
		var $aElement = $("<a>").attr("href",""),
			$spanElement = $("<span>").text(tab.name);
		$aElement.append($spanElement);
		$("main .tabs").append($aElement);

		$spanElement.on("click", function () {
			var $content;
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
	$.getJSON("menus.json", function (menusObjects) {
		var $place = $("<p>").text("Здравствуйте, гость!");
		$("header .username").append($place);
		// console.log(username);
		main(menusObjects);
	});
});
