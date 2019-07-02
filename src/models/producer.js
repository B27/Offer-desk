const Mongoose = require("mongoose");
const phoneNumberSchemaDescriptor = require("./schema/phoneNumber");
const ObjectId = Mongoose.Schema.Types.ObjectId;

const ProducerSchema = Mongoose.Schema({
    phoneNumber: {
        ...phoneNumberSchemaDescriptor,
        required: true
    },
    feedbackPhoneNumber: {
        ...phoneNumberSchemaDescriptor,
        required: true
    },
    name: { type: String, required: true },
    productionDescription: { type: String, required: true },
    region: { type: ObjectId, ref: "Region", required: true },

    isConfirmed: { type: Boolean, default: false },

    smsCode: { type: String }
});

ProducerSchema.post("find", async function(docs) {
    for (let doc of docs) {
        await doc.populate("region").execPopulate();
    }
});

module.exports = Mongoose.model("Producer", ProducerSchema);
