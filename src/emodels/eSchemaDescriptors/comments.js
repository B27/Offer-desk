const Mongoose = require("mongoose");
const ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = {
    ad: { type: ObjectId, required: true, ref: "Ad" },
    senderName: { type: String, required: true },
    text: { type: String, required: true }
};
