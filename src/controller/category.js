const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [producer] = require("../emodels/producer");

async function addCategory(ctx) {
    const { name } = ctx.request.body;
    const [image] = ctx.request.files;
    console.log("category name", name);

    console.log("category image", image);
}

module.exports = {
    addCategory
};
