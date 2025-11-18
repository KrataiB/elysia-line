import { messagingApi, type WebhookEvent } from "@line/bot-sdk";
import type {
  WebhookEventMap,
  EventHandler,
  EventHandlers,
} from "../types";
import type { LineLogger } from "../logger";

/**
 * LINE Helper - Provides easy-to-use methods for handling LINE events
 */
export class LineHelper {
  private client: messagingApi.MessagingApiClient;
  private events: WebhookEvent[] = [];
  private handlers: EventHandlers = new Map();
  private logger: LineLogger;

  constructor(
    channelAccessToken: string,
    events: WebhookEvent[],
    logger: LineLogger
  ) {
    this.client = new messagingApi.MessagingApiClient({
      channelAccessToken,
    });
    this.events = events;
    this.logger = logger;
  }

  /**
   * Register event handler
   *
   * @example
   * ```ts
   * line.on('message:text', (event) => {
   * console.log(event.message.text)
   * })
   *
   * line.on('*', (event) => {
   * console.log('Received any event:', event.type)
   * })
   * ```
   */
  on<K extends keyof WebhookEventMap>(
    eventType: K,
    handler: EventHandler<WebhookEventMap[K]>
  ): this {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers
      .get(eventType)!
      .push(handler as EventHandler<WebhookEventMap[keyof WebhookEventMap]>);

    this.logger.debug(`Handler registered`, { eventType: String(eventType) });
    return this;
  }

  /**
   * Execute registered handlers
   */
  async handle(): Promise<void> {
    const startTime = Date.now();
    this.logger.section("Event Handler Execution");
    this.logger.info(`Processing ${this.events.length} event(s)`);

    const promises: (void | Promise<void>)[] = [];
    const wildcardHandlers = this.handlers.get("*") || [];
    let totalHandlers = 0;

    for (const event of this.events) {
      this.logger.debug(`Event received`, event);

      // Handle wildcard handlers
      if (wildcardHandlers.length > 0) {
        totalHandlers += wildcardHandlers.length;
        for (const handler of wildcardHandlers) {
          promises.push(handler(event));
        }
      }

      // Handle specific message types
      if (event.type === "message" && event.message) {
        const messageType =
          `message:${event.message.type}` as keyof WebhookEventMap;
        const handlers = this.handlers.get(messageType) || [];

        if (handlers.length > 0) {
          totalHandlers += handlers.length;
          this.logger.debug(
            `Executing ${handlers.length} handler(s) for ${messageType}`
          );
          for (const handler of handlers) {
            promises.push(handler(event));
          }
        }
      }

      // Handle generic event types
      const handlers =
        this.handlers.get(event.type as keyof WebhookEventMap) || [];
      if (handlers.length > 0) {
        totalHandlers += handlers.length;
        this.logger.debug(
          `Executing ${handlers.length} handler(s) for ${event.type}`
        );
        for (const handler of handlers) {
          promises.push(handler(event));
        }
      }
    }

    try {
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      this.logger.success(`All handlers completed successfully`, {
        totalHandlers,
        duration: `${duration}ms`,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error(`Handler execution failed after ${duration}ms`, e);
      throw e;
    }
  }

  /**
   * Reply to a message
   *
   * @example
   * ```ts
   * await line.reply(event.replyToken, {
   * type: 'text',
   * text: 'Hello!'
   * })
   * ```
   */
  async reply(
    replyToken: string,
    messages: messagingApi.Message | messagingApi.Message[]
  ): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    this.logger.info(`Sending reply`, {
      replyToken: `${replyToken.substring(0, 20)}...`,
      messageCount: messageArray.length,
      messageTypes: messageArray.map((m) => m.type),
    });
    this.logger.debug("Reply messages content", messageArray);

    try {
      const startTime = Date.now();
      await this.client.replyMessage({
        replyToken,
        messages: messageArray,
      });
      const duration = Date.now() - startTime;
      this.logger.success(`Reply sent successfully (${duration}ms)`);
    } catch (e) {
      this.logger.error("Failed to send reply", e);
      throw e;
    }
  }

  /**
   * Push message to user/group/room
   *
   * @example
   * ```ts
   * await line.push('U1234567890', {
   * type: 'text',
   * text: 'Hello!'
   * })
   * ```
   */
  async push(
    to: string,
    messages: messagingApi.Message | messagingApi.Message[]
  ): Promise<void> {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    this.logger.info(`Pushing message`, {
      to: `${to.substring(0, 10)}...`,
      messageCount: messageArray.length,
      messageTypes: messageArray.map((m) => m.type),
    });
    this.logger.debug("Push messages content", messageArray);

    try {
      const startTime = Date.now();
      await this.client.pushMessage({
        to,
        messages: messageArray,
      });
      const duration = Date.now() - startTime;
      this.logger.success(`Push message sent successfully (${duration}ms)`);
    } catch (e) {
      this.logger.error("Failed to push message", e);
      throw e;
    }
  }

  /**
   * Get raw events
   */
  getEvents(): WebhookEvent[] {
    return this.events;
  }

  /**
   * Get messaging API client for advanced usage
   */
  getClient(): messagingApi.MessagingApiClient {
    return this.client;
  }
}
