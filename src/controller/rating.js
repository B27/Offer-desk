const Offer = require("../emodels/offer")[0];

module.exports = {
    async changeRating(ctx) {
        let doc = await Offer.findById(ctx.params._id);
        const R = doc.rating,
            N = doc.rateCount;
        doc.rating = (R * N + ctx.params.rating) / (N + 1);
        doc.save();
        ctx.status = 200;
        ctx.body = doc;
    }
};
