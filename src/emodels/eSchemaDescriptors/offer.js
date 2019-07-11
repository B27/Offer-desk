const Mongoose = require("mongoose");
const phoneNumberSchemaDescriptor = require("./phoneNumber");
const ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: ObjectId,
        required: true,
        ref: "Category",
        autopopulate: true
    },
    photos: { type: [String], file: { path: "photos", array: true } },
    price: { type: Number, required: true },
    producer: {
        type: ObjectId,
        required: true,
        ref: "Producer",
        autopopulate: true
    },
    region: {
        type: ObjectId,
        required: true,
        ref: "Region",
        autopopulate: true
    },
    phoneNumber: {
        ...phoneNumberSchemaDescriptor,
        required: true
    },
    rating: { type: Number, default: 0, system: true }
};

// OfferSchema.virtual("comments", {
//     ref: "Comment",
//     localField: "_id",
//     foreignField: "offer"
// });


// module.exports = Mongoose.model("Offer", OfferSchema);
