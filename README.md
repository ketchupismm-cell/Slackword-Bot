Slackword Bot
A slackword bot that provides word definitions and examples using dictionary APIs and GROQ AI

Features
- Definition - Get definitions using a free dictionary api and with GROQ AI for special nouns
- Examples - Ability to press a button after using a definition to get an example sentence
- Uses a proper dictionary and if there is no definition, use GROQ AI for help

Commands

- /slackword-define - Get the definition of a word
- /slackword-help - Shows all commands

Setup

All put on Hack Club Nest for 24/7 hosting.

1. get API keys from
- Slack: https://api.slack.com/apps
- Groq: https://console.groq.com
2. SSH into Nest and create an .env for
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
GROQ_API_KEY=gsk-...
3. Bot runs automatically

What was used

- Node.js, Slack, Groq, node-cron, Free Dictionary API

in this project, ai was extremely helpful for debugging problems, polishing my code to be more readable, and helped me for the yes button
I did everything else with only myself

Thanks !
