"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const ENV = {
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL
};
exports.default = ENV;
