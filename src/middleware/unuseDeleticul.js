const { deleteUnusedFile } = require("../utils");
module.exports = async function(ctx, next) {
    try {
        await next();
    } finally {
        ctx.status;
        const files = ctx.request.files;
        if ((ctx.status < 200 || ctx.status >= 300) && files) {
            const fileFieldsArray = Object.keys(files);

            fileFieldsArray.forEach(fieldName => {
                if (Array.isArray(files[fieldName])) {
                    const filesArr = files[fieldName];

                    filesArr.forEach(file => {
                        deleteUnusedFile(file.path);
                    });
                } else {
                    deleteUnusedFile(files[fieldName].path);
                }
            });
        }
    }
};
