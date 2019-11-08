const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [Manufacturer] = require("../emodels/manufacturer");

const axios = require('axios');

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

    try {
        const url = `https://sms.ru/sms/send?api_id=${constants.SMS_CODE_API_KEY}&to=${manDoc.phoneNumber}&msg=${code}&json=1`;
        const ans = await axios.get(url);
    } catch (unused) { }

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

    const manExists = await Manufacturer.exists({ phoneNumber });
    ctx.assert(manExists, 404, errorMessages.userNotFound(phoneNumber));

    const manDoc = await Manufacturer.findOneAndUpdate(
        { phoneNumber },
        { $inc: { "smsConfirmation.attempts": 1 } },
        {
            new: true
        }
    );
    const attempts = manDoc.smsConfirmation.attempts;

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

    const res = await manDoc.updateOne({
        $unset: { smsConfirmation: "" },
        $set: { isSmsConfirmed: true }
    });

    ctx.assert(res.nModified === 1, 500, errorMessages.errorDuringUpdate());

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

async function checkConfirmation(ctx) {
    const { user } = ctx.state;

    if (!user) {
        ctx.body = errorMessages.notAuthorized();
        ctx.status = 401;
        return;
    }

    const manDoc = await Manufacturer.findById(user.id);

    if (!manDoc.isConfirmed) {
        ctx.body = { cause: "unconfirmed", message: errorMessages.userNeedConfirmation() };
        ctx.status = 403;
        return;
    }

    ctx.body = "OK";
    ctx.status = 200;
}

module.exports = {
    checkConfirmation,
    saveManufacturerSendSms,
    refreshToken,
    enterPhoneNumber,
    enterCode
};
