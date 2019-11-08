const { dbConnector } = require("../utils");
const Mongoose = require("mongoose");
const errmsg = require("../../errorMessages");

function registerCRUD(path, router, model) {
    router
        .get(
            `/api/crud/${path}`,
            dbConnector(
                (query, ctx) =>
                    model
                        .find(query)
                        .limit(+ctx.requestOptions.__limit || 100)
                        .skip(+ctx.requestOptions.__skip || 0)
                        .sort(ctx.requestOptions.__sort || ""),
                model,
                true //don't need clear request
            )
        )
        .post(
            `/api/crud/${path}`,
            dbConnector(async (query, ctx) => {
                const doc = new model().set(query);
                const err = await doc.getPostError(ctx.state.user);
                ctx.assert(!err, 400, err);

                console.log(err);

                const vr = await doc.validate();
                if (vr) {
                    throw vr;
                }

                return doc.save();
            }, model)
        )
        .patch(
            `/api/crud/${path}`,
            dbConnector(async ({ id, ...rest }, ctx) => {
                //findByIdAndUpdate does't call validation, because validation is mongoose middlewares
                const doc = await model.findById(id);
                ctx.assert(doc, 404, errmsg.documentNotFound());
                doc.set({ ...rest });
                const err = await doc.getUpdateError(ctx.state.user, doc._id);
                ctx.assert(!err, 400, err);

                const vr = await doc.validate();
                if (vr) {
                    throw vr;
                }

                return doc.save();
            }, model)
        )

        .delete(
            `/api/crud/${path}`,
            dbConnector(async ({ id }, ctx) => {
                const doc = await model.findById(id);
                ctx.assert(doc, 404, errmsg.documentNotFound());
                const err = await doc.getDeleteError(ctx.state.user, doc._id);
                ctx.assert(!err, 400, err);

                return doc.delete();
            }, model)
        );
}

function eModel(name, eSchema, ...rest) {
    const model = Mongoose.model(name, eSchema, ...rest);
    return [model, router => registerCRUD(name, router, model)];
}

module.exports = eModel; //("model",eBuilder(eSchema))[1];
