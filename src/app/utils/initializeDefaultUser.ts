import bcrypt from "bcryptjs";
import message from "./message";
import { StatusCodes } from "http-status-codes";
import environments from "app/configurations/environments";
import { Users } from "app/modules/user/user.model";
import AppError from "app/helpers/error.helper";

const initializeDefaultUser = async () => {
  try {
    const {
      super_admin_email: email,
      super_admin_password: password,
      bcrypt_salt_round,
    } = environments;
    const defaultUser = await Users.findOne({ email });

    if (!defaultUser) {
      const hashPassword = await bcrypt.hash(password, bcrypt_salt_round);

      await Users.create({
        name: "Super Admin",
        email,
        role: "SUPERADMIN",
        password: hashPassword,
        isApproved: true,
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
