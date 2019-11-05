const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios").default;
const errorMessages = require("../errorMessages");
const [Category] = require("../src/emodels/category");
const { UPLOADDIR } = require("../constants");

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

        async function clearAfterTest() {
            fs.unlinkSync(UPLOADDIR + "/" + imageNameInDb);
            await Category.deleteOne({ _id: categoryDocId });
        }

        beforeEach(() => initTests());

        afterEach(() => clearAfterTest());

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

        test.each`
            categoryData
            ${{ name: newName }}
            ${{ image: newImageName }}
            ${{ name: newName, image: newImageName }}
        `(
            "if there are not enough parameters ($categoryData), then should return 200",
            async ({ categoryData }) => {
                const form = new FormData();
                categoryData.name && form.append("name", categoryData.name);
                categoryData.image &&
                    form.append("image", fs.createReadStream(__dirname + "/" + categoryData.image));

                const reqParams = { id: categoryDocId };

                const response = await axios.patch(routeCategory, form, {
                    headers: { ...customHeaders, ...form.getHeaders() },
                    params: reqParams
                });
                expect(response.status).toEqual(200);

                const { image } = response.data;
                // если загрузить новую картинку, то её нужно удалить после теста
                if (categoryData.image) {
                    imageNameInDb = image;
                }

                expect(response.data.name).toBeDefined();
                expect(response.data.image).toBeDefined();
                // expect(response.data).toEqual(errorMessages.needMoreData());
            }
        );
    });
}

module.exports = categoryTest;
