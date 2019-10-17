const validator = require("email-validator");
module.exports = {
    type: String,
    validate: {
        validator: function(email) {
            return validator.validate(email);
        },
        message: props => `${props.value} is not a valid email address`
    },
    unique: true,
    sparce: true
};
