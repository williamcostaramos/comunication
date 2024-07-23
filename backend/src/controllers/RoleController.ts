import {Request, Response} from "express";
import CreateRoleService from "../services/RoleServices/CreateRoleService";

interface paginate {
  size?: number;
  totalRecords?: number;
  perPage?: number;
}

interface RoleData {
  name: string;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const newRole: RoleData = {...req.body};
    const role = await CreateRoleService(newRole)
    return res.status(200).json(role);
  } catch (error) {
    return res.status(400).json(error);
  }
}

