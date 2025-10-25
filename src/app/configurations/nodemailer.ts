import nodemailer from "nodemailer";
import environments from "./environments";

const transporter = nodemailer.createTransport({
  secure: true,
  auth: {
    pass: environments.smtp.pass,
    user: environments.smtp.user,
  },
  port: environments.smtp.port,
  host: environments.smtp.host,
});

export default transporter;
