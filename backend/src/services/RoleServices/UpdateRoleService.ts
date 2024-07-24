import Role from "../../models/Role";
import AppError from "../../errors/AppError";

interface Request {
  name: string,
  roleId: number | string
}

const UpdateRoleService = async ({name, roleId}: Request): Promise<Role> => {
  const role = await Role.findOne({where: {id: roleId}, attributes: ['id', 'name']});
  if (!role) {
    throw new AppError("ERR_NO_ROLE_FOUND", 404);
  }
  await role.update({name: name.toUpperCase()});
  await role.reload({attributes: ['id', 'name']});
  return role;
}

export default UpdateRoleService;

