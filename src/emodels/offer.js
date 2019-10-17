const em = require("../em");

const offer = require("./eSchemaDescriptors/offer");
module.exports = em.eModel(
    "Offer",
    em.eSchema(offer, () => 2, {
        getPostError: function(user) {
            if (user.type === "producer") {
                if (this.producer.toString() !== user._id)
                    return "You can't create offer as another producer";
                if (!user.isConfirmed) return "Producer can't be confirmed";
            }
            return null;
        },
        getUpdateError: function(user) {
            if (user.type === "producer") {
                if (this.modifiedPaths().includes("producer"))
                    return "You can't change producer after creation";
                if (this.producer.toString() !== user._id) return "You don't own this offer";
            }
            return null;
        },
        getDeleteError: function(user) {
            if (user.type === "producer") {
                if (this.producer.toString() !== user._id) return "You don't own this offer";
            }
            return null;
        }
    })
);
