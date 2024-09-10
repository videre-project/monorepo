// This is the slash-up config file.
// Make sure to fill in "token" and "applicationId" before using.
// You can also use environment variables from the ".env" file if any.

// Use wrangler .dev.vars instead of .env
const dotenv = require('dotenv');
dotenv.config({ path: '.dev.vars' });

module.exports = {
  // The Token of the Discord bot
  token: process.env.DISCORD_BOT_TOKEN,
  // The Application ID of the Discord bot
  applicationId: process.env.DISCORD_CLIENT_ID,
  // This is where the path to command files are, .ts files are supported!
  commandPath: './src/bot/interactions/commands',
  // You can use different environments with --env (-e)
  env: {
    development: {
      // The "globalToGuild" option makes global commands sync to the specified guild instead.
      globalToGuild: process.env.DEVELOPMENT_GUILD_ID
    }
  }
};
