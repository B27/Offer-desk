module.exports = router => {
    require("./offer")[1](router);
    require("./producer")[1](router);
    require("./comment")[1](router);
    require("./category")[1](router);
    require("./region")[1](router);
};
