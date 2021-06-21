// обратите внимание на то, что нужно перейти в папку, 
// в которой находится каталог models
var Meal = require("../models/meal.js"),
	User = require("../models/user.js"),
	MealsController = {};

MealsController.index = function (req, res) { 
	console.log('Вызвано действие: MealsController.index');
	Meal.find(function (err, meals) {
		if (err !== null) { res.json(500, err); } 
		else { res.status(200).json(meals); }
	});	
};

MealsController.create = function (req, res) {

	console.log('Вызвано действие: создать блюдо ' + req.body.description);
	var description = req.body.description;
	 	status = req.body.status,
	 	price = req.body.price,
	 	tags = req.body.tags,
		pathToImg = req.body.pathToImg;

	Meal.find({"description": description}, function (err, result) {
	    if (err) { console.log(err); res.send(500, err); } 
		else if (result.length !== 0) {
			res.status(501).send("Блюдо уже существует");
	        console.log(err);   
	        console.log("Блюдо уже существует"); 
	    } 
		else {
			// создание нового блюда
			var newMeal = new Meal({
				"description": description,
				"status" : status,
				"price" : price,
				"tags": tags,
				"pathToImg" : pathToImg,
				"owner" : null
			});
			newMeal.save(function (err, result) {
				console.log(result);
				if (err !== null) { console.log(err); res.json(500, err); } 
				else { res.status(200).json(result); }
			});
	    }
	}); 


};

MealsController.show = function (req, res) {
	console.log('Вызвано действие: отобразить блюдо ' + req.params.description);
	// это ID, который мы отправляем через URL
	var id = req.params.id;
	// находим блюдом с этим ID 
	Meal.find({"_id":id}, function (err, Meal) {
		if (err) { console.log(err); } 
		else if (err !== null) { res.status(500).json(err); } 
		else {
			if (Meal.length !== 0) { res.status(200).json(Meal[0]); } 
			else { res.sendStatus(404); }
		}
	});
};

MealsController.destroy = function (req, res) {
	var id = req.params.id;
	Meal.deleteOne({"_id": id}, function (err, Meal) {
		if (err !== null) { res.status(500).json(err); } 
		else {
			if (Meal.n === 1 && Meal.ok === 1 && Meal.deletedCount === 1) { res.status(200).json(Meal); } 
			else { res.status(404).json({"status": 404}); }
		}
	});
}

MealsController.update = function (req, res) {
	var id = req.params.id;
	console.log('Вызвано действие: обновить блюдо ' + id);
	var newDescription = {$set: {description: req.body.description, status: req.body.status, owner: req.body.owner || null}};
	Meal.updateOne({"_id": id}, newDescription, function (err,Meal) {
		if (err !== null) { res.status(500).json(err); } 
		else {
			if (Meal.n === 1 && Meal.nModified === 1 && Meal.ok === 1) { res.status(200).json(Meal); } 
			else { res.status(404).json({"status": 404}); }
		}
	});
}

module.exports = MealsController;