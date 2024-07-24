"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTransporter = void 0;
const nodemailer_1 = require("nodemailer");
exports.emailTransporter = (0, nodemailer_1.createTransport)({
    service: 'gmail',
    auth: {
        user: "nguyenduyhung04092004@gmail.com",
        pass: "exrz crko utdb diob",
    }
});
//# sourceMappingURL=email.js.map