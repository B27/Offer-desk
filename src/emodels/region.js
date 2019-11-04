const { READ, WRITE } = require("../access");
const err = require("../../errorMessages");
const em = require("../em");
const region = require("./eSchemaDescriptors/region");

const Ad = require("./ad")[0];
const Manufacturer = require("./manufacturer")[0];

module.exports = em.eModel(
    "Region",
    em.eSchema(region, user => [READ, WRITE][+user.isAdmin], {
        getPostError: user => [err.mustBeTheAdmin(), null][+user.isAdmin],
        getDeleteError: async (user, id) => {
            if (!user.isAdmin) {
                return err.mustBeTheAdmin();
            }
            // console.log(Ad.findOne({region:id}),Manufacturer.findOne({region:id}))
            if (
                (await Ad.findOne({ region: id })) ||
                (await Manufacturer.findOne({ region: id }))
            ) {
                return err.regionUsed();
            }
            return null;
        }
    })
);
