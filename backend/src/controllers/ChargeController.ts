import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import CreateChargeService from "../services/ChargeServices/CreateChargeService";
import ListChargesService from "../services/ChargeServices/ListChargesService";
import UpdateChargeService from "../services/ChargeServices/UpdateChargeService";
import ShowChargeService from "../services/ChargeServices/ShowChargeService";
import DeleteChargeService from "../services/ChargeServices/DeleteChargeService";
import PayChargeService from "../services/ChargeServices/PayChargeService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
  contactId?: string;
  ticketId?: string;
  status?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { searchParam, pageNumber, contactId, ticketId, status } =
    req.query as IndexQuery;

  const { charges, count, hasMore } = await ListChargesService({
    tenantId: Number(tenantId),
    searchParam,
    pageNumber,
    contactId: contactId ? Number(contactId) : undefined,
    ticketId: ticketId ? Number(ticketId) : undefined,
    status
  });

  return res.json({ charges, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { description, amount, contractNumber, dueDate, fileUrl, notes, contactId, ticketId } =
    req.body;

  const charge = await CreateChargeService({
    description,
    amount,
    contractNumber,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    fileUrl,
    notes,
    contactId: contactId ? Number(contactId) : undefined,
    ticketId: ticketId ? Number(ticketId) : undefined,
    tenantId: Number(tenantId)
  });

  const io = getIO();
  io.emit(`${tenantId}:charge`, {
    action: "create",
    charge
  });

  return res.status(201).json(charge);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { chargeId } = req.params;
  const { tenantId } = req.user;

  const charge = await ShowChargeService(chargeId, Number(tenantId));

  return res.status(200).json(charge);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chargeId } = req.params;
  const { tenantId } = req.user;
  const { description, amount, contractNumber, dueDate, fileUrl, notes, status } = req.body;

  const charge = await UpdateChargeService({
    chargeId,
    tenantId: Number(tenantId),
    description,
    amount,
    contractNumber,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    fileUrl,
    notes,
    status
  });

  const io = getIO();
  io.emit(`${tenantId}:charge`, {
    action: "update",
    charge
  });

  return res.status(200).json(charge);
};

export const pay = async (req: Request, res: Response): Promise<Response> => {
  const { chargeId } = req.params;
  const { tenantId } = req.user;
  const { amount, method, reference } = req.body;

  const charge = await PayChargeService({
    chargeId,
    tenantId: Number(tenantId),
    amount,
    method,
    reference
  });

  const io = getIO();
  io.emit(`${tenantId}:charge`, {
    action: "pay",
    charge
  });

  return res.status(200).json(charge);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { chargeId } = req.params;
  const { tenantId } = req.user;

  await DeleteChargeService(chargeId, Number(tenantId));

  const io = getIO();
  io.emit(`${tenantId}:charge`, {
    action: "delete",
    chargeId
  });

  return res.status(200).json({ message: "Charge deleted" });
};
