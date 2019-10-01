const { dbConnector } = require("./utils");
const category = require("./models/category");
const region = require("./models/region");
const comment = require("./models/comments");
const producer = require("./models/producer");
const offer = require("./models/offer");

const clearRequest = fields => async (ctx, next) => {
    let select = (ctx.state.select = {});
    fields.forEach(key => {
        select[key] = 0;
        delete ctx.query[key];
        delete ctx.request.body[key];
    });

    return next();
};

const mustBeAdmin = (ctx, next) => {
    if (ctx.state.isAdmin) return next();
    ctx.status = 403;
    ctx.body = {};
};

const mustBeProducer = ({ state: { producerId, producerConfirmed },assert,query }, next) => {
    assert(producerId, 403, "you must be a producer");
    assert(producerConfirmed, 403, "you has been baned");

    query.producer = producerId;

    return next();
};

const producerMustBeOwner = async (ctx, next) => {
    let offerId = ctx.query._id || ctx.request.body._id;
    let doc = await offer.findById(offerId);
    ctx.assert(doc, 403, "offer does't exist");
    ctx.assert(
        doc.producer.toString() === ctx.state.producerId,
        403,
        "you not owner of this offer"
    );
    return next();
};

const registerCRUD = (router, path, model, middlewares = {}) => {
    const all = middlewares.all || [];
    const { get, post, patch, del } = {
        ...{ get: all, post: all, patch: all, del: all },
        ...middlewares
    };
    router
        .get(
            path,
            ...get,
            dbConnector((query, ctx) =>
                model.find(query).select(ctx.state.select)
            )
        )
        .post(path, ...post, dbConnector(query => model.create(query)))
        .patch(
            path,
            ...patch,
            dbConnector(async ({ _id, ...rest }, ctx) => {
                //findByIdAndUpdate does't call validation, because validation is mongoose middlewares
                return (await model.findById(_id).select(ctx.state.select))
                    .set({ ...rest })
                    .save();
            })
        )
        .delete(
            path,
            ...del,
            dbConnector(({ _id }) => model.findByIdAndDelete(_id))
        );
};
module.exports = router => {
    registerCRUD(router, "/api/category", category, {
        all: [mustBeAdmin],
        get: [],
        del: [
            mustBeAdmin,
            async (ctx, next) => {
                let doc = await offer.findOne({
                    category: ctx.query._id || ctx.request.body._id
                });
                ctx.assert(!doc,400,"category used in offer");
                return next();
            }
        ]
    });
    registerCRUD(router, "/api/region", region, {
        all: [mustBeAdmin],
        get: [],
        del: [
            mustBeAdmin,
            async (ctx, next) => {
                let doc = await offer.findOne({
                    region: ctx.query._id || ctx.request.body._id
                });
                ctx.assert(!doc,400,"region used in offer");
                return next();
            }
        ]
    });
    registerCRUD(router, "/api/comment", comment, {
        del: [() => {}],//stop executing
        patch: [() => {}] 
    });
    registerCRUD(router, "/api/producer", producer, {
        all: [clearRequest(["smsCode"])],
        del: [mustBeAdmin],
        patch: [
            (ctx, next) => {
                if (ctx.state.isAdmin) return next();
                let pid = ctx.state.producerId;
                let epid = ctx.query._id || ctx.request.body._id;
                ctx.assert(pid === epid,403,"you can't modify another producer info");
                
                return clearRequest(["isConfirmed"])(ctx,next);//next();
            },
            clearRequest(["smsCode"])
        ]
    });
    registerCRUD(router, "/api/offer", offer, {
        //patch,delete
        all: [mustBeProducer,producerMustBeOwner],
        get: [],
        post: [mustBeProducer]
    });
};
