const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

// =========================

module.exports = {
  name: "ncoin",

  async execute(message, coins) {
    const user = message.author;

    // load dollars
    let dollars = {};
    if (fs.existsSync("./dollars.json")) {
      dollars = JSON.parse(fs.readFileSync("./dollars.json"));
    }

    // 🔥 FIX tickets
    let tickets = {};
    if (fs.existsSync("./tickets.json")) {
      tickets = JSON.parse(fs.readFileSync("./tickets.json"));
    }

    const userCoins = coins[user.id] || 0;
    const userTickets = tickets[user.id] || 0;
    const userDollars = dollars[user.id] || 0;

    const embed = new EmbedBuilder()
      .setColor(0x7CFC00)
      .setDescription(
`👤 ${user}

💰 Bạn hiện có:
🪙 ${userCoins}
💲 ${userDollars}
🎟️ ${userTickets}`
      )
      .setFooter({ text: "Cappy System" });

    return message.reply({ embeds: [embed] });
  }
};
