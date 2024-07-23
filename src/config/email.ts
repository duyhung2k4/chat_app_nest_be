import { createTransport } from "nodemailer";

export const emailTransporter = createTransport({
    service: 'gmail',
    auth: {
        user: "nguyenduyhung04092004@gmail.com",
        pass: "exrz crko utdb diob",
    }
});

export type EmailTransporter = typeof emailTransporter;