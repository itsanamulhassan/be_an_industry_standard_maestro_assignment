import { Router } from "express";
import userRouter from "../modules/user/user.routers";
import authenticationRouter from "../modules/authentication/authentication.routers";
import otpRouter from "../modules/otp/otp.routers";

const appRouter = Router();

interface RouteProps {
  path: string;
  router: Router;
}
const routes: RouteProps[] = [
  {
    path: "/users",
    router: userRouter,
  },
  {
    path: "/authentications",
    router: authenticationRouter,
  },
  {
    path: "/otp",
    router: otpRouter,
  },
];

// Register all routes with the main "appRouter"
routes.forEach(({ path, router }: RouteProps) => {
  appRouter.use(path, router);
});

export default appRouter;
