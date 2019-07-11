const em = require("../em");
const region = require("./eSchemaDescriptors/region");
module.exports = em.eModel("Region", em.eSchema(region))