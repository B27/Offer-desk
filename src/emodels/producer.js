const em = require("../em");
const producer = require("./eSchemaDescriptors/producer");
module.exports = em.eModel("Producer", em.eSchema(producer))