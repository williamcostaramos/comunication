import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ChargeSequence from "../../models/ChargeSequence";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  chargeSequence: {
    name: string;
    start: Date;
    message: string;
    userId: number;
    sessionId: number;
    delay: number;
    tenantId: number;
    recurrenceType?: string;
    recurrenceInterval?: number;
  };
  medias?: Express.Multer.File[];
}

const CreateChargeSequenceService = async ({
  chargeSequence,
  medias
}: Request): Promise<ChargeSequence> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    start: Yup.date().required("Start date is required"),
    message: Yup.string().required("Message is required"),
    userId: Yup.number().required(),
    sessionId: Yup.number().required(),
    tenantId: Yup.number().required(),
    delay: Yup.number().positive(),
    recurrenceType: Yup.string().oneOf(
      ["daily", "weekly", "monthly", "indefinite"],
      "Invalid recurrence type"
    ),
    recurrenceInterval: Yup.number().positive("Interval must be positive")
  });

  try {
    await schema.validate(chargeSequence);
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }

  const whatsapp = await Whatsapp.findByPk(chargeSequence.sessionId);
  if (!whatsapp) {
    throw new AppError("Session not found", 404);
  }

  let mediaName: string | null = null;
  let mediaType: string | null = null;

  if (medias && medias.length > 0) {
    const media = medias[0];
    mediaName = media.filename;
    mediaType = media.mimetype.split("/")[0];
  }

  const newChargeSequence = await ChargeSequence.create({
    name: chargeSequence.name,
    start: chargeSequence.start,
    message: chargeSequence.message,
    userId: chargeSequence.userId,
    sessionId: chargeSequence.sessionId,
    tenantId: chargeSequence.tenantId,
    delay: chargeSequence.delay || 20000,
    mediaUrl: mediaName || null,
    mediaType: mediaType || null,
    status: "pending",
    recurrenceType: chargeSequence.recurrenceType || "daily",
    recurrenceInterval: chargeSequence.recurrenceInterval || null,
    active: true
  });

  return newChargeSequence;
};

export default CreateChargeSequenceService;
