import express from "express";
import isAuth from "../middleware/isAuth";
import * as RoleController from "../controllers/RoleController";

const roleRoutes = express.Router();

roleRoutes.post("/roles", isAuth, RoleController.store);
roleRoutes.get("/roles/:id", isAuth, RoleController.show);
roleRoutes.put("/roles/:id", isAuth, RoleController.update);
roleRoutes.delete("/roles/:roleId", isAuth, RoleController.destroy);

export default roleRoutes;
