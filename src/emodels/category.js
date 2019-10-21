const em = require("../em");
const category = require("./eSchemaDescriptors/category");
const { READ, WRITE } = require("../access");
const err = require("../../errorMessages");
const Offer = require("./offer")[0];

module.exports = em.eModel(
    "Category",
    em.eSchema(category, u => [READ, WRITE][+u.isAdmin], {
        getPostError: u => [err.mustBeTheAdmin(), null][+u.isAdmin],
        getDeleteError: async (u, id) => {
            if (!u.isAdmin) {
                return err.mustBeTheAdmin();
            }
            if (await Offer.findOne({ category: id })) {
                return err.categoryUsed();
            }
            return null;
        }
    })
);
