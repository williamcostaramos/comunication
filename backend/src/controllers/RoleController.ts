import {Request, Response} from "express";
import CreateRoleService from "../services/RoleServices/CreateRoleService";
import UpdateRoleService from "../services/RoleServices/UpdateRoleService";
import deleteRoleService from "../services/RoleServices/DeleteRoleService";
import {logger} from "../utils/logger";
import {findOne} from "../services/RoleServices/ListRoleSevices";

interface paginate {
  size?: number;
  totalRecords?: number;
  perPage?: number;
}

interface RoleData {
  name: string;
  id?: number;
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id;
    const role = await findOne(id);
    return res.status(200).json(role);
  } catch (error) {
    logger.error(error);
    return res.status(500).send(error.message);
  }
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newRole: RoleData = {...req.body};
    const role = await CreateRoleService(newRole)
    return res.status(200).json(role);
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json(error);
  }
}

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {name}: RoleData = {...req.body};
    const {id} = req.params
    const role = await UpdateRoleService({name, roleId: id})
    return res.status(200).json(role);
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json(error);
  }
}

export const destroy = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {roleId} = req.params;
    await deleteRoleService({roleId});
    return res.status(204).json({"message": "Role deleted successfully."});
  } catch (error) {
    logger.error(error.message);
    return res.status(400).json(error);
  }
}

