const path = require("path");
const errorMessages = require("../../errorMessages");
const [Category] = require("../emodels/category");
const { fileName } = require("../utils");

async function addCategory(ctx) {
    const { name: categoryName } = ctx.request.body;
    const image = ctx.request.files && ctx.request.files.image;

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());

    const imageName = image && fileName(image.path);

    const saveCategoryResult = await Category.create({ name: categoryName, image: imageName });
    saveCategoryResult.image = `${saveCategoryResult.image}`;
    ctx.body = saveCategoryResult.toJSON({ user: ctx.state.user });
    ctx.status = 200;
}

async function updateCategory(ctx) {
    const { id: categoryId } = ctx.query;
    const { name: categoryName } = ctx.request.body;
    const image = ctx.request.files && ctx.request.files.image;

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());

    const imageName = image && fileName(image.path);

    const saveCategoryResult = await Category.create({ name: categoryName, image: imageName });
    saveCategoryResult.image = `${saveCategoryResult.image}`;
    ctx.body = saveCategoryResult.toJSON({ user: ctx.state.user });
    ctx.status = 200;
}

module.exports = {
    addCategory,
    updateCategory
};
