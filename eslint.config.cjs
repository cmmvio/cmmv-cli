const eslint = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const prettier = require("eslint-plugin-prettier");
const globals = require("globals");

module.exports = [
    {
        ignores: ['eslint.config.cjs', 'eslint.config.mjs'],
    },
    eslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: 'module',
            parser: tsparser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
                sourceType: "module",
                ecmaFeatures: {
                    experimentalDecorators: true,
                },
            },
            globals: {
                ...globals.node,
                ...globals.jest,
            }
        },
        files: ["src/**/*.ts", "apps/**/*.ts", "libs/**/*.ts", "test/**/*.ts"],
        ignores: [
            "node_modules", "dist", "build", ".generated",
            "eslint.config.cjs", "eslint.config.mjs"
        ],
        plugins: {
            "@typescript-eslint": tseslint,
            prettier
        },
        rules: {
            ...prettier.configs.recommended.rules,
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "no-undef": "off"
        },
        settings: {
            env: {
                node: true,
                jest: true
            }
        }
    }
];
