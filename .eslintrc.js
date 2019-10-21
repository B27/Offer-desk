module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true
    },
    plugins: ["prettier"],
    extends: "eslint:recommended",
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
        "curly": "warn"
    }
};
