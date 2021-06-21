// обратите внимание на то, что нужно перейти в папку, 
// в которой находится каталог models
var User = require("../models/user.js"), 
	Meal = require("../models/meal.js"),
	UsersController = {};

UsersController.index = function (req, res) { 
	console.log('Вызвано действие: UsersController.index');
	User.find(function (err, users) {
		if (err !== null) { res.json(500, err); } 
		else { res.status(200).json(users); }
	});
};

// Отобразить пользователя (админ и сотрудник)
UsersController.show = function(req, res) {
	console.log('Вызвано действие: отобразить пользователя ' + req.params.login);
	User.find({'login': req.params.login}, function(err, result) {
		if (err) { console.log(err); } 
		else if (result.length !== 0) {
			// открыть страницу админа или сотрудника?
			if (req.params.login == "admin") { res.sendfile('./client/admin.html'); } 
			else { res.sendfile('./client/worker.html'); }
		} 
		else { res.sendStatus(404); }
	});
};

// Создать нового пользователя 
UsersController.create = function(req, res) {
	console.log('Вызвано действие: создать пользователя ' + req.body.login);
	var username = req.body.username;
	var login  = req.body.login;
	var password  = req.body.password;
	var img = req.body.pathToImg;
	console.log(username + ", " + login) + ", " + password;
	User.find({"login": login}, function (err, result) {
	    if (err) { console.log(err); res.send(500, err); } 
		else if (result.length !== 0) {
			res.status(501).send("Пользователь уже существует");
	        console.log(err);   
	        console.log("Пользователь уже существует"); 
	    } 
		else {
			// создание нового пользователя
	        var newUser = new User({ "login": login, "username": username, "password": password, "pathToImg" : img});
	        newUser.save(function(err, result) {
	            console.log(err); 
	            if (err !== null) { res.json(500, err);  } 
				else { res.json(200, result); console.log(result);  }
	        });
	    }
	}); 
};

// Обновить логин существующего пользователя 
UsersController.update = function (req, res) { 
	console.log("Вызвано действие: обновить пользователя");
	var login = req.params.login;
	console.log("Старое имя пользователя: " + username);
	var newLogin = {$set: {login: req.body.login}};
	console.log("Новый логин пользователя: " + newLogin);
	User.updateOne({"login": login}, newLogin, function (err,user) {
		if (err !== null) { res.status(500).json(err); } 
		else {
			if (user.n === 1 && user.nModified === 1 && user.ok === 1) {
				console.log('Пользователь изменен');
				res.status(200).json(user);
			} 
			else { res.status(404); }
		}
	});
};

// Удалить существующего пользователя 
UsersController.destroy = function (req, res) { 
	console.log("Вызвано действие: удалить пользователя");
	var login = req.params.login;
	User.find({"login": login}, function (err, result) {
		if (err) { console.log(err); res.send(500, err); } 
		else if (result.length !== 0) {
        	console.log("Удаляем все блюда, созданные с 'owner': " + result[0]._id);
			// удалять блюда, созданные сотрудником необязательно, это может сделать и админ
			User.deleteOne({"login": login}, function (err, user) {
				if (err !== null) { res.status(500).json(err); } 
				else {
					if (user.n === 1 && user.ok === 1 && user.deletedCount === 1) { res.status(200).json(user); } 
					else { res.status(404).json({"status": 404}); }
				}
			});
        } 
		else { res.status(404).send("Пользователь не существует"); console.log(err);    }
	});
}

module.exports = UsersController;