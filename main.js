const DiscordJS = require("discord.js");
const { Intents } = DiscordJS;

/**
 * @param {DiscordJS.Client} client
 */
const client = new DiscordJS.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

module.exports = (options) => {
  // OPTIONS OBJECT: featuresDir, commandsDir, testServers, botOwners, ignoreBots, mongoUri, dbOptions
  if (!options.defaultPrefix || !options.commandsDir) {
    console.log(
      `LiteCommands | You need to provide a "defaultPrefix" and "commandsDir" option.`
    );
    process.exit();
  }
  client.Instance = options;
};

module.exports.login = (token) => {
  client.commands = new DiscordJS.Collection();
  client.Instance.guildPrefixes = {};
  require("./Handlers/Commands")(client);
  require("./Handlers/InternalEvents")(client);
  if (client.Instance.featuresDir) require("./Handlers/Features")(client);
  if (client.Instance.mongoUri) require("./Handlers/Mongo")(client);
  client.login(token);
};

module.exports.Client = client;
