import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Feature from "../../models/Feature";

interface Request {
  id: string;
}

export const DeleteFeatureService = async (request: Request): Promise<void> => {
  if (!await validate(request)) {
    throw new AppError("ERROR_DELETE_FEATURE", 400);
  }
  const feature = await Feature.findOne({where: {id: request.id}});
  if (!feature) {
    throw new AppError("ERROR_DELETE_FEATURE", 400);
  }
  await feature.destroy()
}

const validate = async (request: Request): Promise<boolean> => {
  try {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
    });
    await schema.validate(request);
    return true;
  } catch (error) {
    return false;
  }
}
