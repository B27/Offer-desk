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

        // for (const manField of Object.keys(manufacturerData)) {
        //     oldManDoc[manField] = manufacturerData[manField];
        // }
        oldManDoc.set(manufacturerData);

        ctx.body = "manufacturer updated";
    } else {
        await sendSmsToManufacturer(newManDoc);

        ctx.body = "manufacturer saved";
    }

    ctx.status = 200;
}

async function sendSmsToManufacturer(manDoc) {
    // methods for send sms to user
    const code = generateSmsCode();
    const expirationDate = Date.now() + constants.SMS_CODE_TIME_LIMIT;

    manDoc.smsConfirmation = { code, expirationDate };
    await manDoc.save({ validateBeforeSave: false });
}

async function enterPhoneNumber(ctx) {
    const { phoneNumber } = ctx.request.body;
    let manDoc = await Manufacturer.findOne({ phoneNumber });

    if (!manDoc) {
        ctx.body = { cause: "notFound", message: errorMessages.userNotFound(phoneNumber) };
        ctx.status = 404;
        return;
    }

    await sendSmsToManufacturer(manDoc);

    ctx.status = 200;
    ctx.body = "OK";
}

async function enterCode(ctx) {
    const { phoneNumber, smsCode } = ctx.request.body;
    ctx.assert(phoneNumber && smsCode, 404, errorMessages.needMoreData());

    let manDoc = await Manufacturer.findOne({ phoneNumber });
    ctx.assert(manDoc, 404, errorMessages.userNotFound(phoneNumber));

    await Manufacturer.findOneAndUpdate(
        { phoneNumber },
        { $inc: { "smsConfirmation.attempts": 1 } }
    );
    const attempts = manDoc.smsConfirmation.attempts + 1;

    if (Date.now() > manDoc.smsConfirmation.expirationDate.getTime()) {
        ctx.body = { cause: "expired", message: errorMessages.smsCodeExpired() };
        ctx.status = 403;
        return;
    }

    if (attempts > constants.SMS_CODE_MAX_TRY_COUNT) {
        ctx.body = {
            cause: "toMany",
            message: errorMessages.smsCodeExceededNumberOfAttempts(phoneNumber)
        };
        ctx.status = 403;
        return;
    }

    if (manDoc.smsConfirmation.code !== smsCode) {
        ctx.body = { cause: "notMatch", message: errorMessages.smsCodeNotMatch() };
        ctx.status = 403;
        return;
    }

    const { id } = manDoc;
    const token = jwt.sign({ id, type: "manufacturer" }, constants.JWTSECRET);
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
