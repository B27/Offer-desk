module.exports = {
    type: [Number],
    validate: {
        validator: function([lng, lat]) {
            return lng > -180 && lng < 180 && lat > -90 && lng < 90;
        },
        message: ({ value: [lng, lat] }) =>
            `[${lng},${lat}] is not a valid geo pair, coordinates must be in range lng [-180,180], lat [-90,90]`
    }
};
