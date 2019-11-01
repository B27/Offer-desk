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
            ctx.body = { cause: "adminConfirmed", message: errorMessages.userAlreadyRegistered() };
            ctx.status = 403;
            return;
        }

        if (oldManDoc.isSmsConfirmed) {
            ctx.body = { cause: "smsConfirmed", message: errorMessages.userNeedConfirmation() };
            ctx.status = 403;
            return;
        }

        await sendSmsToManufacturer(oldManDoc);

        for (const manField of Object.keys(manufacturerData)) {
            oldManDoc[manField] = manufacturerData[manField];
        }

        await oldManDoc.save({ validateBeforeSave: false });
        ctx.body = "manufacturer updated";
    } else {
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
    ctx.assert(manDoc.smsConfirmation.code, 404, errorMessages.smsCodeNotSent());

    if (manDoc.smsConfirmation.code !== smsCode) {
        ctx.body = { cause: "notMatch", message: errorMessages.smsCodeNotMatch() };
        ctx.status = 403;
        return;
    }

    if (Date.now() > manDoc.smsConfirmation.expirationDate.getTime()) {
        ctx.body = { cause: "expired", message: errorMessages.smsCodeExpired() };
        ctx.status = 403;
        return;
    }

    const { _id } = manDoc;
    const token = jwt.sign({ _id, type: "manufacturer" }, constants.JWTSECRET);
    manDoc.isSmsConfirmed = true;
    await manDoc.save();

    const { name } = manDoc;
    ctx.status = 200;
    ctx.body = { token, name };
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
