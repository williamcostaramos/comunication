import { Op } from "sequelize";
import Charge from "../../models/Charge";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

interface Request {
  tenantId: number;
  contactId?: number;
  ticketId?: number;
  status?: string;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  charges: Charge[];
  count: number;
  hasMore: boolean;
}

const ListChargesService = async ({
  tenantId,
  contactId,
  ticketId,
  status,
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (Number(pageNumber) - 1) * limit;

  const whereCondition: any = { tenantId };

  if (contactId) {
    whereCondition.contactId = contactId;
  }

  if (ticketId) {
    whereCondition.ticketId = ticketId;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { description: { [Op.iLike]: `%${searchParam}%` } },
      { contractNumber: { [Op.iLike]: `%${searchParam}%` } },
      { notes: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const { count, rows } = await Charge.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number"],
        required: false
      },
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id", "status", "channel"],
        required: false
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = offset + limit < count;

  return {
    charges: rows,
    count,
    hasMore
  };
};

export default ListChargesService;
