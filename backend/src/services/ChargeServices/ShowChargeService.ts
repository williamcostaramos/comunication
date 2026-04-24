import AppError from "../../errors/AppError";
import Charge from "../../models/Charge";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

const ShowChargeService = async (
  chargeId: string | number,
  tenantId: number
): Promise<Charge> => {
  const charge = await Charge.findOne({
    where: { id: chargeId, tenantId },
    include: [
      {
        model: Contact,
        attributes: ["id", "name", "number", "email"]
      },
      {
        model: Ticket,
        attributes: ["id", "status", "channel", "unreadMessages"]
      }
    ]
  });

  if (!charge) {
    throw new AppError("Charge not found", 404);
  }

  return charge;
};

export default ShowChargeService;
