const path = require("path");
const os = require("os");
const errorMessages = require("../../errorMessages");
const [Category] = require("../emodels/category");

async function addCategory(ctx) {
    const categoryName = ctx.request.body.name;
    const image = ctx.request.files && ctx.request.files.image;

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());

    const imageName =
        image &&
        (os.platform() === "win32"
            ? path.win32.basename(image.path)
            : path.posix.basename(image.path));

    const saveCategoryResult = await Category.create({ name: categoryName, image: imageName });
    saveCategoryResult.image = `${saveCategoryResult.image}`;
    ctx.body = saveCategoryResult.toJSON({ user: ctx.state.user });
    ctx.status = 200;
}

module.exports = {
    addCategory
};
