import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ChargeSequence from "../../models/ChargeSequence";

interface Request {
  chargeSequenceId: string | number;
  tenantId: number;
  chargeSequenceData: {
    name?: string;
    message?: string;
    delay?: number;
    recurrenceType?: string;
    recurrenceInterval?: number;
    mediaUrl?: string;
    mediaType?: string;
  };
  medias?: Express.Multer.File[];
}

const UpdateChargeSequenceService = async ({
  chargeSequenceId,
  tenantId,
  chargeSequenceData,
  medias
}: Request): Promise<ChargeSequence> => {
  const chargeSequence = await ChargeSequence.findOne({
    where: { id: chargeSequenceId, tenantId }
  });

  if (!chargeSequence) {
    throw new AppError("Charge sequence not found", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string(),
    message: Yup.string(),
    delay: Yup.number().positive(),
    recurrenceType: Yup.string().oneOf([
      "daily",
      "weekly",
      "monthly",
      "indefinite"
    ]),
    recurrenceInterval: Yup.number().positive()
  });

  try {
    await schema.validate(chargeSequenceData);
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }

  const updateData: any = { ...chargeSequenceData };

  if (medias && medias.length > 0) {
    const media = medias[0];
    updateData.mediaUrl = media.filename;
    updateData.mediaType = media.mimetype.split("/")[0];
  }

  await chargeSequence.update(updateData);

  return chargeSequence;
};

export default UpdateChargeSequenceService;
