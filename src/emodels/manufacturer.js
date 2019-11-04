const em = require("../em");
const manufacturer = require("./eSchemaDescriptors/manufacturer");
module.exports = em.eModel(
    "Manufacturer",
    em.eSchema(manufacturer, () => 2, {
        getUpdateError: (user, id) => {
            if (user.isAdmin) {
                return null;
            }
            if (id.toString() !== user.id) {
                return "you can't modify another manufacturer info";
            }
            return null;
        },
        getDeleteError: () => "manufacturer can't be deleted"
    })
);
