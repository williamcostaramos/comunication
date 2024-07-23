import Tenant from "../../models/Tenant";

interface InputTenant {
  name: string;
  status: string;
  ownerId: string | number;
  messageBusinessHours: string;
}

const CreateTenantService = async ({
                                     name,
                                     status,
                                     ownerId,
                                     messageBusinessHours
                                   }: InputTenant): Promise<Tenant> => {
  return await Tenant.create({
    name,
    status,
    ownerId,
    messageBusinessHours
  });
  
};

export default CreateTenantService;

