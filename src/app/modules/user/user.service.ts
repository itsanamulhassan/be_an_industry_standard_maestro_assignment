import AppError from "app/helpers/error.helper";
import { CreateUserProps } from "./user.type";
import message from "app/utils/message";
import { StatusCodes } from "http-status-codes";

const createUser = async (payload: Partial<CreateUserProps>) => {
  const { email, password, ...rest } = payload as CreateUserProps;

  if (["ADMIN", "SUPERADMIN"].includes(rest.role)) {
    throw new AppError(
      message("unauthorized", rest.role),
      StatusCodes.FORBIDDEN
    );
  }

  const isUserExist = await Users.findOne({ email });
  if (isUserExist) {
    throw new AppError(
      message("alreadyExists", "user"),
      StatusCodes.BAD_REQUEST
    );
  }

  const hashPassword = await bcryptjs.hash(
    password as string,
    env.bcrypt_salt_round
  );

  const authProvider: AuthProviderProps = {
    provider: "CREDENTIAL",
    providerId: email,
  };
  return await Users.create({
    email,
    ...rest,
    auths: [authProvider],
    password: hashPassword,
  });
};

const retrieveUsers = async () => {
  const users = await Users.find();

  return users;
};

const updateUser = async (req: Request) => {
  const {
    params: { id: userId },
    user: { role },
    body,
  } = req as Request & { user: { role: string } };

  const isUserExist = await Users.findById(userId);
  if (!isUserExist) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  // USER or GUIDE restrictions
  if (["USER", "GUIDE"].includes(role)) {
    const forbidden =
      (body.role && body.role !== role) ||
      ["INACTIVE", "BLOCKED"].includes(body.activityStatus) ||
      body.isDeleted === true ||
      body.isVerified === false;

    if (forbidden) {
      throw new AppError(message("forbidden", role), StatusCodes.FORBIDDEN);
    }
  }

  // ADMIN restrictions
  if (role === "ADMIN" && body.role === "SUPERADMIN") {
    throw new AppError(
      message("forbidden", "ADMIN (cannot assign SUPERADMIN)"),
      StatusCodes.FORBIDDEN
    );
  }
  if (body.password) {
    body.password = await bcryptjs.hash(body.password, env.bcrypt_salt_round);
  }
  const updateUser = await Users.findByIdAndUpdate(userId, body, {
    new: true,
    runValidators: true,
  });
  return updateUser;
};

const userServices = {
  createUser,
  retrieveUsers,
  updateUser,
};

export default userServices;
