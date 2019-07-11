const { dbConnector } = require("../utils");
const Mongoose = require("mongoose");


function registerCRUD(path, router, model) {
    router
        .get(
            `/api/crud/${path}`,
            dbConnector(query => model.find(query), model)
        )
        .post(
            `/api/crud/${path}`,
            dbConnector((query, ctx) => {
                const doc = new model().set(query);
                const err = doc.getPostError(ctx.state.user);
                ctx.assert(!err, 400, err);

                return doc.save();
            }, model)
        )
        .patch(
            `/api/crud/${path}`,
            dbConnector(async ({ _id, ...rest }, ctx) => {
                //findByIdAndUpdate does't call validation, because validation is mongoose middlewares
                return (await model.findById(_id).select(ctx.state.select))
                    .set({ ...rest })
                    .save();
            }, model)
        )

        .delete(
            `/api/crud/${path}`,
            dbConnector(async ({ _id }, ctx) => {
                const doc = await model.findById(_id);
                const err = doc.getDeleteError(ctx.state.user);
                ctx.assert(!err, 400, err);

                return doc.delete();
            }, model)
        );
}

function eModel(name,eSchema,...rest){
    const model = Mongoose.model(name,eSchema,...rest);
    return [model,router => registerCRUD(name, router, model)]
}

module.exports = eModel;//("model",eBuilder(eSchema))[1];
