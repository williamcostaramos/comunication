import Feature from "../../models/Feature";
import * as Yup from "yup";
import appError from "../../errors/AppError";
import {request} from "node:http";


export interface Request {
  id: number | string;
  name: string;
  description?: string;
}

export const updateFeatureService = async (request: Request): Promise<Feature> => {
  const feature = await Feature.findOne({where: {id: request.id}});
  if (!feature) {
    throw new appError("ERROR_FEATURE_NOT_FOUND", 404);
  }
  if (!await validate(request)) {
    throw new appError("ERROR_UPDATED_FEATURE_ERROR", 400);
  }
  await feature.update({name: request.name, description: request.description});
  await feature.reload();
  return feature;
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
