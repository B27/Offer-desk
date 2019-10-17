const { READ, WRITE } = require("../access");
const err = require("../../errorMessages");
const em = require("../em");
const region = require("./eSchemaDescriptors/region");

const Offer = require("./offer")[0];
const Producer = require("./producer")[0];

module.exports = em.eModel(
    "Region",
    em.eSchema(region, u => [READ, WRITE][+u.isAdmin], {
        getPostError: u => [err.mustBeTheAdmin(), null][+u.isAdmin],
        getDeleteError: async (u, id) => {
            if (!u.isAdmin) return err.mustBeTheAdmin();
            // console.log(Offer.findOne({region:id}),Producer.findOne({region:id}))
            if ((await Offer.findOne({ region: id })) || (await Producer.findOne({ region: id })))
                return err.regionUsed();
            return null;
        }
    })
);
