import express from "express";
import isAuth from "../middleware/isAuth";

import * as TenantController from "../controllers/TenantController";

const tenantRoutes = express.Router();

tenantRoutes.post("/tenants", TenantController.store);
tenantRoutes.get("/tenants", TenantController.index);
tenantRoutes.put("/tenants/:tenantId", isAuth, TenantController.updateTenant);

// tenantRoutes.post("/tenants", isAuth, TenantController.store);
tenantRoutes.get(
  "/tenants/business-hours/",
  isAuth,
  TenantController.showBusinessHoursAndMessage
);
tenantRoutes.put(
  "/tenants/business-hours/",
  isAuth,
  TenantController.updateBusinessHours
);
tenantRoutes.put(
  "/tenants/message-business-hours/",
  isAuth,
  TenantController.updateMessageBusinessHours
);


export default tenantRoutes;
