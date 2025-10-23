import { Router } from "express";
import userRouter from "../modules/user/user.routers";

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
];

// Register all routes with the main "appRouter"
routes.forEach(({ path, router }: RouteProps) => {
  appRouter.use(path, router);
});

export default appRouter;
