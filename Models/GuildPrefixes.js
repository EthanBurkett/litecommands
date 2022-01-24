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

const name = "litecmds-prefixes";

module.exports = mongoose.models[name] || mongoose.model(name, Schema);
