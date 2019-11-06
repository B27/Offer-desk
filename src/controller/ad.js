const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const [Ad] = require("../emodels/ad");
const [Manufacturer] = require("../emodels/manufacturer");

async function postAd(ctx) {
    const { user } = ctx.state;

    if (!user || user.id) {
        ctx.body = errorMessages.notAuthorized();
        ctx.status = 401;
        return;
    }

    const adData = ctx.request.body;
    const newAdDoc = new Ad(adData);
    const manDoc = await Manufacturer.findById(user.id);

    if (!manDoc) {
        ctx.body = errorMessages.userNotFound();
        ctx.status = 403;
        return;
    }

    try {
        await newAdDoc.validate();
    } catch (error) {
        ctx.throw(400, error.message);
    }

    delete adData.manufacturer;
    adData.manufacturer = user.id;
    newAdDoc.set(adData);

    await newAdDoc.save({ validateBeforeSave: false });

    ctx.body = "OK";
    ctx.status = 200;
}

module.exports = {
    postAd
};
