// Credit: KrataiB
// src/index.ts
/**
 * elysia-line
 *
 * LINE Messaging API webhook plugin for Elysia with official SDK integration
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia'
 * import { line } from 'elysia-line'
 *
 * new Elysia()
 * .use(
 * line({
 * channelSecret: process.env.LINE_CHANNEL_SECRET!,
 * channelAccessToken: process.env.LINE_ACCESS_TOKEN!,
 * verbose: true
 * })
 * )
 * .post('/webhook', ({ line }) =>
 * line.on('message:text', (event) =>
 * line.reply(event.replyToken, {
 * type: 'text',
 * text: event.message.text
 * })
 * )
 * )
 * .listen(3000)
 * ```
 *
 * @module
 */

import { line } from "./plugin/elysia-line";

export { line };
export default line;

/**
 * Re-export commonly used types
 */
export type {
  WebhookEvent,
  WebhookRequestBody,
  MessageEvent,
  TextEventMessage,
  ImageEventMessage,
  VideoEventMessage,
  AudioEventMessage,
  FileEventMessage,
  LocationEventMessage,
  StickerEventMessage,
} from "@line/bot-sdk";

export type {
  LineOptions,
  LineContext,
  LineStore,
  MessageEventMap,
  WebhookEventMap,
  EventHandler,
} from "./types";

export { LineHelper } from "./core/line-helper";
export { LineLogger } from "./logger";