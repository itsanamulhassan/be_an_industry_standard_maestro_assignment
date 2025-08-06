import { Users } from "../modules/user/user.models";
import env from "../configurations/env";
import bcrypt from "bcryptjs";
import AppError from "../errorHelper/appError";
import message from "./message";
import { StatusCodes } from "http-status-codes";

const initializeDefaultUser = async () => {
  try {
    const {
      super_admin_email: email,
      super_admin_password: password,
      bcrypt_salt_round,
    } = env;
    const defaultUser = await Users.findOne({ email });

    if (!defaultUser) {
      const hashPassword = await bcrypt.hash(password, bcrypt_salt_round);

      await Users.create({
        name: "Super Admin",
        email,
        role: "SUPERADMIN",
        password: hashPassword,
        auths: [{ provider: "CREDENTIAL", providerId: email }],
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        message("badRequest", "user"),
        StatusCodes.BAD_REQUEST
      );
    }
  }
};
export default initializeDefaultUser;
