import { Users } from "../user.models";
import bcrypt from "bcryptjs";
import message from "../../../utils/message";
import { StatusCodes } from "http-status-codes";
import environments from "../../../configurations/environments";
import AppError from "../../../helpers/error.helper";

const initializeDefaultUser = async () => {
  try {
    const { super_admin, admin, bcrypt_salt_round } = environments;
    const hasSuperadmin = await Users.findOne({ email: super_admin.email });
    const hasAdmin = await Users.findOne({ email: admin.email });

    if (!hasSuperadmin) {
      const hashPasswordSuperAdmin = await bcrypt.hash(
        super_admin.password,
        bcrypt_salt_round
      );
      await Users.create({
        name: "superadmin",
        email: super_admin.email,
        role: "SUPERADMIN",
        password: hashPasswordSuperAdmin,
        auths: [{ provider: "CREDENTIAL", providerId: super_admin.email }],
      });
    }

    if (!hasAdmin) {
      const hashPasswordAdmin = await bcrypt.hash(
        admin.password,
        bcrypt_salt_round
      );
      await Users.create({
        name: "admin",
        email: admin.email,
        role: "ADMIN",
        password: hashPasswordAdmin,
        auths: [{ provider: "CREDENTIAL", providerId: admin.email }],
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
