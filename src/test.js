const Mongoose = require("mongoose");
async function ConnectToMongo() {
    try {
        await Mongoose.connect("mongodb://localhost:27017/new_order", {
            useNewUrlParser: true
        });
        //intel.info('succefuly connected to mongo db');
    } catch (err) {
        console.log("Connection error");
    }
}

ConnectToMongo();

const Identification = require("./models/identification");

function validateTest(doc) {
    const error = doc.validateSync();
    const errs = [];
    if (error) {
        //console.group('validation error');
        for (let path in error.errors) {
            errs.push(error.errors[path].message);
            console.log(error.errors[path].message);
        }
        //console.groupEnd();
    }
    return errs;
}

const Client = require("./models/client");
const test = require("tape");

test("validation", async t => {
    t.plan(1);

    t.deepEqual(
        validateTest(
            new Client({
                identification: "5cff38748e27190f7069a230",
                addresses: [{ geo: [190, 22] }]
            })
        ),
        [
            "[190,22] is not a valid geo pair, coordinates must be in range lng [-180,180], lat [-90,90]"
        ]
    );
    console.log(validateTest(new Identification({ email: "email@mail.com", name: "asd1" })));
});
