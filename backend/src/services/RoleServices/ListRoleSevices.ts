import Role from "../../models/Role";

interface Request {
  tenantId: string | number;
}

const listRoleSevices = async (): Promise<Role[]> => {
  return await Role.findAll();
}
export default listRoleSevices;
