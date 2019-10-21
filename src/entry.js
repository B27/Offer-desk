const Http = require("http");
const Koa = require("koa");
const Router = require("koa-router");
const KoaBody = require("koa-body");
const Mongoose = require("mongoose");
const routerInit = require("./emodels/buildModels");
const cors = require("@koa/cors");
const login = require("./controller/login");
const rating = require("./controller/rating");
const ad = require("./controller/ad");

const router = Router();
const app = new Koa();
const server = Http.createServer(app.callback());

async function ConnectToMongo() {
    try {
        await Mongoose.connect("mongodb://localhost:27017/offer_desk", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.info("succefuly connected to mongo db");
    } catch (err) {
        console.error(`error connect to mongo db : `, err);
    }
}

ConnectToMongo();

router
    .get("/api/refreshToken", login.refreshToken)
    .post("/api/enterPhoneNumber", login.enterPhoneNumber)
    .post("/api/enterSmsCode", login.enterCode)
    .post("/api/adminSignIn", login.adminSignIn);

router.post("/api/cahngerating", rating.changeRating);

router.get("/api/ad/preview", )
router.get("/api/ad/photo", ad.getPhoto);

routerInit(router);

app.use(KoaBody({ multipart: true }));
app.use(cors({ credentials: true }));
app.use(login.authenticate);
app.use(router.routes());

server.listen(3002, () => console.log("server listen 3002"));
