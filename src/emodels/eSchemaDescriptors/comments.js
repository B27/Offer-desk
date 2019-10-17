const Mongoose = require("mongoose");
const ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = {
    offer: { type: ObjectId, required: true, ref: "Offer" },
    senderName: { type: String, required: true },
    text: { type: String, required: true }
};
