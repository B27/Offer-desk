module.exports = {
    userNotFound(phoneNumber) {
        return `user with phone number ${phoneNumber} not found`;
    },
    smsCodeExceededNumberOfTry(phoneNumber) {
        return `number of attempts to enter sms code to user ${phoneNumber} overlimited`;
    },
    smsCodeIncorrectCode(phoneNumber){
        return `smsCode is incorrect`;
    },

    mustBeTheAdmin(){
        return 'you must be the admin';
    },

    regionUsed(){
        return 'region used now';
    },
    categoryUsed(){
        return 'category used now';
    },
    documentNotFound(){
        return "document not found";
    },
    commentPatchError(){
        return "comment can't be modified";
    },
    commentDeleteError(){
        return "comment can't be deleted";
    }
};