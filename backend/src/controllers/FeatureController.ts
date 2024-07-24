import {Request, Response} from "express";
import {logger} from "../utils/logger";
import {CreateFeatureService} from "../services/FeatureServices/CreateFeatureService";
import {updateFeatureService} from "../services/FeatureServices/UpdateFeatureService";
import {DeleteFeatureService} from "../services/FeatureServices/DeleteFeatureService";
import {ListFeatureService} from "../services/FeatureServices/ListFeatureService";

interface paginate {
  size?: number;
  totalRecords?: number;
  perPage?: number;
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id} = req.params;
    const feature = await ListFeatureService(id);
    return res.status(200).json(feature);
  } catch (error) {
    logger.error(error.message);
    return res.status(error.statusCode).json(error);
  }
}


export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {name, description} = req.body;
    const feature = await CreateFeatureService({name, description});
    return res.status(200).json(feature);
  } catch (error) {
    logger.error(error.message);
    return res.status(error.statusCode).json(error);
  }
}

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {name, description} = req.body;
    const {id} = req.params;
    const feature = await updateFeatureService({id, name, description});
    return res.status(200).json(feature);
  } catch (error) {
    logger.error(error.message);
    return res.status(error.statusCode).json(error);
  }
}

export const destroy = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id} = req.params;
    await DeleteFeatureService({id});
    return res.status(204).json({"message": "Feature deleted successfully."});
  } catch (error) {
    logger.error(error.message);
    return res.status(error.statusCode).json(error);
  }
}

