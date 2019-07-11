const Http = require("http");
const Koa = require("koa");
const Router = require("koa-router");
const KoaBody = require("koa-body");
const Mongoose = require("mongoose");
const intel = require("intel");
const routerInit = require("./emodels/buildModels");

const router = Router();
const app = new Koa();
const server = Http.createServer(app.callback());

async function ConnectToMongo() {
    try {
        await Mongoose.connect("mongodb://localhost:27017/offer_desk", {
            useNewUrlParser: true
        });
        intel.info("succefuly connected to mongo db");
    } catch (err) {
        intel.error(`error connect to mongo db : `, err);
    }
}

ConnectToMongo();

const login = require("./controller/login");

router
    .post("/api/ ", login.enterPhoneNumber)
    .post("/api/enterSmsCode", login.enterCode);

routerInit(router);

app.use(KoaBody({ multipart: true }));
app.use(login.authenticate);
app.use(router.routes());

server.listen(3002, () => console.log("server listen 3002"));
