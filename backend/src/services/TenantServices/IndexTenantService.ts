import Tenant from "../../models/Tenant";

export const IndexTenantService = async (): Promise<Tenant[]> => {
  return Tenant.findAll();
};
