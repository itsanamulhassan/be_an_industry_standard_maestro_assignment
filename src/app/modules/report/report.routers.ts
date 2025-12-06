import { Router } from "express";
import { reportSchemas } from "./report.schemas";
import { validator } from "../../middlewares/validator.middleware";
import { reportControllers } from "./report.controllers";
import { multerUpload } from "../../configurations/multer";

const reportRouter = Router();

// ✅ Create report
reportRouter.post(
  "/",
  validator.role("RIDER", "DRIVER"),
  multerUpload("report_screenshots").array("files"),
  validator.schema(reportSchemas.create),
  reportControllers.createReport
);

// ✅ List of all reports
reportRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  reportControllers.listReports
);

// ✅ List of all reports for DRIVER, RIDER
reportRouter.get(
  "/history",
  validator.role("DRIVER", "RIDER"),
  reportControllers.listHistories
);
// ✅ List of single report by Id for DRIVER, RIDER
reportRouter.get(
  "/:reports/history",
  validator.role("DRIVER", "RIDER"),
  reportControllers.getHistory
);

//✅ Get single report
reportRouter.get(
  "/:reportId",
  validator.role("ADMIN", "SUPERADMIN"),
  //   validator.schema(reportSchemas.getReportSchema),
  reportControllers.getReport
);

// ✅ Update update (RIDER, DRIVER)
reportRouter.patch(
  "/:reportId",
  validator.role("RIDER", "DRIVER"),
  multerUpload("report_screenshots").array("files"),
  validator.schema(reportSchemas.update),
  reportControllers.updateReport
);

// ✅ Resolve a report (ADMIN, SUPERADMIN)
reportRouter.patch(
  "/:reportId/resolve",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(reportSchemas.resolve),
  reportControllers.resolveReport
);

// ✅ Soft-delete report
reportRouter.delete(
  "/:reportId",
  validator.role("SUPERADMIN"),
  reportControllers.deleteReport
);

export default reportRouter;
