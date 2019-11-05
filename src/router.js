const ratingController = require("./controller/rating");
const adController = require("./controller/ad");
const categoryController = require("./controller/category");
const imageController = require("./controller/image");
const manufacturerController = require("./controller/manufacturer");
const loginController = require("./controller/login");

module.exports = function(router) {
    router
        .get("/api/refreshToken", loginController.refreshToken)
        // .post("/api/enterPhoneNumber", )
        .post("/api/enterSmsCode", manufacturerController.enterCode)
        .post("/api/adminSignIn", loginController.adminSignIn)

        .post("/api/changeRating", ratingController.changeRating)

        .post("/api/ad", adController.postAd)

        .get("/api/images/:image", imageController.getImage)

        .post("/api/category", categoryController.addCategory)
        .patch("/api/category", categoryController.updateCategory)
        .delete("/api/category", categoryController.removeCategory)

        .post("/api/manufacturer", manufacturerController.saveManufacturerSendSms);
};
