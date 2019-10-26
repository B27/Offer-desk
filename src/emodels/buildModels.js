module.exports = router => {
    require("./ad")[1](router);
    require("./manufacturer")[1](router);
    require("./comment")[1](router);
    require("./category")[1](router);
    require("./region")[1](router);
};
