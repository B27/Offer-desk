const em = require("../em");

const offer = require("./eSchemaDescriptors/offer");
module.exports = em.eModel("Offer", em.eSchema(offer));