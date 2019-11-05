module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true,
        "jest/globals": true
    },
    plugins: ["prettier", "jest"],
    extends: ["eslint:recommended", "plugin:jest/recommended", "plugin:jest/style"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        "prettier/prettier": "warn",
        "require-atomic-updates": "off",
        curly: "warn",
        "jest/valid-describe": "off"
    }
};
