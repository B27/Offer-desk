const Ad = require("../emodels/ad")[0];

module.exports = {
    async changeRating(ctx) {
        let doc = await Ad.findById(ctx.params._id);
        const R = doc.rating,
            N = doc.rateCount;
        doc.rating = (R * N + ctx.params.rating) / (N + 1);
        await doc.save();
        ctx.status = 200;
        ctx.body = doc;
    }
};
