import express from "express";
import isAuth from "../middleware/isAuth";

import * as TenantController from "../controllers/TenantController";

const roleRoutes = express.Router();

roleRoutes.post("/tenants", isAuth, TenantController.store);

export default roleRoutes;
