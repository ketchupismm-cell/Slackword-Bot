import "dotenv/config";
import { App } from "@slack/bolt";
import "dotenv/config";
import axios from "axios";
import { Groq } from "groq-sdk";
import cron from "node-cron";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  socketModeResponseTimeoutMillis: 60000,
});

// SLACK COMMAND
app.command("/slackword-define", async ({ command, ack, say }) => {
  await ack();

  const word = command.text.trim();
  if (!word) {
    return await say({ text: "No word provided." });
  }

  let definition = null;
  let partOfSpeech = null;

  // DICTIONARY API

  const query = word;

  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`,
    );
    const wordData = response.data[0]?.meanings[0]?.definitions[0];
    partOfSpeech = response.data[0]?.meanings[0]?.partOfSpeech;
    definition = wordData?.definition;
  } catch (err) {}

  //GROQ
  if (!definition) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Define "${word}". Format: Definition of ${word} (part of speech): one sentence. No thinking process.`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });

      let response = completion.choices[0]?.message?.content;
      response = response?.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      if (response) {
        const match = response.match(/Definition of .+?\s\((.+?)\):\s(.+)/i);
        if (match) {
          partOfSpeech = match[1];
          definition = match[2];
        } else {
          definition = response;
        }
      } else {
        return await say({ text: `No definition found for "${word}".` });
      }
    } catch (error) {
      console.error("Groq API error:", error.message);
      return await say({
        text: `Failed to fetch definition for "${word}".`,
      });
    }
  }

  // FORMAT THE WORDS
  let output = `Definition of ${word}`;
  if (partOfSpeech) {
    output += ` (${partOfSpeech})`;
  }
  output += `: ${definition}`;

  // BUTTON APPEAR
  await say({
    text: output,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: output,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Want an example of this word?",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Yes",
            },
            action_id: `example_yes_${word}`,
            value: word,
          },
        ],
      },
    ],
  });
});

// YES BUTTON
app.action(/^example_yes_/, async ({ action, ack, say }) => {
  await ack();

  const word = action.value;
  let example = null;
  // DICTIONARY
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    example = response.data[0]?.meanings[0]?.definitions[0]?.example;
  } catch (error) {
    // GROQ
  }

  if (!example) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `One example sentence using "${word}". Just the sentence, no thinking.`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      });
      // FORMAT
      example = completion.choices[0]?.message?.content;
      example = example?.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    } catch (error) {
      return await say(`Failed to fetch example for "${word}".`);
    }
  }

  if (!example) {
    return await say(`No example found for "${word}".`);
  }

  await say(`Example: ${example}`);
});

// HELP COMMAND
app.command("/slackword-help", async ({ ack, say }) => {
  await ack();
  await say({
    text: `Available Commands:
/slackword-define - Get the definition of a word
/slackword-help - Show available commands`,
  });
});

//APP START CHECK
(async () => {
  await app.start();
  console.log("it works");
})();
