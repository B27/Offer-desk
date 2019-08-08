const em = require("../em");
const comment = require("./eSchemaDescriptors/comments");
const err = require('../../errorMessages');

module.exports = em.eModel(
    "Comment", 
    em.eSchema(
        comment,
        u => 2,
        {
            getDeleteError: err.commentDeleteError,
            getUpdateError: err.commentPatchError
        }
    )
)