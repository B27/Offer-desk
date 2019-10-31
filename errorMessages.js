module.exports = {
    userAlreadyRegistered() {
        return "user already registered and confirmed";
    },

    userNeedConfirmation() {
        return "user needs confirmation from administrator";
    },

    userNotFound(phoneNumber) {
        return `user with phone number ${phoneNumber} not found`;
    },
    smsCodeExceededNumberOfTry(phoneNumber) {
        return `number of attempts to enter sms code to user ${phoneNumber} overlimited`;
    },

    smsCodeIncorrect() {
        return `sms code is incorrect`;
    },

    validationError() {
        return `validation error`;
    },

    smsCodeExpired() {
        return `sms code is expired`;
    },

    smsCodeNotSended() {
        return `sms code not sended`;
    },

    mustBeTheAdmin() {
        return "you must be the admin";
    },

    regionUsed() {
        return "region used now";
    },
    categoryUsed() {
        return "category used now";
    },
    documentNotFound() {
        return "document not found";
    },
    commentPatchError() {
        return "comment can't be modified";
    },
    commentDeleteError() {
        return "comment can't be deleted";
    }
};
