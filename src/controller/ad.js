const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const [ad] = require("../emodels/ad");

async function getPhoto() {}

async function getPreview() {}

async function postAd(ctx) {
    console.log("fields: ", ctx.request.body);
    // => {username: ""} - if empty

    console.log("files: ", ctx.request.files);

    ctx.body = `
                <!doctype html>
                <html>
                <body>
                    Gooooooodd
                </body>
                </html>`;
}

module.exports = {
    getPhoto,
    getPreview,
    postAd
};
