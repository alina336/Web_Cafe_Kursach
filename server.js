const { request } = require('express');

var express = require('express'), 
    http = require("http"),
	// импорт представлений
	MealsController = require("./controllers/meals_controller.js"),
	UsersController = require("./controllers/users_controller.js"),
	MenuController = require("./controllers/menu_controller.js"),
    // импортируем библиотеку mongoose
    mongoose = require("mongoose"),
	database = 'Cafe'; //название хранилища в Mongo
    app = express();

// начинаем слушать запросы
http.createServer(app).listen(3000);

app.use('/',express.static(__dirname + "/client"));
app.use('/user/:username',express.static(__dirname + "/client"));

// командуем Express принять поступающие объекты JSON
app.use(express.urlencoded({ extended: true }));

// подключаемся к хранилищу данных в базе данных Mongo
mongoose.connect('mongodb://localhost/' + database, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true 
}).then(res => {
	console.log("DB Connected!")
}).catch(err => {
	console.log(Error, err.message);
});


// запросы для ВСЕХ блюд 
app.get("/meals.json", MealsController.index);
app.get("/meals/:id", MealsController.show); 
app.post("/meals", MealsController.create);
app.put("/meals/:id", MealsController.update);
app.delete("/meals/:id", MealsController.destroy);

// запросы для всех видов МЕНЮ
app.get("/menus.json", MenuController.index);
app.post("/menus", MenuController.create);
app.get("/menus/:id", MenuController.show); 
app.put("/menus/:id", MenuController.update);
app.delete("/menus/:id", MenuController.destroy);

// запросы для пользователей
app.get("/users.json", UsersController.index); 
app.post("/users", UsersController.create); 
app.get("/users/:login", UsersController.show);
app.put("/users/:login", UsersController.update);
app.delete("/users/:login", UsersController.destroy);