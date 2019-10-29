const Http = require("http");
const Koa = require("koa");
const Router = require("@koa/router");
const KoaBody = require("koa-body");
const Mongoose = require("mongoose");
const routerInit = require("./emodels/buildModels");
const cors = require("@koa/cors");
const loginController = require("./controller/login");
const ratingController = require("./controller/rating");
const adController = require("./controller/ad");
const categoryController = require("./controller/category");
const imageController = require("./controller/image");
const manufacturerController = require("./controller/manufacturer");
const fs = require("fs");
const { UPLOADDIR } = require("../constants");

if (!fs.existsSync(UPLOADDIR)) {
    fs.mkdirSync(UPLOADDIR);
}

const router = Router();
const app = new Koa();
const server = Http.createServer(app.callback());

async function ConnectToMongo() {
    try {
        await Mongoose.connect("mongodb://localhost:27017/ad_desk", {
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
    .get("/api/refreshToken", loginController.refreshToken)
    .post("/api/enterPhoneNumber", loginController.enterPhoneNumber)
    .post("/api/enterSmsCode", loginController.enterCode)
    .post("/api/adminSignIn", loginController.adminSignIn);

router.post("/api/changeRating", ratingController.changeRating);

router
    .post("/api/ad", adController.postAd)
    .get("/api/ad/preview", adController.getPreview)
    .get("/api/ad/photo", adController.getPhoto)
    .get("/api/images/:image", imageController.getImage)
    .post("/api/category", categoryController.addCategory)
    .post("/api/manufacturer", manufacturerController.saveManufacturerSendSms);

routerInit(router);

app.use(cors({ credentials: true }));
app.use(
    KoaBody({
        multipart: true,
        formidable: { multiples: true, uploadDir: UPLOADDIR }
    })
);
app.use(loginController.authenticate);
app.use(router.routes());

server.listen(3002, () => console.log("server listen 3002"));
