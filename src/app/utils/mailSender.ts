import { StatusCodes } from "http-status-codes";
import AppError from "../helpers/error.helper";
import { MailSenderProps } from "../types/utils.types";
import message from "./message";
import path from "path";
import ejs from "ejs";
import transporter from "../configurations/nodemailer";
import environments from "../configurations/environments";

const mailSender = async <T>({
  subject,
  template,
  to,
  attachments,
  data,
}: MailSenderProps<T>) => {
  try {
    const file = path.join(__dirname, "..", "templates", `${template}.ejs`);

    const html = await ejs.renderFile(file, data && data);
    await transporter.sendMail({
      from: environments.smtp.from,
      to,
      attachments,
      html,
      subject,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        message("badRequest", "email sender", error.message),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
};

export default mailSender;
