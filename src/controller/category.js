const path = require("path");
const os = require("os");
const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [producer] = require("../emodels/producer");

async function addCategory(ctx) {
    const { name } = ctx.request.body;
    const { image } = ctx.request.files;
    console.log("category name", name);

    console.log("category image", image);
    console.log(
        "image.path basename",
        os.platform() == "win32" ? path.win32.basename(image.path) : path.posix.basename(image.path)
    );

    ctx.status = 200;
}

module.exports = {
    addCategory
};
