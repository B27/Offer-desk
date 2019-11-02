const Mongoose = require("mongoose");
const phoneNumberSchemaDescriptor = require("./phoneNumber");
const ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = {
    phoneNumber: {
        ...phoneNumberSchemaDescriptor,
        required: true,
        index: true,
        unique: true
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
        required: true
        // autopopulate: true
    },

    isConfirmed: {
        type: Boolean,
        default: false,
        access: u => [1, 2][+u.isAdmin]
    },

    isSmsConfirmed: {
        type: Boolean,
        default: false
    },

    smsConfirmation: {
        code: { type: String, system: true },
        expirationDate: { type: Date, system: true },
        attempts: { type: Number, system: true, default: 0 },
        // используется для того, чтобы проверять, сброшен ли код авторизации
        // при каждом новом заросе на авторизацию в этом поле должно быть
        // новое случайное число
        check: { type: Number, system: true }
    }
};

// module.exports = Mongoose.model("Manufacturer", ManufacturerSchema);
