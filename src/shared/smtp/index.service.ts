import { Injectable } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

@Injectable()
export class SmtpService {
    private emailTransporter: Transporter<SMTPTransport.SentMessageInfo>;

    constructor() {
        this.emailTransporter = createTransport({
            service: 'gmail',
            auth: {
                user: "nguyenduyhung04092004@gmail.com",
                pass: "exrz crko utdb diob",
            }
        })
    }

    GetEmailTransporter(): Transporter<SMTPTransport.SentMessageInfo> {
        return this.emailTransporter;
    }
}