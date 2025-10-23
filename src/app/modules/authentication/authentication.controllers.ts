import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import resHandler from "../../utils/resHandler";
import safeAsync from "../../utils/safeAsync";

const signIn = safeAsync(async (req: Request, res: Response) => {
  const credential = resHandler(res, {
    success: true,
    message: message("signIn", "user"),
    status: StatusCodes.OK,
  });
});
export const authenticationControllers = {
  signIn,
};
