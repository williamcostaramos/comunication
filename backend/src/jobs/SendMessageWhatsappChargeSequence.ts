/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "path";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import ChargeSequenceContact from "../models/ChargeSequenceContact";

export default {
  key: "SendMessageWhatsappChargeSequence",
  options: {
    delay: 15000,
    attempts: 15, // mais tentativas para cobranças
    removeOnComplete: true,
    backoff: {
      type: "fixed",
      delay: 60000 * 10 // 10 min entre tentativas
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      // Verificar se o contato foi marcado para parar
      const chargeContact = await ChargeSequenceContact.findByPk(
        data.chargeSequenceContact.id
      );

      if (!chargeContact || chargeContact.stopCharging) {
        logger.info(
          `Charge sequence: Contact ${data.number} marked to stop charging`
        );
        return {
          status: "skipped",
          reason: "Contact marked to stop charging"
        };
      }

      const wbot = getWbot(data.whatsappId);
      let message = {} as WbotMessage;

      // Enviar mídia se existir
      if (data.mediaUrl) {
        const customPath = join(__dirname, "..", "..", "public");
        const mediaPath = join(customPath, data.mediaName);
        const newMedia = MessageMedia.fromFilePath(mediaPath);
        message = await wbot.sendMessage(
          `${data.number}@c.us`,
          newMedia,
          {
            sendAudioAsVoice: true,
            caption: data.message
          }
        );
      } else {
        message = await wbot.sendMessage(`${data.number}@c.us`, data.message, {
          linkPreview: false
        });
      }

      // Atualizar registro com informações do envio
      await ChargeSequenceContact.update(
        {
          lastSentAt: new Date(),
          sendCount: chargeContact.sendCount + 1,
          lastAckAt: new Date()
        },
        { where: { id: data.chargeSequenceContact.id } }
      );

      logger.info(
        `Message sent to ${data.number} | Charge Sequence: ${data.chargeSequenceId}`
      );

      return message;
    } catch (error) {
      logger.error(`Error sending charge sequence message: ${error}`);
      throw new Error(error);
    }
  }
};
