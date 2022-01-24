const mongoose = require("mongoose");

const conn = (client) => {
  if (client.Instance.dbOptions) {
    mongoose.connect(client.Instance.mongoUri, client.Instance.dbOptions, () =>
      console.log("LiteCommands | Mongo Connected")
    );
  } else {
    mongoose.connect(client.Instance.mongoUri, () =>
      console.log("LiteCommands | Mongo Connected")
    );
  }
};

module.exports = conn;
