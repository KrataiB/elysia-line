import { Elysia } from "elysia";
import { line } from "../src/index";

const app = new Elysia()
  .use(
    line({
      channelSecret: process.env.channelSecret!,
      channelAccessToken: process.env.channelAccessToken!,
      verbose: true,
    })
  )
  .post("/webhook", async ({ line, set }) => {
    if (!line) {
      return "Not a LINE webhook";
    }

    // Register handlers ทุกครั้งก่อน handle
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
