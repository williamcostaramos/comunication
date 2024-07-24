import Feature from "../../models/Feature";
import * as Yup from "yup";
import AppError from "../../errors/AppError";

export  interface Request {
  id?: number | string;
  name?: string;
  description?: string;
}

export const CreateFeatureService = async (request: Request): Promise<Feature> => {
  if (!await validate(request)) {
    throw new AppError("ERR_SAVE_FEATURE", 400);
  }
  return await Feature.create({name: request.name, description: request.description});
}

const validate = async (request: Request): Promise<boolean> => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required()
    });
    await schema.validate(request);
    return true;
  } catch (error) {
    return false;
  }
}
