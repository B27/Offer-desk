const Mongoose = require("mongoose");

const CategorySchema = Mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true }
});

module.exports = Mongoose.model("Category", CategorySchema);
