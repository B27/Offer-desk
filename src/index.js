const Mongoose = require("mongoose");
const startKoa = require("./entry");
const fs = require("fs");
const { UPLOADDIR, CONNECTSTR } = require("../constants");

if (!fs.existsSync(UPLOADDIR)) {
    fs.mkdirSync(UPLOADDIR, { recursive: true });
}

async function ConnectToMongo() {
    try {
        await Mongoose.connect(CONNECTSTR, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.info("succefuly connected to mongo db");
        startKoa();
    } catch (err) {
        console.error(`error connect to mongo db : `, err);
    }
}

ConnectToMongo();
