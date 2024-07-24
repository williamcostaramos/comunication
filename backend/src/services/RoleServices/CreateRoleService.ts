import Role from "../../models/Role";
import * as Yup from "yup";
import AppError from "../../errors/AppError";

interface Request {
  name: string,
}

const CreateRoleService = async (request: Request): Promise<Role> => {
  if (!await validate(request)) {
    throw new AppError("ERR_SAVE_ROLE", 400);
  }
  return await Role.create({name: request.name.toUpperCase()})
}

const validate = async (request:Request): Promise<boolean> => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required()
    });
    await schema.validate(request);
    return true;
  } catch (error) {
    return false;
  }
}
export default CreateRoleService;
