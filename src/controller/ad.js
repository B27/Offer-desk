const errorMessages = require("../../errorMessages");
const { fileName } = require("../utils");

const [Ad] = require("../emodels/ad");
const [Manufacturer] = require("../emodels/manufacturer");

async function postAd(ctx) {
    const { user } = ctx.state;

    if (!user || !user.id) {
        ctx.body = errorMessages.notAuthorized();
        ctx.status = 401;
        return;
    }

    const adData = ctx.request.body;
    const files = ctx.request.files;
    const newAdDoc = new Ad();
    const manDoc = await Manufacturer.findById(user.id);

    if (!manDoc) {
        ctx.body = errorMessages.userNotFound();
        ctx.status = 403;
        return;
    }

    delete adData.manufacturer;
    adData.manufacturer = user.id;
    newAdDoc.set(adData);

    if (files.photos) {
        if (!files.preview) {
            ctx.body = errorMessages.notEnoughPreview();
            ctx.status = 403;
            return;
        }
        newAdDoc.photos = files.photos.map(image => fileName(image.path));
        newAdDoc.preview = fileName(files.preview.path);
    }

    try {
        await newAdDoc.validate();
    } catch (error) {
        ctx.throw(400, error.message);
    }

    await newAdDoc.save({ validateBeforeSave: false });

    ctx.body = "OK";
    ctx.status = 200;
}

module.exports = {
    postAd
};
