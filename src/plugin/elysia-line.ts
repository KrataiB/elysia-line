import { Elysia } from "elysia";
import { type WebhookRequestBody, type WebhookEvent } from "@line/bot-sdk";
import { createHmac } from "crypto";
import { LineHelper } from "../core/line-helper";
import { LineLogger } from "../logger";
import type { LineOptions } from "../types";

/**
 * Validate LINE signature
 */
function validateSignature(
  body: string,
  signature: string,
  channelSecret: string
): boolean {
  const hash = createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  return hash === signature;
}

/**
 * LINE Messaging API webhook plugin for Elysia
 *
 * @example
 * Echo bot:
 * ```ts
 * import { Elysia } from 'elysia'
 * import { line } from 'elysia-line'
 *
 * new Elysia()
 * .use(line({
 * channelSecret: process.env.LINE_CHANNEL_SECRET!,
 * channelAccessToken: process.env.LINE_ACCESS_TOKEN!,
 * verbose: true
 * }))
 * .post('/webhook', ({ line }) =>
 * line.on('message:text', (event) =>
 * line.reply(event.replyToken, {
 * type: 'text',
 * text: event.message.text
 * })
 * )
 * )
 * ```
 */
export const line = (options: LineOptions) => {
  const { channelSecret, channelAccessToken, verbose = false } = options;

  if (!channelSecret) {
    throw new Error(
      "channelSecret is required. Get it from LINE Developers Console."
    );
  }

  if (!channelAccessToken) {
    throw new Error(
      "channelAccessToken is required. Get it from LINE Developers Console."
    );
  }

  const logger = new LineLogger(verbose);

  return new Elysia({
    name: "elysia-line",
    seed: options,
  })
    .state("line-events", [] as WebhookEvent[])
    .state("line-destination", "" as string)
    .onRequest(async ({ request, set, store }) => {
      // We only care about POST requests
      if (request.method !== "POST") {
        return;
      }

      const requestId = Math.random().toString(36).substring(2, 9);
      logger.section(`Webhook Request [${requestId}]`);

      const signature = request.headers.get("x-line-signature");

      if (!signature) {
        logger.warn("Request ignored: Missing x-line-signature header");
        return;
      }

      logger.info("Signature verification started");

      let body: string;
      try {
        body = await request.text();
        logger.debug("Request body received", {
          contentLength: body.length,
          contentType: request.headers.get("content-type"),
        });
      } catch (e) {
        logger.error("Failed to read request body", e);
        set.status = 400;
        return { error: "Failed to read request body" };
      }

      // Validate signature
      const isValid = validateSignature(body, signature, channelSecret);

      if (!isValid) {
        logger.error("Signature verification failed", {
          signature: signature, // Log the full signature
          bodyLength: body.length,
        });
        set.status = 401;
        return { error: "Invalid signature" };
      }

      logger.success("Signature verified");

      // Parse webhook payload
      try {
        const payload: WebhookRequestBody = JSON.parse(body);

        logger.info("Webhook payload parsed", {
          destination: payload.destination,
          eventCount: payload.events?.length ?? 0,
          eventTypes: payload.events?.map((e) => e.type) ?? [],
        });
        logger.debug("Full webhook payload", payload);

        // Populate store for later use in derive/handler
        store["line-events"] = payload.events ?? [];
        store["line-destination"] = payload.destination ?? "";

        logger.success("Request processed successfully");
        logger.divider();
      } catch (e) {
        logger.error("Failed to parse JSON body", e);
        set.status = 400;
        return { error: "Invalid JSON body" };
      }
    })
    .derive({ as: "global" }, ({ store }) => {
      // Only provide line helper if there are events
      const events = store["line-events"] as WebhookEvent[];

      if (!events || events.length === 0) {
        return {
          line: undefined,
        };
      }

      return {
        line: new LineHelper(channelAccessToken, events, logger),
      };
    });
};
