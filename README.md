# elysia-line

UnOfficial LINE Messaging API webhook plugin for Elysia — clean, typed, zero-config.

This plugin for ElysiaJS simplifies the process of creating LINE bots by providing a clean, typed, and zero-config integration with the official LINE bot SDK.

## Features

- **Zero-config:** Just provide your channel secret and access token.
- **Type-safe:** Fully typed event handling for all webhook events.
- **Easy to use:** A simple and intuitive API for handling events and sending messages.
- **Official SDK:** Built on top of the official `@line/bot-sdk`.

## Installation

```bash
bun add elysia-line
```

## Usage

```ts
import { Elysia } from "elysia";
import { line } from "elysia-line";

const app = new Elysia()
  .use(
    line({
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
    })
  )
  .post("/webhook", async ({ line, set }) => {
    if (!line) {
      return "Not a LINE webhook";
    }

    line.on("message:text", (event) => {
      line.reply(event.replyToken, {
        type: "text",
        text: `You said: ${event.message.text}`,
      });
    });

    await line.handle();
    return "OK";
  })

  .listen(3000);

console.log(`Elysia is running at http://localhost:3000`);
```

## API

### `line(options: LineOptions)`

The main plugin function.

- `options.channelSecret`: Your LINE channel secret.
- `options.channelAccessToken`: Your LINE channel access token.
- `options.verbose` (optional): Set to `true` to enable detailed, colorful logging for debugging. Defaults to `false`.

### `line.on(eventType, handler)`

Registers an event handler for a specific event type. The `event` object in the handler is fully typed based on the `eventType`.

Supported event types:

- `message:text`
- `message:image`
- `message:video`
- `message:audio`
- `message:file`
- `message:location`
- `message:sticker`
- `follow`
- `unfollow`
- `join`
- `leave`
- `postback`
- `beacon`
- `*` (wildcard for all events)

### `line.reply(replyToken, messages)`

Replies to a message.

### `line.push(to, messages)`

Pushes a message to a user, group, or room.

### `line.getEvents()`

Returns the raw webhook events.

### `line.getClient()`

Returns the underlying `MessagingApiClient` from the `@line/bot-sdk` for advanced usage.

## Exports

This package exports the following main components:

- `line`: The main Elysia plugin.
- `LineHelper`: The helper class for handling events and sending messages. You can access it via `context.line`.
- `LineLogger`: The internal logger class.
- All relevant types from the `@line/bot-sdk`, such as `WebhookEvent`, `MessageEvent`, etc.

## Project Structure

The project is organized into the following directories:

- `src/`: The main source code directory.
  - `core/`: Contains the core logic, like the `LineHelper` class.
  - `logger/`: Contains the `LineLogger` class for logging.
  - `plugin/`: Contains the main Elysia plugin logic.
  - `types/`: Contains all type definitions for the plugin.
  - `index.ts`: The main entry point, which exports all public APIs.
- `dist/`: The compiled JavaScript output.
- `test/`: Example and test applications.

## Development

This project uses [Bun](https://bun.sh/) for package management and running scripts.

To install dependencies:

```bash
bun install
```

To build the project (compiles TypeScript from `src/` to JavaScript in `dist/`):

```bash
bun run build
```

To run the example application located in `test/app.ts`:

```bash
bun run test/app.ts
```
