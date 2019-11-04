const constants = require("../../constants");

const jwt = require("jsonwebtoken");

async function adminSignIn(ctx) {
    const { login, password } = ctx.request.body;
    if (login === "dev" && password === "012345") {
        const token = jwt.sign({ type: "admin", isAdmin: true }, constants.JWTSECRET);
        ctx.status = 200;
        ctx.body = { token, isAdmin: true, type: "admin" };
        return 0;
    }
    ctx.status = 403;
    ctx.body = { errmsg: "access denied" };
}

function refreshToken(ctx) {
    const { user } = ctx.state;
    if (user) {
        ctx.status = 200;
        ctx.body = { token: jwt.sign(user, constants.JWTSECRET), ...user };
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
    authenticate
};
