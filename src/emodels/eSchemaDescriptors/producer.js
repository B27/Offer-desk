const Mongoose = require("mongoose");
const phoneNumberSchemaDescriptor = require("./phoneNumber");
const ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = {
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
    region: {
        type: ObjectId,
        ref: "Region",
        required: true,
        autopopulate: true
    },

    isConfirmed: {
        type: Boolean,
        default: false,
        access: u => [1, 2][+u.isAdmin]
    },

    smsCode: { type: String, system: true }
};

// module.exports = Mongoose.model("Producer", ProducerSchema);
