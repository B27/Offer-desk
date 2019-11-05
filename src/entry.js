const Koa = require("koa");
const Router = require("@koa/router");
const KoaBody = require("koa-body");
const routerInitWithModels = require("./emodels/buildModels");
const routerInit = require("./router");
const cors = require("@koa/cors");
const loginController = require("./controller/login");
const { UPLOADDIR } = require("../constants");

function startKoa(port) {
    const router = Router();
    const app = new Koa();
    const PORT = process.env.PORT || port || 3002;

    routerInit(router);
    routerInitWithModels(router);

    app.use(cors({ credentials: true }));
    app.use(
        KoaBody({
            multipart: true,
            formidable: { multiples: true, uploadDir: UPLOADDIR }
        })
    );
    app.use(loginController.authenticate);
    app.use(router.routes());

    const server = app.listen(PORT, () => console.log(`server listen ${PORT}`));
    return server;
}

module.exports = startKoa;
