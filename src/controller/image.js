const send = require("koa-send");
const { UPLOADDIR } = require("../../constants");

async function getImage(ctx) {
    await send(ctx, `/${ctx.params.image}`, { root: UPLOADDIR });
}

module.exports = {
    getImage
};
