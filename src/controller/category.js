const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [producer] = require("../emodels/producer");

async function addCategory(ctx) {
    const {} = ctx.request.body;
}

module.exports = {
    addCategory
};
