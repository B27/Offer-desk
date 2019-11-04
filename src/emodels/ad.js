const em = require("../em");

const ad = require("./eSchemaDescriptors/ad");
module.exports = em.eModel(
    "Ad",
    em.eSchema(ad, () => 2, {
        getPostError: function(user) {
            if (user.type === "manufacturer") {
                if (this.manufacturer.toString() !== user.id) {
                    return "You can't create ad as another manufacturer";
                }
                if (!user.isConfirmed) {
                    return "Manufacturer not confirmed";
                }
            }
            return null;
        },
        getUpdateError: function(user) {
            if (user.type === "manufacturer") {
                if (this.modifiedPaths().includes("manufacturer")) {
                    return "You can't change manufacturer after creation";
                }
                if (this.manufacturer.toString() !== user.id) {
                    return "You don't own this ad";
                }
            }
            return null;
        },
        getDeleteError: function(user) {
            if (user.type === "manufacturer") {
                if (this.manufacturer.toString() !== user.id) {
                    return "You don't own this ad";
                }
            }
            return null;
        }
    })
);
