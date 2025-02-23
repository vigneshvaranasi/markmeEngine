"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const cors_1 = __importDefault(require("cors"));
const default_1 = __importDefault(require("./configs/default"));
const db_1 = __importDefault(require("./configs/db"));
const auth_1 = __importDefault(require("./routes/v1/auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
(0, db_1.default)().then(() => {
    app.get('/', (req, res) => {
        res.send('Markme Engine');
    });
    app.use('/v1/auth', auth_1.default);
    app.listen(default_1.default.PORT, () => {
        console.log('Server is Running on http://localhost:' + default_1.default.PORT);
    });
});
