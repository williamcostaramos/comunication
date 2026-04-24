import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Charge from "../../models/Charge";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

interface Request {
  chargeId: string | number;
  tenantId: number;
  description?: string;
  amount?: number;
  contractNumber?: string;
  dueDate?: Date;
  fileUrl?: string;
  notes?: string;
  status?: string;
}

interface Response extends Charge {}

const UpdateChargeService = async ({
  chargeId,
  tenantId,
  description,
  amount,
  contractNumber,
  dueDate,
  fileUrl,
  notes,
  status
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    description: Yup.string().min(3),
    amount: Yup.number().positive("Amount must be positive"),
    contractNumber: Yup.string(),
    dueDate: Yup.date(),
    fileUrl: Yup.string(),
    notes: Yup.string(),
    status: Yup.string().oneOf(
      ["pending", "overdue", "paid", "canceled"],
      "Invalid status"
    )
  });

  try {
    await schema.validate({
      description,
      amount,
      contractNumber,
      dueDate,
      fileUrl,
      notes,
      status
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const charge = await Charge.findOne({
    where: { id: chargeId, tenantId }
  });

  if (!charge) {
    throw new AppError("Charge not found", 404);
  }

  const updateData: any = {};

  if (description !== undefined) updateData.description = description;
  if (amount !== undefined) updateData.amount = amount;
  if (contractNumber !== undefined) updateData.contractNumber = contractNumber;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;

  await charge.update(updateData);

  return charge;
};

export default UpdateChargeService;
