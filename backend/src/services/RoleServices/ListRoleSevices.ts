import Role from "../../models/Role";
import AppError from "../../errors/AppError";

export const listRoleSevices = async (): Promise<Role[]> => {
  return await Role.findAll();
}

export const findOne = async (id: string): Promise<Role> => {
  const role = await Role.findOne({where: {id: id}});
  if (!role) {
    throw new AppError("ERROR_ROLE_NOT_FOUND", 404);
  }
  return role;
}
