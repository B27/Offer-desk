const Mongoose = require("mongoose");
const ObjectId = Mongoose.Schema.Types.ObjectId;

const CommentSchema = Mongoose.Schema({
    offer: { type: ObjectId, required: true , ref:"Offer" },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
},{
    timestamps:true
});

module.exports = Mongoose.model("Comment", CommentSchema,"Comment");
