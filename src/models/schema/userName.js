const _validateNameCharSet = new Set(
    "ёйцуккенгшщзхъфывапролджэячсмитьбюqwertyuiopasdfghjklzxcvbnm".split("")
);
function validateName(value) {
    return Boolean(
        value
            .split("")
            .reduce((acc, v) => acc && _validateNameCharSet.has(v.toLowerCase()))
    );
}



module.exports = {
    type: String,
    validate: {
        validator: validateName,
        message: props => (`${props.value} is not a valid name string`)
    }
};
