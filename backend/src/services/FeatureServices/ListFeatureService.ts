import Feature from "../../models/Feature";
import appError from "../../errors/AppError";

export const ListFeatureService = async (id: string): Promise<Feature | null> => {
  try {
    const feature = await Feature.findOne({where: {id: id}});
    if (!feature) {
      throw new appError("ERROR_FEATURE_NOT_FOUND", 404);
    }
    return feature;
  } catch (error) {
    throw new appError("ERROR_FEATURE_NOT_FOUND", 404);
  }
}

