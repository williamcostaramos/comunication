import * as Yup from "yup";
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import CreateChargeSequenceService from "../services/ChargeSequenceServices/CreateChargeSequenceService";
import ListChargeSequenceService from "../services/ChargeSequenceServices/ListChargeSequenceService";
import DeleteChargeSequenceService from "../services/ChargeSequenceServices/DeleteChargeSequenceService";
import UpdateChargeSequenceService from "../services/ChargeSequenceServices/UpdateChargeSequenceService";
import StartChargeSequenceService from "../services/ChargeSequenceServices/StartChargeSequenceService";
import CancelChargeSequenceService from "../services/ChargeSequenceServices/CancelChargeSequenceService";
import CreateChargeSequenceContactsService from "../services/ChargeSequenceServices/CreateChargeSequenceContactsService";
import StopChargeSequenceContactService from "../services/ChargeSequenceServices/StopChargeSequenceContactService";

interface ChargeSequenceData {
  name: string;
  start: Date | string;
  message: string;
  userId: string;
  sessionId: string | number;
  delay: number | string;
  tenantId: string | number;
  recurrenceType?: string;
  recurrenceInterval?: number;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const medias = req.files as Express.Multer.File[];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  console.log("Received request to create charge sequence with data:", req);

  const chargeSequence = {
    name: req.body.name,
    start: new Date(req.body.start),
    message: req.body.message,
    userId: Number(req.user.id),
    sessionId: Number(req.body.sessionId),
    delay: Number(req.body.delay || 20000),
    tenantId: Number(tenantId),
    recurrenceType: req.body.recurrenceType || "daily",
    recurrenceInterval: req.body.recurrenceInterval
      ? Number(req.body.recurrenceInterval)
      : undefined
  };

  console.log("Received charge sequence data:", chargeSequence);

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    start: Yup.date().required(),
    message: Yup.string().required(),
    userId: Yup.number().required(),
    sessionId: Yup.number().required(),
    tenantId: Yup.number().required(),
    delay: Yup.number().positive(),
    recurrenceType: Yup.string().oneOf([
      "daily",
      "weekly",
      "monthly",
      "indefinite"
    ]),
    recurrenceInterval: Yup.number().positive()
  });

  try {
    await schema.validate(chargeSequence);
  } catch (error: any) {
    throw new AppError(error.message);
  }

  const newChargeSequence = await CreateChargeSequenceService({
    chargeSequence,
    medias
  });

  return res.status(200).json(newChargeSequence);
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { searchParam, pageNumber, status } = req.query as any;

  const { chargeSequences, count, hasMore } =
    await ListChargeSequenceService({
      tenantId: Number(tenantId),
      searchParam,
      pageNumber,
      status
    });

  return res.status(200).json({ chargeSequences, count, hasMore });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { chargeSequenceId } = req.params;
  const medias = req.files as Express.Multer.File[];

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const chargeSequenceData = {
    name: req.body.name,
    message: req.body.message,
    delay: req.body.delay ? Number(req.body.delay) : undefined,
    recurrenceType: req.body.recurrenceType,
    recurrenceInterval: req.body.recurrenceInterval
      ? Number(req.body.recurrenceInterval)
      : undefined
  };

  const updated = await UpdateChargeSequenceService({
    chargeSequenceId,
    tenantId: Number(tenantId),
    chargeSequenceData,
    medias
  });

  return res.status(200).json(updated);
};

export const start = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { chargeSequenceId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await StartChargeSequenceService({
    chargeSequenceId,
    tenantId
  });

  return res.status(200).json({ message: "Charge sequence started" });
};

export const cancel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { chargeSequenceId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await CancelChargeSequenceService({
    chargeSequenceId,
    tenantId
  });

  return res.status(200).json({ message: "Charge sequence cancelled" });
};

export const addContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { chargeSequenceId } = req.params;
  const { contacts } = req.body as any;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await CreateChargeSequenceContactsService({
    chargeSequenceContacts: contacts,
    chargeSequenceId: Number(chargeSequenceId)
  });

  return res.status(200).json({ message: "Contacts added to charge sequence" });
};

export const stopContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { chargeSequenceId, contactId } = req.params;
  const { reason } = req.body;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const stopped = await StopChargeSequenceContactService({
    chargeSequenceContactId: Number(contactId),
    reason
  });

  return res.status(200).json(stopped);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const { chargeSequenceId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteChargeSequenceService(
    chargeSequenceId,
    Number(tenantId)
  );

  return res.status(200).json({ message: "Charge sequence deleted" });
};

export default {
  store,
  index,
  update,
  start,
  cancel,
  addContacts,
  stopContact,
  remove
};
