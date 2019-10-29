const Mongoose = require("mongoose");
const ObjectId = Mongoose.Schema.Types.ObjectId;
const _ = require("lodash");

function eBuilder(eSchemaDescriptor, defaultAccess, getErrors = {}) {
    function scan(schema, oldKey = undefined) {
        if (oldKey) {
            oldKey += ".";
        } else {
            oldKey = "";
        }
        const ret = {
            access: [],
            system: ["__v", "_id"],
            file: [],
            ref: [],
            autopopulate: []
        };

        function merge(obj1, obj2) {
            for (const key in obj1) {
                obj1[key] = obj1[key].concat(obj2[key]);
            }
        }

        for (let key in schema) {
            const val = schema[key];
            if (val.type) {
                if (val.system) {
                    ret.system.push(oldKey + key);
                }

                if (val.file) {
                    ret.file.push({
                        key: oldKey + key,
                        ...val.file
                    });
                }
                if (val.type === ObjectId && val.ref) {
                    ret.ref.push({ key: oldKey + key, ref: val.ref });
                }
                if (val.access) {
                    ret.access.push({ key: oldKey + key, f: val.access });
                } else if (defaultAccess) {
                    ret.access.push({ key: oldKey + key, f: defaultAccess });
                }
                if (val.autopopulate) {
                    ret.autopopulate.push(oldKey + key);
                }
            } else {
                merge(ret, scan(val, key));
            }
        }
        return ret;
    }

    const sr = scan(eSchemaDescriptor);
    console.log("scanned eSchemaDescriptor", sr);

    function buildClearRequest(access, system) {
        return (query, user) => {
            access.forEach(({ key, f }) => {
                if (f(user) !== 2) {
                    _.unset(query, key);
                }
            });
            system.forEach(key => _.unset(query, key));
            return query;
        };
    }
    function buildClearAnswer(access, system) {
        return (doc, user) => {
            access.forEach(({ key, f }) => {
                if (f(user) === 0) {
                    _.unset(doc, key);
                }
            });
            system.forEach(key => _.unset(doc, key));
            return doc;
        };
    }

    const clearReq = buildClearRequest(sr.access, sr.system);
    const clearAns = buildClearAnswer(sr.access, sr.system);

    const schema = Mongoose.Schema(eSchemaDescriptor, {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: {
            virtuals: true,
            transform: function(doc, ret, option) {
                return clearAns(ret, option.user);
            }
        }
    });
    schema.statics.clearRequest = clearReq;
    schema.methods.getDeleteError = getErrors.getDeleteError || (() => false);
    schema.methods.getPostError = getErrors.getPostError || (() => false);
    schema.methods.getUpdateError = getErrors.getUpdateError || (() => false);

    schema.post("save", async function() {
        await sr.autopopulate.reduce((acc, path) => acc.populate(path), this).execPopulate();
    });

    schema.post("find", async function(docs) {
        for (let doc of docs) {
            await sr.autopopulate.reduce((acc, path) => acc.populate(path), doc).execPopulate();
        }
    });
    return schema;
}

module.exports = eBuilder;
