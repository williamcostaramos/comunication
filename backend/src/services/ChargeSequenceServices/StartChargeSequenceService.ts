import {
  setHours,
  setMinutes,
  addSeconds,
  isWithinInterval,
  parse,
  addDays,
  differenceInSeconds,
  isAfter,
  isBefore,
  differenceInDays
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { JobOptions } from "bull";
import ChargeSequence from "../../models/ChargeSequence";
import ChargeSequenceContact from "../../models/ChargeSequenceContact";
import AppError from "../../errors/AppError";
import Queue from "../../libs/Queue";

interface Request {
  chargeSequenceId: string | number;
  tenantId: number | string;
  options?: JobOptions;
}

const cArquivoName = (url: string | null) => {
  if (!url) return "";
  const split = url.split("/");
  const name = split[split.length - 1];
  return name;
};

const nextDayHoursValid = (date: Date) => {
  let dateVerify = date;
  const dateNow = new Date();
  const diffDays = differenceInDays(dateVerify, new Date());

  if (diffDays < 0) {
    dateVerify = addDays(dateVerify, diffDays * -1);
  }

  if (dateVerify.getTime() < dateNow.getTime()) {
    dateVerify = setMinutes(
      setHours(dateVerify, dateNow.getHours()),
      dateNow.getMinutes()
    );
  }

  const start = parse("08:00", "HH:mm", dateVerify);
  const end = parse("20:00", "HH:mm", dateVerify);

  const isValidHour = isWithinInterval(dateVerify, { start, end });

  const isDateBefore = isBefore(start, dateVerify);
  const isDateAfter = isAfter(end, dateVerify);

  if (!isValidHour && isDateBefore) {
    dateVerify = setMinutes(setHours(dateVerify, 8), 30);
  }

  if (!isValidHour && isDateAfter && diffDays === 0) {
    dateVerify = addDays(setHours(dateVerify, 8), 1);
  }

  if (!isValidHour && isDateAfter && diffDays > 0) {
    dateVerify = setHours(dateVerify, 8);
  }

  return dateVerify;
};

const calcDelay = (nextDate: Date, delay: number) => {
  const diffSeconds = differenceInSeconds(nextDate, new Date());
  return diffSeconds * 1000 + delay;
};

const getNextChargeDate = (
  lastSentAt: Date | null,
  recurrenceType: string,
  recurrenceInterval: number | null
): Date => {
  let nextDate = new Date();

  if (lastSentAt) {
    nextDate = new Date(lastSentAt);
  }

  switch (recurrenceType) {
    case "daily":
      nextDate = addDays(nextDate, recurrenceInterval || 1);
      break;
    case "weekly":
      nextDate = addDays(nextDate, (recurrenceInterval || 1) * 7);
      break;
    case "monthly":
      nextDate = new Date(
        nextDate.getFullYear(),
        nextDate.getMonth() + (recurrenceInterval || 1),
        nextDate.getDate()
      );
      break;
    case "indefinite":
      // reenviar em 3 dias se não houver intervalo definido
      nextDate = addDays(nextDate, recurrenceInterval || 3);
      break;
    default:
      nextDate = addDays(nextDate, 1);
  }

  return nextDate;
};

const StartChargeSequenceService = async ({
  chargeSequenceId,
  tenantId,
  options
}: Request): Promise<void> => {
  const chargeSequence = await ChargeSequence.findOne({
    where: { id: chargeSequenceId, tenantId },
    include: ["session"]
  });

  if (!chargeSequence) {
    throw new AppError("Charge sequence not found", 404);
  }

  const chargeSequenceContacts = await ChargeSequenceContact.findAll({
    where: {
      chargeSequenceId,
      stopCharging: false // apenas contatos que ainda devem receber
    },
    include: ["contact"]
  });

  if (!chargeSequenceContacts || chargeSequenceContacts.length === 0) {
    throw new AppError("No active contacts for this charge sequence", 404);
  }

  const timeDelay = chargeSequence.delay ? chargeSequence.delay * 1000 : 20000;
  let dateDelay = zonedTimeToUtc(
    chargeSequence.start,
    "America/Sao_Paulo"
  );

  const data = chargeSequenceContacts.map(
    (chargeSequenceContact: ChargeSequenceContact) => {
      dateDelay = addSeconds(dateDelay, timeDelay / 1000);
      const nextChargeDate = getNextChargeDate(
        chargeSequenceContact.lastSentAt,
        chargeSequence.recurrenceType,
        chargeSequence.recurrenceInterval
      );

      // Calcular intervalo de recorrência em millisegundos
      let repeatIntervalMs: number | undefined;
      if (chargeSequence.recurrenceType !== 'indefinite') {
        switch (chargeSequence.recurrenceType) {
          case 'daily':
            repeatIntervalMs = (chargeSequence.recurrenceInterval || 1) * 24 * 60 * 60 * 1000;
            break;
          case 'weekly':
            repeatIntervalMs = (chargeSequence.recurrenceInterval || 1) * 7 * 24 * 60 * 60 * 1000;
            break;
          case 'monthly':
            repeatIntervalMs = (chargeSequence.recurrenceInterval || 1) * 30 * 24 * 60 * 60 * 1000;
            break;
          default:
            repeatIntervalMs = 24 * 60 * 60 * 1000; // 1 dia padrão
        }
      }

      return {
        whatsappId: chargeSequence.sessionId,
        message: chargeSequence.message,
        number: chargeSequenceContact.contact.number,
        mediaUrl: chargeSequence.mediaUrl,
        mediaName: cArquivoName(chargeSequence.mediaUrl),
        chargeSequenceContact,
        chargeSequenceId: chargeSequence.id,
        contactId: chargeSequenceContact.contactId,
        tenantId,
        options: {
          ...options,
          jobId: `chargeSeq_${chargeSequence.id}_contact_${chargeSequenceContact.contactId}_id_${chargeSequenceContact.id}`,
          delay: calcDelay(nextChargeDate, timeDelay),
          ...(repeatIntervalMs && { repeat: { every: repeatIntervalMs } })
        }
      };
    }
  );

  Queue.add("SendMessageWhatsappChargeSequence", data);

  await chargeSequence.update({
    status: "scheduled"
  });
};

export default StartChargeSequenceService;
