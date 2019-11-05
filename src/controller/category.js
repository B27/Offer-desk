const fs = require("fs").promises;
const errorMessages = require("../../errorMessages");
const [Category] = require("../emodels/category");
const { fileName } = require("../utils");
const { UPLOADDIR } = require("../../constants");

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
    let imageName;

    ctx.assert(ctx.state.user.isAdmin, 403, errorMessages.mustBeTheAdmin());
    ctx.assert(categoryId && (categoryName || image), 404, errorMessages.needMoreData());

    const categoryDoc = await Category.findById(categoryId);

    if (image) {
        await fs.unlink(`${UPLOADDIR}/${categoryDoc.image}`);
        imageName = fileName(image.path);
    }

    categoryDoc.set({ name: categoryName, image: imageName });

    await categoryDoc.save();
    ctx.body = categoryDoc.toJSON({ user: ctx.state.user });
    ctx.status = 200;
}

module.exports = {
    addCategory,
    updateCategory
};
