const ratingController = require("./controller/rating");
const adController = require("./controller/ad");
const categoryController = require("./controller/category");
const imageController = require("./controller/image");
const manufacturerController = require("./controller/manufacturer");
const loginController = require("./controller/login");

module.exports = function(router) {
    router
        .get("/api/refreshToken", loginController.refreshToken)
        .post("/api/enterPhoneNumber", loginController.enterPhoneNumber)
        .post("/api/enterSmsCode", manufacturerController.enterCode)
        .post("/api/adminSignIn", loginController.adminSignIn)

        .post("/api/changeRating", ratingController.changeRating)

        .post("/api/ad", adController.postAd)
        .get("/api/ad/preview", adController.getPreview)
        .get("/api/ad/photo", adController.getPhoto)
        .get("/api/images/:image", imageController.getImage)
        .post("/api/category", categoryController.addCategory)
        .post("/api/manufacturer", manufacturerController.saveManufacturerSendSms);
};