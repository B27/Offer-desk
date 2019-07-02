const Mongoose = require("mongoose");
const phoneNumberSchemaDescriptor = require("./schema/phoneNumber");
const ObjectId = Mongoose.Schema.Types.ObjectId;

const OfferSchema = Mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: ObjectId, required: true, ref: "Category" },
        photos: [String],
        price: { type: Number, required: true },
        producer: { type: ObjectId, required: true, ref: "Producer" },
        region: { type: ObjectId, required: true, ref: "Region" },
        phoneNumber: {
            ...phoneNumberSchemaDescriptor,
            required: true
        },

        rating: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

OfferSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "offer"
});

OfferSchema.post("find", async function(docs) {
    for (let doc of docs) {
        await doc
            .populate("category")
            .populate("producer")
            .populate("region")
            .populate("comments")
            .execPopulate();
    }
});
OfferSchema.post("save", async function() {
    await this.populate("category")
        .populate("producer")
        .populate("region")
        .populate("comments")
        .execPopulate();
});

module.exports = Mongoose.model("Offer", OfferSchema);
