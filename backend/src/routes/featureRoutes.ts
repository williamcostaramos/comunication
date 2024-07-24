import express from "express";
import isAuth from "../middleware/isAuth";
import * as FeatureController from "../controllers/FeatureController";

import * as TenantController from "../controllers/TenantController";

const featureRoutes = express.Router();

featureRoutes.get("/features/:id", isAuth, FeatureController.show);
featureRoutes.post("/features", isAuth, FeatureController.store);
featureRoutes.put("/features/:id", isAuth, FeatureController.update);
featureRoutes.delete("/features/:id", isAuth, FeatureController.destroy);

export default featureRoutes;
