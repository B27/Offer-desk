const errorMessages = require("../../errorMessages");
const [Category] = require("../emodels/category");
const { fileName, deleteUplodadedFile } = require("../utils");

async function addCategory(ctx) {
    const { name: categoryName } = ctx.request.body;
    const image = ctx.request.files && ctx.request.files.image;

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());
    ctx.assert(categoryName && image, 404, errorMessages.needMoreData());

    const imageName = image && fileName(image.path);

    const saveCategoryResult = await Category.create({ name: categoryName, image: imageName });
    ctx.body = saveCategoryResult.toJSON({ user: ctx.state.user });
    ctx.status = 200;
}

async function updateCategory(ctx) {
    const { id: categoryId } = ctx.query;
    const { name: categoryName } = ctx.request.body;
    const image = ctx.request.files && ctx.request.files.image;
    const imageName = image && fileName(image.path);

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());

    if (!(categoryId && (categoryName || image))) {
        ctx.body = errorMessages.needMoreData();
        ctx.status = 404;
        return;
    }

    const categoryDoc = await Category.findById(categoryId);

    if (image && categoryDoc.image) {
        deleteUplodadedFile(categoryDoc.image);
    }

    categoryName && categoryDoc.set("name", categoryName);
    imageName && categoryDoc.set("image", imageName);

    await categoryDoc.save();
    ctx.body = categoryDoc.toJSON({ user: ctx.state.user });
    ctx.status = 200;
}

async function removeCategory(ctx) {
    const { id: categoryId } = ctx.query;

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());
    ctx.assert(categoryId, 404, errorMessages.needMoreData());

    const categoryDoc = await Category.findById(categoryId);

    if (categoryDoc.image) {
        deleteUplodadedFile(categoryDoc.image);
    }

    categoryDoc.delete();

    ctx.body = "OK";
    ctx.status = 200;
}

module.exports = {
    addCategory,
    updateCategory,
    removeCategory
};
