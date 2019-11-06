const Mongoose = require("mongoose");
const phoneNumberSchemaDescriptor = require("./phoneNumber");
const ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: ObjectId,
        required: true,
        ref: "Category"
        // autopopulate: true
    },
    photos: { type: [String], file: { path: "photos", array: true } },
    preview: { type: String },
    price: { type: String },
    manufacturer: {
        type: ObjectId,
        required: true,
        ref: "Manufacturer"
        // autopopulate: true
    },
    region: {
        type: ObjectId,
        required: true,
        ref: "Region"
        // autopopulate: true
    },
    phoneNumber: {
        ...phoneNumberSchemaDescriptor,
        required: true
    },
    rating: { type: Number, default: 0, access: () => 1 },
    rateCount: { type: Number, default: 0, access: () => 1 },
    createdAt: { type: Date, index: true }
};

// new Mongoose.Schema({
//     publicationDate: { type: Number, index: true, default: Date.now }
// });

// AdSchema.virtual("comments", {
//     ref: "Comment",
//     localField: "_id",
//     foreignField: "ad"
// });

// module.exports = Mongoose.model("Ad", AdSchema);
