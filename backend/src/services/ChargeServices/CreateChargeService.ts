import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Charge from "../../models/Charge";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

interface Request {
  description: string;
  amount: number;
  contractNumber?: string;
  dueDate?: Date;
  fileUrl?: string;
  notes?: string;
  contactId?: number;
  ticketId?: number;
  tenantId: number;
}

interface Response {
  id: number;
  description: string;
  amount: number;
  contractNumber: string | null;
  dueDate: Date | null;
  status: string;
  fileUrl: string | null;
  notes: string | null;
  contactId: number | null;
  ticketId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const CreateChargeService = async ({
  description,
  amount,
  contractNumber,
  dueDate,
  fileUrl,
  notes,
  contactId,
  ticketId,
  tenantId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    description: Yup.string().required("Description is required").min(3),
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive"),
    contractNumber: Yup.string(),
    dueDate: Yup.date(),
    fileUrl: Yup.string(),
    notes: Yup.string(),
    contactId: Yup.number(),
    ticketId: Yup.number(),
    tenantId: Yup.number().required()
  });

  try {
    await schema.validate({
      description,
      amount,
      contractNumber,
      dueDate,
      fileUrl,
      notes,
      contactId,
      ticketId,
      tenantId
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Validate at least contactId or ticketId is provided
  if (!contactId && !ticketId) {
    throw new AppError(
      "Either contactId or ticketId must be provided",
      400
    );
  }

  // Validate contact exists if provided
  if (contactId) {
    const contact = await Contact.findOne({
      where: { id: contactId, tenantId }
    });
    if (!contact) {
      throw new AppError("Contact not found", 404);
    }
  }

  // Validate ticket exists if provided
  if (ticketId) {
    const ticket = await Ticket.findOne({
      where: { id: ticketId }
    });
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }
  }

  const charge = await Charge.create({
    description,
    amount,
    contractNumber: contractNumber || null,
    dueDate: dueDate || null,
    status: "pending",
    fileUrl: fileUrl || null,
    notes: notes || null,
    paymentHistory: [],
    contactId: contactId || null,
    ticketId: ticketId || null,
    tenantId
  });

  return charge.toJSON() as Response;
};

export default CreateChargeService;
