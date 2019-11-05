const startKoa = require("../src/entry");
const axios = require("axios").default;
const Mongoose = require("mongoose");
const { TESTCONNECTSTR, SMS_CODE_MAX_TRY_COUNT } = require("../constants");

axios.defaults.baseURL = "http://localhost:3058";
axios.defaults.validateStatus = () => true;

let koaServer;

async function connectStart() {
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
