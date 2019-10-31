const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [Manufacturer] = require("../emodels/manufacturer");

function generateSmsCode() {
    return ("00000" + Math.random() * 1000000).slice(-6);
}

async function saveManufacturerSendSms(ctx) {
    const manufacturerData = ctx.request.body;
    const newManDoc = new Manufacturer(manufacturerData);

    try {
        await newManDoc.validate();
    } catch (error) {
        ctx.throw(400, error.message);
    }

    let oldManDoc = await Manufacturer.findOne({ phoneNumber: manufacturerData.phoneNumber });

    if (oldManDoc) {
        if (oldManDoc.isConfirmed) {
            ctx.throw(405, errorMessages.userAlreadyRegistered());
        }

        if (oldManDoc.isSmsConfirmed) {
            ctx.throw(403, errorMessages.userNeedConfirmation());
        }

        // send sms code methods

        for (const manField of Object.keys(manufacturerData)) {
            oldManDoc[manField] = manufacturerData[manField];
        }

        await oldManDoc.save({ validateBeforeSave: false });
        ctx.body = "manufacturer updated";
    } else {
        // send sms code methods
        await sendSmsToManufacturer(newManDoc);
        await newManDoc.save({ validateBeforeSave: false });
        ctx.body = "manufacturer saved";
    }

    ctx.status = 200;
}

async function sendSmsToManufacturer(manDoc) {
    // methods for send sms to user
    const code = generateSmsCode();
    const expirationDate = Date.now() + constants.SMS_CODE_TIME_LIMIT;

    manDoc.smsConfirmation = { code, expirationDate };
}

async function enterPhoneNumber(ctx) {
    const { phoneNumber } = ctx.request.body;
    let doc = await Manufacturer.findOne({ phoneNumber });
    ctx.assert(doc, 404, errorMessages.userNotFound(phoneNumber));
    await doc
        .set({
            smsConfirmation: process.env.development
                ? constants.SMS_CODE_DEFAULT_DEV_CODE
                : generateSmsCode()
        })
        .save();

    // //Delete code after timeout
    // setTimeout(
    //     () => manufacturer.findOneAndUpdate({ phoneNumber }, { smsConfirmation: undefined }),
    //     constants.SMS_CODE_TIME_LIMIT
    // );

    ctx.status = 200;
    ctx.body = "OK";
}

async function enterCode(ctx) {
    const { phoneNumber, smsCode } = ctx.request.body;
    let manDoc = await Manufacturer.findOne({ phoneNumber });

    ctx.assert(phoneNumber && smsCode, 404, errorMessages.validationError());
    ctx.assert(manDoc, 404, errorMessages.userNotFound(phoneNumber));
    ctx.assert(manDoc.smsConfirmation, 404, errorMessages.smsCodeNotSended());

    if (manDoc.smsConfirmation.code !== smsCode) {
        ctx.body = { cause: "notMatch", message: errorMessages.smsCodeIncorrect() };
        ctx.throw(403);
    } else if (Date.now() > manDoc.smsConfirmation.expirationDate.getTime()) {
        ctx.body = { cause: "expired", message: errorMessages.smsCodeExpired() };
        ctx.throw(403);
    } else {
        const { _id } = manDoc;
        const token = jwt.sign({ _id, type: "manufacturer" }, constants.JWTSECRET);
        manDoc.isSmsConfirmed = true;
        await manDoc.save();

        ctx.status = 200;
        ctx.body = { token, ...manDoc.toObject() };
    }
}

function refreshToken(ctx) {
    const { user } = ctx.state;
    if (user) {
        ctx.status = 200;
        ctx.body = { token: jwt.sign(user, constants.JWTSECRET), ...user };
    }
}

module.exports = {
    saveManufacturerSendSms,
    refreshToken,
    enterPhoneNumber,
    enterCode
};
