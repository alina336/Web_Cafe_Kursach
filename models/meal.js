var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.Types.ObjectId;
	// mongoose.Schema.Types.Buffer
// Это модель mongoose для списка блюд меню
var MealSchema = mongoose.Schema({
	description: String,
	status : String,
	price : Number,
	tags: [ String ],
	pathToImg : String,
	owner : { type: ObjectId, ref: "Menu" }
});

var Meal = mongoose.model("Meal", MealSchema); 
module.exports = Meal;