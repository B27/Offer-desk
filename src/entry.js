const Http = require("http");
const Koa = require("koa");
const Router = require("koa-router");
const KoaBody = require("koa-body");
const Mongoose = require("mongoose");
const routerInit = require("./emodels/buildModels");
const cors = require("@koa/cors");

const router = Router();
const app = new Koa();
const server = Http.createServer(app.callback());

async function ConnectToMongo() {
    try {
        await Mongoose.connect("mongodb://localhost:27017/offer_desk", {
            useNewUrlParser: true
        });
        console.info("succefuly connected to mongo db");
    } catch (err) {
        console.error(`error connect to mongo db : `, err);
    }
}

ConnectToMongo();

const login = require("./controller/login");

router
    .get("/api/refreshToken",login.refreshToken)
    .post("/api/enterPhoneNumber", login.enterPhoneNumber)
    .post("/api/enterSmsCode", login.enterCode)
    .post("/api/adminSignIn",login.adminSignIn);

const rating = require("./controller/rating");
router.post("/api/cahngerating",rating.changeRating);

routerInit(router);

app.use(KoaBody({ multipart: true }));
app.use(cors({credentials: true}));
app.use(login.authenticate);
app.use(router.routes());

server.listen(3002, () => console.log("server listen 3002"));
