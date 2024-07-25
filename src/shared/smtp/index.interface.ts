import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Transporter } from "nodemailer";

export interface SmtpInterface {
    GetEmailTransporter(): Transporter<SMTPTransport.SentMessageInfo>
}