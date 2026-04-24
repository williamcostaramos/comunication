/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import axios from "axios";
import mime from "mime-types";
import { join } from "path";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import Queue from "../libs/Queue";

export default {
  key: "SendMessageAPIDirect",
  options: {
    delay: 3000,
    attempts: 15,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: "fixed",
      delay: 60000 * 2 // 2 min
    }
  },
  async handle({ data }: any) {
    const notifyError = (ack: number, error: string) => {
      if (data?.apiConfig?.urlMessageStatus) {
        const payload = {
          ack,
          body: data.body,
          messageId: "",
          number: data.number,
          externalKey: data.externalKey,
          error,
          type: "hookMessageStatus",
          authToken: data?.apiConfig?.authToken
        };
        Queue.add("WebHooksAPI", {
          url: data.apiConfig.urlMessageStatus,
          type: payload.type,
          payload
        });
      }
    };

    try {
      const wbot = getWbot(data.sessionId);

      const idNumber = await wbot.getNumberId(data.number);
      if (!idNumber) {
        if (data.media?.path && fs.existsSync(data.media.path)) {
          fs.unlinkSync(data.media.path);
        }
        notifyError(-1, "number invalid in whatsapp");
        return { ack: -1, error: "number invalid in whatsapp" };
      }

      const chatId = `${idNumber.user}@c.us`;

      if (data.media || data.mediaUrl) {
        let media: MessageMedia;

        if (data.media?.path) {
          media = MessageMedia.fromFilePath(data.media.path);
        } else if (data.mediaUrl) {
          const mediaPath = join(__dirname, "..", "..", "public", `tmp_${Date.now()}`);
          const response = await axios.get(data.mediaUrl, { responseType: "arraybuffer" });
          const mimeType = mime.lookup(data.mediaUrl) || "application/octet-stream";
          const extension = mime.extension(mimeType) || "bin";
          const tmpPath = `${mediaPath}.${extension}`;
          fs.writeFileSync(tmpPath, Buffer.from(response.data));
          media = MessageMedia.fromFilePath(tmpPath);
          fs.unlinkSync(tmpPath);
        } else {
          notifyError(-3, "media_not_found");
          return { ack: -3, error: "media_not_found" };
        }

        await wbot.sendMessage(chatId, media, { sendAudioAsVoice: true });

        if (data.media?.path && fs.existsSync(data.media.path)) {
          fs.unlinkSync(data.media.path);
        }
      } else {
        await wbot.sendMessage(chatId, data.body, { linkPreview: false });
      }
    } catch (error) {
      logger.error({ message: "Error SendMessageAPIDirect", error });
      notifyError(-2, "error sending message");
      throw new Error(error);
    }
  }
};
