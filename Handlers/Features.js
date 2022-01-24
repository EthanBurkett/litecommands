const { Events } = require("../Validation/EventNames");
const { Client } = require("discord.js");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

/**
 *
 * @param {Client} client
 */

module.exports = async (client) => {
  const Table = new Ascii("LiteFeatures");

  if (!client.Instance.featuresDir) return;

  (await PG(`${client.Instance.featuresDir}/**/*.js`)).map(async (file) => {
    const event = require(file);
    const E = file.split("/");

    if (!Events.includes(event.name) || !event.name) {
      const L = file.split("/");
      await Table.addRow(
        `${event.name || "MISSING"}`,
        `⛔ Event name is either invalid or missing`,
        `${L[L.length - 2] + "/" + L[L.length - 1]}`
      );
      return;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    await Table.addRow(
      E[E.length - 1].substring(0, E[E.length - 1].length - 3),
      event.name,
      "🔹 SUCCESSFUL"
    );
  });

  console.log(await Table.toString());
};
