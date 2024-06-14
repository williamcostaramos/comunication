import { isMatch } from "date-fns";
import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";

import CreateTenantService from "../services/TenantServices/CreateTenantService";
import ShowBusinessHoursAndMessageService from "../services/TenantServices/ShowBusinessHoursAndMessageService";
import UpdateBusinessHoursService from "../services/TenantServices/UpdateBusinessHoursService";
import UpdateMessageBusinessHoursService from "../services/TenantServices/UpdateMessageBusinessHoursService";
import UpdateTenantService from "../services/TenantServices/UpdateTenantService";

interface TenantData {
  name: string;
  status: string;
  ownerId: string | number;
  messageBusinessHours: string;
}

export const store = async (
  req: Request,
  response: Response
): Promise<Response> => {
  const newTenant: TenantData = { ...req.body };

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    status: Yup.string().required(),
    ownerId: Yup.number().required()
  });

  try {
    await schema.validate(newTenant);
  } catch (error) {
    throw new AppError(error.message);
  }

  const tenant = await CreateTenantService(newTenant);
  return response.status(201).json(tenant);
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  const tenant: TenantData = { ...req.body };

  try {
    const shcema = Yup.object({
      name: Yup.string().notRequired(),
      status: Yup.string().notRequired()
    });
    await shcema.validate(tenant);
  } catch (error) {
    throw new AppError("Bad Request", 400);
  }
  const tenantUp = await UpdateTenantService(tenant, Number(tenantId));
  return res.status(200).json(tenantUp);
};
export const updateBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const businessHours = req.body;

  const schema = Yup.array().of(
    Yup.object().shape({
      day: Yup.number().required().integer(),
      label: Yup.string().required(),
      type: Yup.string().required(),
      hr1: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm")
        ),
      hr2: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value => {
          return isMatch(value || "", "HH:mm");
        }),
      hr3: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm")
        ),
      hr4: Yup.string()
        .required()
        // eslint-disable-next-line no-template-curly-in-string
        .test("isHoursValid", "${path} is not valid", value =>
          isMatch(value || "", "HH:mm")
        )
    })
  );

  try {
    await schema.validate(businessHours);
  } catch (error) {
    throw new AppError(error.message);
  }

  const newBusinessHours = await UpdateBusinessHoursService({
    businessHours,
    tenantId
  });

  return res.status(200).json(newBusinessHours);
};

export const updateMessageBusinessHours = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { messageBusinessHours } = req.body;

  if (!messageBusinessHours) {
    throw new AppError("ERR_NO_MESSAGE_INFORMATION", 404);
  }

  const newBusinessHours = await UpdateMessageBusinessHoursService({
    messageBusinessHours,
    tenantId
  });

  return res.status(200).json(newBusinessHours);
};

export const showBusinessHoursAndMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;

  const tenant = await ShowBusinessHoursAndMessageService({ tenantId });

  return res.status(200).json(tenant);
};
