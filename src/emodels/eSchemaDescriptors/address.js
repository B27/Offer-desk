const geoPointSchemaDescriptor = require("./geoPoint");
module.exports = {
    geo: geoPointSchemaDescriptor,
    address: { type: String },
    entrance: { type: String },
    apartment: { type: String }
};
