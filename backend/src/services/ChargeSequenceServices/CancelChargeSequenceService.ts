import AppError from "../../errors/AppError";
import ChargeSequence from "../../models/ChargeSequence";

interface Request {
  chargeSequenceId: string | number;
  tenantId: number | string;
}

const CancelChargeSequenceService = async ({
  chargeSequenceId,
  tenantId
}: Request): Promise<ChargeSequence> => {
  const chargeSequence = await ChargeSequence.findOne({
    where: { id: chargeSequenceId, tenantId }
  });

  if (!chargeSequence) {
    throw new AppError("Charge sequence not found", 404);
  }

  await chargeSequence.update({
    status: "canceled",
    active: false
  });

  return chargeSequence;
};

export default CancelChargeSequenceService;
