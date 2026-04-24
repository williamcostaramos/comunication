import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ChargeController from "../controllers/ChargeController";

const chargeRoutes = Router();

chargeRoutes.get("/charges", isAuth, ChargeController.index);
chargeRoutes.post("/charges", isAuth, ChargeController.store);
chargeRoutes.get("/charges/:chargeId", isAuth, ChargeController.show);
chargeRoutes.put("/charges/:chargeId", isAuth, ChargeController.update);
chargeRoutes.post("/charges/:chargeId/pay", isAuth, ChargeController.pay);
chargeRoutes.delete("/charges/:chargeId", isAuth, ChargeController.remove);

export default chargeRoutes;
