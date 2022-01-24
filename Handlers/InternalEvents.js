const { Events } = require("../Validation/EventNames");
const { Client, Permissions } = require("discord.js");

/**
 *
 * @param {Client} client
 */

module.exports = async (client) => {
  client.once("ready", () =>
    console.log(`LiteCommands | ${client.user.tag} is now online.`)
  );

  client.on("messageCreate", async (message) => {
    const Prefix = client.Instance.guildPrefixes[message.guild.id]
      ? client.Instance.guildPrefixes[message.guild.id].toLowerCase()
      : client.Instance.defaultPrefix.toLowerCase();

    const args = message.content.split(" ").slice(1);
    const messagePrefix = message.content
      .split(" ")[0]
      .substr(0, Prefix.length)
      .toLowerCase();
    const command = message.content
      .split(" ")[0]
      .substr(Prefix.length)
      .toLowerCase();

    if (messagePrefix != Prefix) return;
    if (message.author.id == client.user.id || message.channel.type == "dm")
      return;

    if (client.Instance.ignoreBots) {
      if (message.author.bot) return;
    }

    let Command;

    Command = client.commands.find(
      (cmd) => cmd.name.toLowerCase() == command.toLowerCase()
    );
    if (!Command)
      Command = client.commands.find((cmd) => {
        if (!cmd.aliases) return;
        cmd.aliases.includes(command.toLowerCase());
      });
    if (!Command) return;

    if (!Command.execute) return;

    if (Command.ownerOnly) {
      if (!client.Instance.botOwners)
        throw new Error(
          "'botOwners' property is not set or is set to an invalid expression inside the client object."
        );
      if (!client.Instance.botOwners.includes(message.author.id))
        return message.channel.send("Only the bot owner can run this command");
    }
    if (Command.testOnly) {
      if (!client.Instance.testServers)
        throw new Error(
          "'testServers' property is not set or is set to an invalid expression inside the client object."
        );
      if (!client.Instance.testServers.includes(message.guild.id)) return;
    }
    if (Command.minArgs) {
      if (!(args.length >= Command.minArgs)) {
        if (Command.syntaxError) {
          if (
            Command.syntaxError.includes("{ARGUMENTS}") &&
            !Command.expectedArgs
          ) {
            console.log(
              `LiteCommands | Command "${Command.name}" calls for arguments in syntax error but does not have a "expectedArgs" option.`
            );
            process.exit();
          }
          let syntaxError = Command.syntaxError
            .replace(/{PREFIX}/g, `${Prefix}`)
            .replace(/{ARGUMENTS}/g, `${Command.expectedArgs}`);
          return message.channel.send({ content: `${syntaxError}` });
        } else {
          return;
        }
      }
    }
    if (Command.maxArgs) {
      if (!(args.length <= Command.maxArgs)) {
        if (Command.syntaxError) {
          if (
            Command.syntaxError.includes("{ARGUMENTS}") &&
            !Command.expectedArgs
          ) {
            console.log(
              `LiteCommands | Command "${Command.name}" calls for arguments in syntax error but does not have a "expectedArgs" option.`
            );
            process.exit();
          }
          let syntaxError = Command.syntaxError
            .replace(/{PREFIX}/g, `${Prefix}`)
            .replace(/{ARGUMENTS}/g, `${Command.expectedArgs}`);
          return message.channel.send({ content: `${syntaxError}` });
        } else {
          return;
        }
      }
    }

    let object = {
      client,
      message,
      args,
      Instance: client.Instance,
      user: message.author,
      member: message.member,
      guild: message.guild,
      channel: message.channel,
      prefix: Prefix,
      text: args.join(" "),
    };

    if (Command.permission) {
      if (
        !message.member.permissions.has(Permissions.FLAGS[Command.permission])
      )
        return;
    }

    const reply =
      Command.execute(object) instanceof Promise
        ? await Command.execute(object)
        : Command.execute(object);

    if (!reply) {
      return;
    } else if (typeof reply === "string") {
      return message.channel.send({ content: reply });
    } else if (reply.custom) {
      return message.channel.send(reply);
    } else if (typeof reply === "object" && reply.type == "rich") {
      return message.channel.send({ embeds: [reply] });
    } else {
      return;
    }
  });
};
