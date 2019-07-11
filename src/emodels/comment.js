const em = require("../em");
const comment = require("./eSchemaDescriptors/comments");
module.exports = em.eModel("Comment", em.eSchema(comment))