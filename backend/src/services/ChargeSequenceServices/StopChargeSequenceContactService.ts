import AppError from "../../errors/AppError";
import ChargeSequenceContact from "../../models/ChargeSequenceContact";

interface Request {
  chargeSequenceContactId: number | string;
  reason?: string;
}

const StopChargeSequenceContactService = async ({
  chargeSequenceContactId,
  reason
}: Request): Promise<ChargeSequenceContact> => {
  const chargeSequenceContact =
    await ChargeSequenceContact.findByPk(chargeSequenceContactId);

  if (!chargeSequenceContact) {
    throw new AppError("Charge sequence contact not found", 404);
  }

  await chargeSequenceContact.update({
    stopCharging: true,
    reason: reason || null
  });

  return chargeSequenceContact;
};

export default StopChargeSequenceContactService;
