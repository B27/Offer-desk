const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [manufacturer] = require("../emodels/manufacturer");

function generateSmsCode() {
    return ("00000" + Math.random() * 1000000).slice(-6);
}

async function saveManufacturerSendSms(ctx) {
    const manufacturerData = ctx.request.body;
    const newManDoc = new manufacturer(manufacturerData);

    try {
        await newManDoc.validate();
    } catch (error) {
        ctx.throw(400, error.message);
    }

    let oldManDoc = await manufacturer.findOne({ phoneNumber: manufacturerData.phoneNumber });

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

        oldManDoc.save({ validateBeforeSave: false });
        ctx.body = "manufacturer updated";
    } else {
        // send sms code methods
        newManDoc.save({ validateBeforeSave: false });
        ctx.body = "manufacturer saved";
    }

    ctx.status = 200;
}

async function enterPhoneNumber(ctx) {
    const { phoneNumber } = ctx.request.body;
    let doc = await manufacturer.findOne({ phoneNumber });
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

const smsCodeTry = {};

async function enterCode(ctx) {
    const { phoneNumber, smsCode } = ctx.request.body;
    let doc = await manufacturer.findOne({ phoneNumber });

    ctx.assert(doc, 404, errorMessages.userNotFound(phoneNumber));
    if (doc.smsCode !== smsCode) {
        //First access init counter to 0, next increment
        let i = (smsCodeTry[phoneNumber] = (smsCodeTry[phoneNumber] || 0) + 1);
        if (i > constants.SMS_CODE_MAX_TRY_COUNT) {
            // don't use await, because we don't want to wait save and can return result right now
            doc.set({ smsCode: undefined }).save();
            delete smsCodeTry[phoneNumber];
            ctx.throw(403, errorMessages.smsCodeExceededNumberOfTry(phoneNumber));
        }
        ctx.throw(403, errorMessages.smsCodeIncorrectCode(phoneNumber));
    } else {
        delete smsCodeTry[phoneNumber];

        const { _id, isConfirmed } = doc;
        const token = jwt.sign({ _id, type: "manufacturer", isConfirmed }, constants.JWTSECRET);
        // don't use await, because we don't want to wait save and can return result right now
        doc.set({ smsCode: undefined }).save();

        ctx.status = 200;
        ctx.body = { token, ...doc.toObject(), smsCode: undefined };
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
