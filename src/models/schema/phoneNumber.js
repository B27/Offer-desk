const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

module.exports = {
    type: String,
    validate: {
        validator: function(num) {
            const number = phoneUtil.parse(num);
            return phoneUtil.isValidNumber(number);
        },
        message: props => `${props.value} is not a valid phone number`
    },
    // unique: true,
    // sparce: true
};
