module.exports = {
    //build query from koa ctx
    dbConnector:dbMethod => async ctx =>
    {
        const request = {...ctx.request.body,...ctx.query};
        try{
            ctx.status = 200;
            ctx.body = await dbMethod(request,ctx);
        }catch(err){
            console.log(err);
            ctx.status = 500;
            ctx.body = {err};
        }
    }
};