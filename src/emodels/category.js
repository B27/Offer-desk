const em = require("../em");
const category = require("./eSchemaDescriptors/category");
module.exports = em.eModel("Category", em.eSchema(category))