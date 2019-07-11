module.exports = {
    userNotFound(phoneNumber) {
        return `user with phone number ${phoneNumber} not found`;
    },
    smsCodeExceededNumberOfTry(phoneNumber) {
        return `number of attempts to enter sms code to user ${phoneNumber} overlimited`;
    },
    smsCodeIncorrectCode(phoneNumber){
        return `smsCode is incorrect`;
    }
};