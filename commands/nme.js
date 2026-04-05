const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

// =========================
// LOAD DATA

let coins = {};
if (fs.existsSync("./coins.json")) {
  coins = JSON.parse(fs.readFileSync("./coins.json", "utf8"));
}

let tickets = {};
if (fs.existsSync("./tickets.json")) {
  tickets = JSON.parse(fs.readFileSync("./tickets.json", "utf8"));
}

// 🔥 streak (chuỗi ngày)
let daily = {};
if (fs.existsSync("./daily.json")) {
  daily = JSON.parse(fs.readFileSync("./daily.json", "utf8"));
}

// 💲 THÊM DOLLARS
let dollars = {};
if (fs.existsSync("./dollars.json")) {
  dollars = JSON.parse(fs.readFileSync("./dollars.json", "utf8"));
}

// =========================

module.exports = {
  name: "nme",

  async execute(message) {

    const user = message.author;

    const coin = coins[user.id] || 0;
    const ticket = tickets[user.id] || 0;
    const dollar = dollars[user.id] || 0; // 🔥 THÊM DÒNG NÀY

    const streak = daily[user.id]?.streak || 0;

    // =========================
    // EMBED

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📌 Profile ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setDescription(
`💰 Coin: **${coin} 🪙**
💲 Dollars: **${dollar} 💲**
🎟️ Ticket: **${ticket} 🎟**
🔥 Chuỗi: **${streak} ngày**`
      )
      .setFooter({ text: "Cappy System" });

    return message.reply({ embeds: [embed] });
  }
};
