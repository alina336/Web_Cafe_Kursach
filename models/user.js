var mongoose = require("mongoose");
// Это модель Mongoose для пользователей
var UserSchema = mongoose.Schema({
	username: String, //имя пользователя 
	login: String, //Логин для входа
	password : String,
	pathToImg : String,
	usertype: Number //0 - сотрудник, 1 - админ
});
var User = mongoose.model("User", UserSchema);
module.exports = User;