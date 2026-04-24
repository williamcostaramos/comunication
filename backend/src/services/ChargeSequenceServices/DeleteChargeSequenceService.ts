import AppError from "../../errors/AppError";
import ChargeSequence from "../../models/ChargeSequence";

const DeleteChargeSequenceService = async (
  chargeSequenceId: string | number,
  tenantId: number
): Promise<void> => {
  const chargeSequence = await ChargeSequence.findOne({
    where: { id: chargeSequenceId, tenantId }
  });

  if (!chargeSequence) {
    throw new AppError("Charge sequence not found", 404);
  }

  await chargeSequence.destroy();
};

export default DeleteChargeSequenceService;
