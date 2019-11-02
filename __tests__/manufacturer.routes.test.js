// require the Koa server
const startKoa = require("../src/entry");
// require supertest
const Mongoose = require("mongoose");
const { CONNECTSTR } = require("../constants");
const request = require("supertest");
// close the server after each test

let koaServer;

beforeAll(() => {
    var initPromise = new Promise(function(resolve, reject) {
        Mongoose.connect(CONNECTSTR, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
            .then(() => {
                console.info("succefuly connected to mongo db");
                koaServer = startKoa();
                resolve();
            })
            .catch(() => reject());
    });
    return initPromise;
});

afterAll(() => {
    koaServer.close();
    Mongoose.disconnect();
});

describe("routes: index", () => {
    test("should respond as expected", async () => {
        const response = await request(koaServer).get("/");
        expect(response.status).toEqual(200);
        expect(response.type).toEqual("application/json");
        expect(response.body.data).toEqual("Sending some JSON");
    });
});
