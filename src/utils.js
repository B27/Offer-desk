module.exports = {
    //build query from koa ctx
    dbConnector:(dbMethod,model) => async ctx =>
    {
        let request = {...ctx.request.body,...ctx.query};
        const user = ctx.state.user;
        console.log(request);
        request = model.clearRequest(request,user);
        console.log(request);
        try{
            const res = await dbMethod(request,ctx)
            ctx.status = 200;
            
            if(Array.isArray(res))
                ctx.body = res.map(v => v.toJSON({user}));
            else 
                ctx.body = res.toJSON({user});
        }catch(err){
            // console.log({err});
            ctx.status = err.status || 500;
            ctx.body = {errmsg:err.message || err};
        }
    }
};