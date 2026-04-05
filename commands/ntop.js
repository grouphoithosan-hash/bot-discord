const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "ntop",

  async execute(message) {

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

    // =========================
    // MERGE DATA

    let data = {};

    for (const id in coins) {
      data[id] = {
        coin: coins[id] || 0,
        ticket: tickets[id] || 0
      };
    }

    for (const id in tickets) {
      if (!data[id]) {
        data[id] = {
          coin: coins[id] || 0,
          ticket: tickets[id] || 0
        };
      }
    }

    // =========================
    // SORT TOP

    const sorted = Object.entries(data).sort(
      (a, b) => (b[1].coin + b[1].ticket) - (a[1].coin + a[1].ticket)
    );

    const top1 = sorted[0];
    const top2 = sorted[1];
    const top3 = sorted[2];

    // =========================
    // FIX UNKNOWN (FETCH USER)

    async function getName(id) {
      try {
        const user = await message.client.users.fetch(id);
        return user.username;
      } catch {
        return "Unknown";
      }
    }

    const name1 = top1 ? await getName(top1[0]) : "";
    const name2 = top2 ? await getName(top2[0]) : "";
    const name3 = top3 ? await getName(top3[0]) : "";

    // =========================
    // BUILD TEXT

    let desc = "🏆 **BẢNG XẾP HẠNG GIÀU NHẤT**\n\n";

    if (top1) {
      desc += `🥇 #1 ${name1}
💰 ${top1[1].coin} 🪙 | 🎟️ ${top1[1].ticket}\n\n`;
    }

    if (top2) {
      desc += `🥈 #2 ${name2}
💰 ${top2[1].coin} 🪙 | 🎟️ ${top2[1].ticket}\n\n`;
    }

    if (top3) {
      desc += `🥉 #3 ${name3}
💰 ${top3[1].coin} 🪙 | 🎟️ ${top3[1].ticket}\n\n`;
    }

    desc += "━━━━━━━━━━━━━━\n";

    // =========================
    // USER INFO

    const userIndex = sorted.findIndex(u => u[0] === message.author.id);

    const userCoin = coins[message.author.id] || 0;
    const userTicket = tickets[message.author.id] || 0;

    desc += `👤 Bạn:
#${userIndex + 1 || "?"}
💰 ${userCoin} 🪙 | 🎟️ ${userTicket}`;

    // =========================
    // EMBED

    const embed = new EmbedBuilder()
      .setColor(0xffcc99) // 🟠 cam nhạt
      .setDescription(desc);

    return message.reply({ embeds: [embed] });
  }
};
