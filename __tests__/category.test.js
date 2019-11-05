const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios").default;
const errorMessages = require("../errorMessages");
const [Category] = require("../src/emodels/category");

function categoryTest() {
    describe("route /api/category", () => {
        const routeCategory = "/api/category";
        const routeAdminAuth = "/api/adminSignIn";

        const adminLogin = "dev";
        const adminPass = "012345";

        const name = "Testing Category";
        const newName = "New named testing category";
        const oldImageName = "category_test2.png";
        const newImageName = "category_test.png"; // fs.createReadStream(__dirname + );

        let customHeaders;
        let imageNameInDb;
        let categoryDoc;
        let categoryDocId;

        async function initTests() {
            let response;
            response = await axios.post(routeAdminAuth, {
                login: adminLogin,
                password: adminPass
            });

            const token = response.data.token;

            if (!token) {
                throw "token not recieved";
            }

            customHeaders = { Authorization: `Bearer ${token}` };

            const form = new FormData();
            form.append("name", name);
            form.append("image", fs.createReadStream(__dirname + "/" + oldImageName));

            response = await axios.post(routeCategory, form, {
                headers: { ...form.getHeaders(), ...customHeaders }
            });

            const { image, id } = response.data;

            imageNameInDb = image;
            categoryDocId = id;

            if (!(categoryDocId && imageNameInDb)) {
                throw "Error in beforeAll";
            }
        }

        beforeAll(() => initTests());

        afterAll(() => Category.deleteOne({ _id: categoryDocId }));

        test.each`
            categoryData                              | needSendId
            ${{}}                                     | ${true}
            ${{}}                                     | ${false}
            ${{ name: newName }}                      | ${false}
            ${{ image: newImageName }}                | ${false}
            ${{ name: newName, image: newImageName }} | ${false}
        `(
            "if there are not enough parameters ($categoryData , id of category sended: $needSendId), then should return a 'need more data' error",
            async ({ categoryData, needSendId }) => {
                const form = new FormData();
                categoryData.name && form.append("name", categoryData.name);
                categoryData.image &&
                    form.append("image", fs.createReadStream(__dirname + "/" + categoryData.image));

                const reqParams = needSendId && { id: categoryDocId };

                const response = await axios.patch(routeCategory, form, {
                    headers: { ...customHeaders, ...form.getHeaders() },
                    params: reqParams
                });
                expect(response.status).toEqual(404);
                expect(response.data).toEqual(errorMessages.needMoreData());
            }
        );

        // test("if the number is not found in the database, then it must return a 'user not found' + phone number", async () => {
        //     const categoryData = { phoneNumber: wrongPhoneNumber, smsCode };
        //     const response = await axios.post(routeUpdateCategory, categoryData);
        //     expect(response.status).toEqual(404);
        //     expect(response.data).toEqual(errorMessages.userNotFound(wrongPhoneNumber));
        // });

        // test("if the SMS code is expired, then give an error", async () => {
        //     categoryDoc.smsConfirmation = { code: smsCode, expirationDate: expiredDate };
        //     await categoryDoc.save();

        //     const categoryData = { phoneNumber, smsCode };

        //     const response = await axios.post(routeUpdateCategory, categoryData);

        //     expect(response.status).toEqual(403);
        //     expect(response.data).toEqual({
        //         cause: "expired",
        //         message: errorMessages.smsCodeExpired()
        //     });
        // });

        // test("if the number of attempts is exceeded, then should return an error", async () => {
        //     categoryDoc.smsConfirmation = { code: smsCode, expirationDate: unexpiredDate };
        //     await categoryDoc.save();

        //     const categoryData = { phoneNumber, smsCode: wrongSmsCode };

        //     for (let index = 0; index < SMS_CODE_MAX_TRY_COUNT; index++) {
        //         await axios.post(routeUpdateCategory, categoryData);
        //     }

        //     const response = await axios.post(routeUpdateCategory, categoryData);

        //     expect(response.status).toEqual(403);
        //     expect(response.data).toEqual({
        //         cause: "toMany",
        //         message: errorMessages.smsCodeExceededNumberOfAttempts(phoneNumber)
        //     });
        // });

        // test("if sms code not match, then should return an error", async () => {
        //     categoryDoc.smsConfirmation = { code: smsCode, expirationDate: unexpiredDate };
        //     await categoryDoc.save();

        //     const categoryData = { phoneNumber, smsCode: wrongSmsCode };

        //     const response = await axios.post(routeUpdateCategory, categoryData);

        //     expect(response.status).toEqual(403);
        //     expect(response.data).toEqual({
        //         cause: "notMatch",
        //         message: errorMessages.smsCodeNotMatch()
        //     });
        // });

        // test("if everything is fine, then it should return the token and the name of the manufacturer", async () => {
        //     categoryDoc.smsConfirmation = { code: smsCode, expirationDate: unexpiredDate };
        //     await categoryDoc.save();

        //     const categoryData = { phoneNumber, smsCode };

        //     const response = await axios.post(routeUpdateCategory, categoryData);

        //     expect(response.status).toEqual(200);
        //     expect(response.data.name).toEqual(manName);
        //     expect(response.data.token).toBeDefined();
        // });
    });
}

module.exports = categoryTest;
