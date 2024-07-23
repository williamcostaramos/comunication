import Role from "../../models/Role";
import * as Yup from "yup";
import AppError from "../../errors/AppError";

interface Request {
  name: String,
}

const CreateRoleService = async (request: Request): Promise<Role> => {
  if (!await validate(request)) {
    throw new AppError("ERR_SAVE_ROLE", 400);
  }
  return await Role.create({name: request.name.toUpperCase()})
}

const validate = async (request: Request): Promise<boolean> => {
  try {
    const schema = Yup.object({
      name: Yup.string().required(),
    });
    await schema.validate(request.name);
    return true;
  } catch (error) {
    return false;
  }
}
export default CreateRoleService;
