const startKoa = require("../src/entry");
const fs = require("fs");
const axios = require("axios").default;
const Mongoose = require("mongoose");
const { TESTCONNECTSTR, UPLOADDIR, SMS_CODE_MAX_TRY_COUNT } = require("../constants");

axios.defaults.baseURL = "http://localhost:3058";
axios.defaults.validateStatus = () => true;
jest.setTimeout(8 * 60 * 1000);

let koaServer;

async function connectStart() {
    if (!fs.existsSync(UPLOADDIR)) {
        fs.mkdirSync(UPLOADDIR, { recursive: true });
    }

    await Mongoose.connect(TESTCONNECTSTR, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });

    console.info("succefuly connected to mongo db");
    koaServer = startKoa(3058);
}

beforeAll(() => {
    return connectStart();
});

afterAll(() => {
    koaServer && koaServer.close();
    Mongoose.connection && Mongoose.connection.dropDatabase() && Mongoose.connection.close();
});

describe("test manufacturer", require("./manufacturer.test"));
describe("test category", require("./category.test"));
