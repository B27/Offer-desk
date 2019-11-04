const em = require("../em");
const category = require("./eSchemaDescriptors/category");
const { READ, WRITE } = require("../access");
const err = require("../../errorMessages");
const Ad = require("./ad")[0];

module.exports = em.eModel(
    "Category",
    em.eSchema(category, user => [READ, WRITE][+user.isAdmin], {
        getPostError: user => [err.mustBeTheAdmin(), null][+user.isAdmin],
        getDeleteError: async (user, id) => {
            if (!user.isAdmin) {
                return err.mustBeTheAdmin();
            }
            if (await Ad.findOne({ category: id })) {
                return err.categoryUsed();
            }
            return null;
        }
    })
);
