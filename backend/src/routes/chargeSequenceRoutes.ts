import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ChargeSequenceController from "../controllers/ChargeSequenceController";

const chargeSequenceRoutes = Router();

chargeSequenceRoutes.get(
  "/charge-sequences",
  isAuth,
  ChargeSequenceController.index
);
chargeSequenceRoutes.post(
  "/charge-sequences",
  isAuth,
  ChargeSequenceController.store
);
chargeSequenceRoutes.put(
  "/charge-sequences/:chargeSequenceId",
  isAuth,
  ChargeSequenceController.update
);
chargeSequenceRoutes.post(
  "/charge-sequences/:chargeSequenceId/start",
  isAuth,
  ChargeSequenceController.start
);
chargeSequenceRoutes.post(
  "/charge-sequences/:chargeSequenceId/cancel",
  isAuth,
  ChargeSequenceController.cancel
);
chargeSequenceRoutes.post(
  "/charge-sequences/:chargeSequenceId/contacts",
  isAuth,
  ChargeSequenceController.addContacts
);
chargeSequenceRoutes.post(
  "/charge-sequences/:chargeSequenceId/contacts/:contactId/stop",
  isAuth,
  ChargeSequenceController.stopContact
);
chargeSequenceRoutes.delete(
  "/charge-sequences/:chargeSequenceId",
  isAuth,
  ChargeSequenceController.remove
);

export default chargeSequenceRoutes;
