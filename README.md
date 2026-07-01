hello there

a slackword bot used in Slack used for asking a definition of a word using a dictionary api then using GROQ 
after the Slackword message is put out, you can ask for an example where a yes button appears below 

features include
/slackword-define for definition
/slackword-help for all commands

1. clone the repository
2. 'npm install'
3. create '.env' file for keys with tokens
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
GROQ_API_KEY=gsk_...
SLACK_USER_ID=U...
4. run node app.js
