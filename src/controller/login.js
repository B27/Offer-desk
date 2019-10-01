const errorMessages = require("../../errorMessages");
const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const [producer] = require("../emodels/producer");

function generateSmsCode() {
    return ("00000" + Math.random() * 1000000).slice(-6);
}

async function adminSignIn(ctx){
    const {login,password} = ctx.request.body;
    if (login === "dev" && password === "012345") {
        const token = jwt.sign(
            { type: "admin", isAdmin: true },
            constants.JWTSECRET
        );
        ctx.status = 200;
        ctx.body = { token, isAdmin: true, type: "admin" };
        return 0;
    }
    ctx.status = 403;
    ctx.body = {errmsg:"access denied"}
};

async function enterPhoneNumber(ctx) {
    const { phoneNumber } = ctx.request.body;
    let doc = await producer.findOne({ phoneNumber });
    ctx.assert(doc, 404, errorMessages.userNotFound(phoneNumber));
    await doc
        .set({
            smsCode: process.env.development
                ? constants.SMS_CODE_DEFAULT_DEV_CODE
                : generateSmsCode()
        })
        .save();

    //Delete code after timeout
    setTimeout(
        () =>
            producer.findOneAndUpdate({ phoneNumber }, { smsCode: undefined }),
        constants.SMS_CODE_TIME_LIMIT
    );

    ctx.status = 200;
    ctx.body = "OK";
}

const smsCodeTry = {};

async function enterCode(ctx) {
    const { phoneNumber, smsCode } = ctx.request.body;
    let doc = await producer.findOne({ phoneNumber });    

    ctx.assert(doc, 404, errorMessages.userNotFound(phoneNumber));
    if (doc.smsCode !== smsCode) {
        //First access init counter to 0, next increment
        let i = (smsCodeTry[phoneNumber] = (smsCodeTry[phoneNumber] || 0) + 1);
        if (i > constants.SMS_CODE_MAX_TRY_COUNT) {
            // don't use await, because we don't want to wait save and can return result right now
            doc.set({ smsCode: undefined }).save();
            delete smsCodeTry[phoneNumber];
            ctx.throw(
                403,
                errorMessages.smsCodeExceededNumberOfTry(phoneNumber)
            );
        }
        ctx.throw(403, errorMessages.smsCodeIncorrectCode(phoneNumber));
    } else {
        delete smsCodeTry[phoneNumber];

        const { _id, isConfirmed } = doc;
        const token = jwt.sign(
            { _id, type: "producer", isConfirmed },
            constants.JWTSECRET
        );
        // don't use await, because we don't want to wait save and can return result right now
        doc.set({ smsCode: undefined }).save();

        ctx.status = 200;
        ctx.body = { token, ...doc.toObject(), smsCode: undefined };
    }
}

function refreshToken(ctx) {
    const {user} = ctx.state;
    if(user){
        ctx.status = 200;
        ctx.body = {token:jwt.sign(user,constants.JWTSECRET),...user};
    }
}

function authenticate(ctx, next) {
    try {
        ctx.state.user = { isAdmin: false };
        const auth = ctx.header.authorization;
        if (typeof auth === typeof "" && auth.slice(0, 7) === "Bearer ") {
            const user = jwt.verify(auth.slice(7), constants.JWTSECRET);
            ctx.state.user = { ...ctx.state.user, ...user };
        }
    } catch (err) {
        ctx.throw(400, "Invalid authenticate token");
    }

    return next();
}

module.exports = {
    adminSignIn,
    refreshToken,
    enterPhoneNumber,
    enterCode,
    authenticate
};
