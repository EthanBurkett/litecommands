# Lite Commands

Lite commands is a discord js command handler made simple, simply just install with the steps below to get started!

## Initiating the client

There are lots of different options to initiate the client that we'll go over later, but below is the basic, first run bot initiation.

```js
const Client = require("litecommands");
const path = require("path");

Client({
  commandsDir: path.join(__dirname, "Commands"), // This will load commands from the directory named "Commands"
  defaultPrefix: "!", // This is the prefix that is defaulted for every server the bot joins
});

Client.login("Your bot token"); // This can be found when creating a bot application inside the discord developer portal
```

## Advanced Configuration

Now that you've got the basic bot structure, let's get into the more advanced options of initiation the client object.

```js
const Client = require("litecommands");
const path = require("path");

Client({
  commandsDir: path.join(__dirname, "Commands"), // This will load commands from the directory named "Commands"
  featuresDir: path.join(__dirname, "Features"), // Features are also just custom events, these can be used to create your own events when something happens
  testServers: ["Guild 1", "Guild 2"], // Test servers can be used to make certain commands only available inside the listed guilds
  botOwners: ["User 1", "User 2"], // Bot owners can be used to make certain commands only accessible to the users in this array
  ignoreBots: true / false, // This will make it where if a bot runs a command your bot will not execute.
  defaultPrefix: "!", // This is the prefix that is defaulted for every server the bot joins
  mongoUri: "Mongo Connection URL", // You can connect mongo directly within the client for easier mongodb setup
  dbOptions: {
    // Here you can define options explained in Mongoose documentation
    keepAlive: true, // Highly recommended option
  },
});

Client.login("Your bot token");
```

## Commands

To create a command is simple, create a file called `ping.js` inside your commands directory.
Here we can create a simple command that will reply with `Pong!`
There are a lot of options you can provide into a command object, but we'll get into that later.

`Commands/ping.js`

```js
module.exports = {
  name: "ping", // Required
  description: "Replies with pong!", // Required
  execute() {
    return "Pong!";
  },
};
```

And that's it! You created your first command!

## Command Object Options

```js
module.exports = {
  name: "commandname",
  description: "command description",

  permission: "Permission Node", // A full permission list can be found by doing a quick google search "DiscordJS permissions list"

  minArgs: 1, // The minimum amount of arguments required
  maxArgs: 2, // The maximum amount of arguments that can be provided,
  expectedArgs: "<user> <reason>", // Used to define what arguments are required in the syntax error message
  syntaxError: "Syntax error! Correct syntax: {PREFIX}commandname {ARGUMENTS}", // Will return when a user uses a command incorrectly

  ownerOnly: true / false, // Only bot owners can run this command
  testOnly: true / false, // Command can only be ran in test servers

  async execute({
    client, // Returns the client
    message, // Returns the message object
    args, // Returns the arguments provided
    Instance, // Returns the bot instance
    user, // Returns the user's object
    member, // Returns the user's member object
    guild, // Returns the guild the command was ran in
    channel, // Returns the channel the command was ran in
    prefix, // Returns the prefix for the guild
    text, // Returns the full text of arguments
  }) {},
};
```

## Types of returns in a command

There are different ways you can return text or embeds after a command is ran, they are shown in examples below.
`Returning a string`

```js
module.exports = {
  name: "ping",
  description: "Replies with pong!",
  execute() {
    return "Hello"; // This will simply send a message in the channel "Hello"
  },
};
```

`Returning an embed`

```js
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Replies with pong!",
  execute() {
    return new MessageEmbed({
      title: "Hello!",
    }); // This will send a custom embed into the channel
  },
};
```

`Returning a custom object`

```js
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'ping',
  description: 'Replies with pong!',
  execute() {
    return {
      custom: true,
      content: "This is a normal message",
      embeds: [
        new MessageEmbed({
          title: "This is an embed"
        })
      ],
      files: [Message Attachments],
      components: [Message Components]
    }
  }
}
```

`Returning your own object`

```js
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Replies with pong!",
  execute({ channel }) {
    channel.send({ content: "I sent this with my own function!" });
    return;
  },
};
```

## Features

Features can be used to create custom events when something happens within the server.
Create a file in your Features directory named `welcome.js`

`Features/welcome.js`

```js
module.exports = {
  name: "guildMemberAdd", // The event name
  async execute(member) {
    // The arguments will always be ...args, client. ex. (member, client)
    const WelcomeChannel = member.guild.channels.cache.find(
      (channel) => channel.name == "Welcome"
    );

    WelcomeChannel.send({ content: `Welcome ${member.user.tag}!` });
  },
};
```

## Using mongoose

You can research how to create mongoose models within google, using them will be the same. You will **not** need to supply a connection, LiteCommands does everything for you, all that's left for you to do is create models and create amazing commands that use them!

## Per-Guild Prefix Command

This will be a simple command that creates a per-guild prefix command and cache, just in case you're having trouble you can use this as a guide!

`Models/GuildPrefixes.js`

```js
const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  GuildID: {
    type: String,
    required: true,
  },
  Prefix: {
    type: String,
    required: true,
  },
});

const name = "litecmdsprefixes";

module.exports = mongoose.models[name] || mongoose.model(name, Schema);
```

`Commands/Moderation/prefix.js`

```js
const { MessageEmbed } = require("discord.js");
const PrefixSchema = require("../Models/GuildPrefixes");

module.exports = {
  name: "prefix",
  description: "Change the custom prefix for this guild",
  permission: "ADMINISTRATOR",
  async execute({ args, guild, Instance }) {
    const result = await PrefixSchema.findOne({ GuildID: guild.id });
    if (!result) {
      await PrefixSchema.create({
        GuildID: guild.id,
        Prefix: args[0],
      });
    } else {
      await PrefixSchema.findOneAndUpdate(
        {
          GuildID: guild.id,
        },
        {
          Prefix: args[0],
        }
      );
    }

    Instance.guildPrefixes[guild.id] = args[0];

    return {
      custom: true,
      embeds: [
        new MessageEmbed()
          .setTitle("Configuration")
          .setDescription(`Prefix updated to \`${args[0]}\``),
      ],
    };
  },
};
```

`Features/PrefixCache.js`

```js
const PrefixSchema = require("../Models/GuildPrefixes");

module.exports = {
  name: "ready",
  async execute({ Instance }) {
    const prefixes = await PrefixSchema.find();

    prefixes.map((guild) => {
      Instance.guildPrefixes[guild.GuildID] = guild.Prefix;
    });
  },
};
```

# And that's it!

You're now ready to use LiteCommands to create an awesome discord bot!
Happy coding!
