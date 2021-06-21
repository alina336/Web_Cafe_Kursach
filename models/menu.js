var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.Types.ObjectId;
	
// Это модель mongoose для меню, состоящего из списка блюд
var MenuSchema = mongoose.Schema({
	nameOfMenu: String,
	meals : [ {type: ObjectId, ref: "Meal"} ]
});

var Menu = mongoose.model("Menu", MenuSchema); 
module.exports = Menu;