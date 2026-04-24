import AppError from "../../errors/AppError";
import Charge from "../../models/Charge";

const DeleteChargeService = async (
  chargeId: string | number,
  tenantId: number
): Promise<void> => {
  const charge = await Charge.findOne({
    where: { id: chargeId, tenantId }
  });

  if (!charge) {
    throw new AppError("Charge not found", 404);
  }

  await charge.destroy();
};

export default DeleteChargeService;
