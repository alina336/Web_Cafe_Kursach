var Menu = require("../models/menu.js"),
    Meal = require("../models/meal.js"),
	User = require("../models/user.js"),
	MenuController = {};


MenuController.index = function (req, res) { 
	console.log('Вызвано действие: MenuController.index');
	Menu.find(function (err, menus) {
		if (err !== null) { res.json(500, err); } 
		else { res.status(200).json(menus); }
	});
};

MenuController.create = function (req, res) {
	console.log('Вызвано действие: создать новое меню ' + req.body.nameOfMenu);
	var nameOfMenu = req.body.nameOfMenu;
	var meals = req.body.meals
	Menu.find({"nameOfMenu": nameOfMenu}, function (err, result) {
	    if (err) { console.log(err); res.send(500, err); } 
		// else if (result.length !== 0) {
		// 	res.status(501).send("Такое Меню уже существует");
	    //     console.log(err);   
	    //     console.log("Меню уже существует"); 
	    // } 
		else {
			// создание нового меню
	        var newMenu = new Menu({"nameOfMenu" : nameOfMenu, "meals" : meals});
	        newMenu.save(function(err, result) {
	            console.log(err); 
	            if (err !== null) { res.json(500, err);  } 
				else { res.json(200, result); console.log(result);  }
	        });
	    }
	}); 
};

MenuController.show = function (req, res) {
	console.log('Вызвано действие: отобразить меню ' + req.params.id);
	// это ID, который мы отправляем через URL
	var id = req.params.id;
	Menu.find({"_id" : id}, function (err, result) {
		if (err) { console.log(err); } 
		else if (err !== null) { res.status(500).json(err); } 
		else {
			if (result.length > 0) { res.status(200).json(result[0]); } 
			else { res.send(404); }
		}
	});
};



MenuController.destroy = function (req, res) {
	var id = req.params.id;
	console.log("Вызвано действие: удалить меню " + id);
	Menu.deleteOne({"_id" : id}, function (err, result) {
		if (err !== null) { res.status(500).json(err); } 
		else {
			// console.log(result.n);
			// console.log(result.ok);
			// console.log(result.deletedCount);
			if (result.n === 1 && result.ok === 1 && result.deletedCount === 1) { res.status(200).json(result); } 
			else { res.status(404).json({"status": 404}); }
		}
	});
}

MenuController.update = function (req, res) {
	var id = req.params.id;
	console.log('Вызвано действие: обновить меню ' + id);
	var newMenu = {$set: {nameOfMenu: req.body.nameOfMenu, meals: req.body.meals || []}};
	Menu.updateOne({"_id": id}, newMenu, function (err,result) {
		if (err !== null) { 
			console.log(err);
			res.status(500).json(err); }
		else {
			if (result.n === 1 && result.nModified === 1 && result.ok === 1) { res.status(200).json(result); } 
			else { res.status(404).json({"status": 404}); }
		}
	});
}

module.exports = MenuController;