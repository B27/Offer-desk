const path = require("path");
const _ = require("lodash");
const os = require("os");
const fs = require("fs");
const { UPLOADDIR } = require("../constants");

function operatorTransform(str) {
    if (str.slice(0, 2) == '<=') return { $lte: str.slice(2) }
    else if (str.slice(0, 2) == '>=') return { $gte: str.slice(2) }
    else if (str[0] == '<') return { $lt: str.slice(1) }
    else if (str[0] == '>') return { $gt: str.slice(1) }
    else if (str[0] == '!') return { $ne: str.slice(1) }
    else if (str[0] == ",") return { $in: str.split(',').slice(1) }
    else return str;
}

module.exports = {
    //build query from koa ctx
    dbConnector: (dbMethod, model, isGet = false) => async ctx => {
        let request = { ...ctx.request.body, ...ctx.query };
        const user = ctx.state.user;
        console.log(request);
        const options = {};
        for (let key in request) {
            if (key.slice(0, 2) === "__") {
                options[key] = request[key];
                _.unset(request, key);
            }
        }
        ctx.requestOptions = options;
        if (!isGet) request = model.clearRequest(request, user);
        else {
            for (let key in request) {
                request[key] = operatorTransform(request[key]);
            }
        }
        console.log(request);
        try {
            const res = await dbMethod(request, ctx);
            ctx.status = 200;

            if (Array.isArray(res)) {
                ctx.body = res.map(v => v.toJSON({ user }));
            } else {
                ctx.body = res.toJSON({ user });
            }
        } catch (err) {
            // console.log({err});
            ctx.status = err.status || 500;
            ctx.body = { errmsg: err.message || err };
        }
    },

    fileName: filePath =>
        os.platform() === "win32" ? path.win32.basename(filePath) : path.posix.basename(filePath),

    deleteUplodadedFile: fileName => {
        if (fs.existsSync(UPLOADDIR + "/" + fileName)) {
            fs.unlinkSync(UPLOADDIR + "/" + fileName);
        }
    },

    deleteUnusedFile: filePath => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};
