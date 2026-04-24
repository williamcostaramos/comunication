import { Op } from "sequelize";
import ChargeSequence from "../../models/ChargeSequence";
import ChargeSequenceContact from "../../models/ChargeSequenceContact";
import Contact from "../../models/Contact";

interface Request {
  tenantId: number;
  chargeSequenceId?: number;
  status?: string;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  chargeSequences: ChargeSequence[];
  count: number;
  hasMore: boolean;
}

const ListChargeSequenceService = async ({
  tenantId,
  chargeSequenceId,
  status,
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = (Number(pageNumber) - 1) * limit;

  const whereCondition: any = { tenantId };

  if (chargeSequenceId) {
    whereCondition.id = chargeSequenceId;
  }

  if (status) {
    whereCondition.status = status;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { message: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const { count, rows } = await ChargeSequence.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: ChargeSequenceContact,
        as: "chargeSequenceContacts",
        attributes: ["id", "contactId", "stopCharging", "sendCount"],
        include: [
          {
            model: Contact,
            as: "contact",
            attributes: ["id", "name", "number"]
          }
        ]
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = offset + rows.length >= limit && count > limit;

  return {
    chargeSequences: rows,
    count,
    hasMore
  };
};

export default ListChargeSequenceService;
