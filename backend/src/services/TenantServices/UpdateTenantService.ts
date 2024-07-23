import Tenant from "../../models/Tenant";
import AppError from "../../errors/AppError";

interface TenantData {
  name?: string;
  status?: string;
  ownerId?: string | number;
  messageBusinessHours?: string;
}

const updateTenant = async (data: TenantData, id: number): Promise<Tenant> => {
  const tenant = await Tenant.findOne({ where: { id } });
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }
  return tenant.update(data);
};
export default updateTenant;
