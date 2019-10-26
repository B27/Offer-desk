const em = require("../em");
const manufacturer = require("./eSchemaDescriptors/manufacturer");
module.exports = em.eModel(
    "Manufacturer",
    em.eSchema(manufacturer, () => 2, {
        getUpdateError: (u, id) => {
            if (u.isAdmin) {
                return null;
            }
            if (id.toString() !== u._id) {
                return "you can't modify another manufacturer info";
            }
            return null;
        },
        getDeleteError: () => "manufacturer can't be deleted"
    })
);
