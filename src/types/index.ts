import type {
  WebhookEvent,
  MessageEvent,
  FollowEvent,
  UnfollowEvent,
  JoinEvent,
  LeaveEvent,
  PostbackEvent,
  BeaconEvent,
  AudioEventMessage,
  FileEventMessage,
  ImageEventMessage,
  LocationEventMessage,
  StickerEventMessage,
  TextEventMessage,
  VideoEventMessage,
} from "@line/bot-sdk";
import type { LineHelper } from "../core/line-helper";

/**
 * LINE webhook plugin configuration
 */
export interface LineOptions {
  /**
   * LINE channel secret for signature verification (required)
   */
  channelSecret: string;

  /**
   * LINE channel access token (required for sending messages)
   */
  channelAccessToken: string;

  /**
   * Enable verbose logging for debugging.
   * When true, detailed logs will be outputted with professional formatting.
   * Defaults to false.
   */
  verbose?: boolean;
}

export type MessageEventMap = {
  "message:text": TextEventMessage;
  "message:image": ImageEventMessage;
  "message:video": VideoEventMessage;
  "message:audio": AudioEventMessage;
  "message:file": FileEventMessage;
  "message:location": LocationEventMessage;
  "message:sticker": StickerEventMessage;
};

export type WebhookEventMap = {
  [K in keyof MessageEventMap]: MessageEvent & { message: MessageEventMap[K] };
} & {
  follow: FollowEvent;
  unfollow: UnfollowEvent;
  join: JoinEvent;
  leave: LeaveEvent;
  postback: PostbackEvent;
  beacon: BeaconEvent;
  "*": WebhookEvent;
};

/**
 * Event handler type
 */
export type EventHandler<T extends WebhookEvent = WebhookEvent> = (
  event: T
) => void | Promise<void>;

export type EventHandlers = Map<
  keyof WebhookEventMap,
  EventHandler<WebhookEventMap[keyof WebhookEventMap]>[]
>;

/**
 * LINE Store interface
 */
export interface LineStore {
  "line-events": WebhookEvent[];
  "line-destination": string;
}

/**
 * LINE context added to Elysia
 */
export interface LineContext {
  line: LineHelper | undefined;
}
