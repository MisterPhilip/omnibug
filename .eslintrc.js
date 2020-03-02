module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "ignorePatterns": [
        "./**",
        "build/",
        "coverage/",
        "platform/",
        "providers.js",
        "src/assets/js/**",
        "test/"
    ],
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "no-unused-vars": [
            1,
            {
                "args": "none",
                "ignoreRestSiblings": true,
                "varsIgnorePattern": "Provider"
            }
        ],
        "quotes": [
            "error",
            "double",
            {
                "allowTemplateLiterals": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unsafe-finally": [
            1
        ]
    },
    "globals": {
        "chrome": "readonly",
        "BaseProvider": "writeable"
    }
};