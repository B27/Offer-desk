/* eslint-disable jest/no-export */
const axios = require("axios").default;
const { SMS_CODE_MAX_TRY_COUNT } = require("../constants");
const errorMessages = require("../errorMessages");
const [Manufacturer] = require("../src/emodels/manufacturer");
const [Region] = require("../src/emodels/region");

function manufacturerTest() {
    let regionId;

    async function createRegion() {
        const region = await Region.create({ name: "Test region" });
        regionId = region.id;
    }

    beforeAll(() => {
        return createRegion();
    });

    describe("post /api/enterSmsCode", () => {
        const routeEnterSmsCode = "/api/enterSmsCode";

        const manName = "testManufacturer";
        const phoneNumber = "+7 902 234-45-23";
        const wrongPhoneNumber = "+7 902 523-23-65";
        const smsCode = "123567";
        const wrongSmsCode = "653125";
        const unexpiredDate = Date.now() + 24 * 60 * 60 * 1000;
        const expiredDate = Date.now() - 24 * 60 * 60 * 1000;
        let manufacturerDoc;

        async function createManufacturer() {
            const manufacturerData = {
                phoneNumber,
                feedbackPhoneNumber: "+7 905 234-35-23",
                name: manName,
                productionDescription: "test desctiption",
                region: regionId,
                isConfirmed: false,
                isSmsConfirmed: false
            };
            manufacturerDoc = await Manufacturer.create(manufacturerData);
        }

        beforeEach(() => createManufacturer());

        afterEach(() => Manufacturer.deleteOne({ phoneNumber }));

        test.each`
            authorizationData
            ${{}}
            ${{ phoneNumber }}
            ${{ smsCode }}
        `(
            "if there are not enough parameters ($authorizationData), then should return a 'need more data' error",
            async ({ authorizationData }) => {
                const response = await axios.post(routeEnterSmsCode, authorizationData);
                expect(response.status).toEqual(404);
                expect(response.data).toEqual(errorMessages.needMoreData());
            }
        );

        test("if the number is not found in the database, then it must return a 'user not found' + phone number", async () => {
            const authorizationData = { phoneNumber: wrongPhoneNumber, smsCode };
            const response = await axios.post(routeEnterSmsCode, authorizationData);
            expect(response.status).toEqual(404);
            expect(response.data).toEqual(errorMessages.userNotFound(wrongPhoneNumber));
        });

        test("if the SMS code is expired, then give an error", async () => {
            manufacturerDoc.smsConfirmation = { code: smsCode, expirationDate: expiredDate };
            await manufacturerDoc.save();

            const authorizationData = { phoneNumber, smsCode };

            const response = await axios.post(routeEnterSmsCode, authorizationData);

            expect(response.status).toEqual(403);
            expect(response.data).toEqual({
                cause: "expired",
                message: errorMessages.smsCodeExpired()
            });
        });

        test("if the number of attempts is exceeded, then should return an error", async () => {
            manufacturerDoc.smsConfirmation = { code: smsCode, expirationDate: unexpiredDate };
            await manufacturerDoc.save();

            const authorizationData = { phoneNumber, smsCode: wrongSmsCode };

            for (let index = 0; index < SMS_CODE_MAX_TRY_COUNT; index++) {
                await axios.post(routeEnterSmsCode, authorizationData);
            }

            const response = await axios.post(routeEnterSmsCode, authorizationData);

            expect(response.status).toEqual(403);
            expect(response.data).toEqual({
                cause: "toMany",
                message: errorMessages.smsCodeExceededNumberOfAttempts(phoneNumber)
            });
        });

        test("if sms code not match, then should return an error", async () => {
            manufacturerDoc.smsConfirmation = { code: smsCode, expirationDate: unexpiredDate };
            await manufacturerDoc.save();

            const authorizationData = { phoneNumber, smsCode: wrongSmsCode };

            const response = await axios.post(routeEnterSmsCode, authorizationData);

            expect(response.status).toEqual(403);
            expect(response.data).toEqual({
                cause: "notMatch",
                message: errorMessages.smsCodeNotMatch()
            });
        });

        test("if everything is fine, then it should return the token and the name of the manufacturer", async () => {
            manufacturerDoc.smsConfirmation = { code: smsCode, expirationDate: unexpiredDate };
            await manufacturerDoc.save();

            const authorizationData = { phoneNumber, smsCode };

            const response = await axios.post(routeEnterSmsCode, authorizationData);

            expect(response.status).toEqual(200);
            expect(response.data.name).toEqual(manName);
            expect(response.data.token).toBeDefined();
        });
    });
}

module.exports = manufacturerTest;
