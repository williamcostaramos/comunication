import Role from "../../models/Role";
import AppError from "../../errors/AppError";

interface Request {
  roleId: number;
}

const DeleteRoleService = async (request: Request): Promise<void> => {
  const role = await Role.findOne({where: {id: request.roleId}});
  if (!role) {
    throw new AppError("ERR_NO_ROLE_FOUND", 404);
  }
  try {
    await role.destroy();
  } catch (error) {
    throw new AppError("ERR_ROLE_IN_USE", 404);
  }

}
export default DeleteRoleService;
