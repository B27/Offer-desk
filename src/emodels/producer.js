const em = require("../em");
const producer = require("./eSchemaDescriptors/producer");
module.exports = em.eModel(
    "Producer",
    em.eSchema(producer, () => 2, {
        getUpdateError: (u, id) => {
            if (u.isAdmin) {
                return null;
            }
            if (id.toString() !== u._id) {
                return "you can't modify another producer info";
            }
            return null;
        },
        getDeleteError: () => "producer can't be deleted"
    })
);
