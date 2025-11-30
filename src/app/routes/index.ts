import { Router } from "express";
import userRouter from "../modules/user/user.routers";
import authenticationRouter from "../modules/authentication/authentication.routers";
import otpRouter from "../modules/otp/otp.routers";
import riderRouter from "../modules/rider/rider.routers";
import driverRouter from "../modules/driver/driver.routers";
import reportRouter from "../modules/report/report.routers";
import rideRouter from "../modules/ride/ride.routers";
import paymentRouter from "../modules/payment/payment.routers";

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
  {
    path: "/riders",
    router: riderRouter,
  },
  {
    path: "/drivers",
    router: driverRouter,
  },
  {
    path: "/rides",
    router: rideRouter,
  },
  {
    path: "/reports",
    router: reportRouter,
  },
  {
    path: "/payments",
    router: paymentRouter,
  },
];

// Register all routes with the main "appRouter"
routes.forEach(({ path, router }: RouteProps) => {
  appRouter.use(path, router);
});

export default appRouter;
