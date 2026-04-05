const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

// =========================
// LOAD DAILY DATA
let daily = {};

if (fs.existsSync("./daily.json")) {
  daily = JSON.parse(fs.readFileSync("./daily.json"));
}

function saveDaily() {
  fs.writeFileSync("./daily.json", JSON.stringify(daily, null, 2));
}

// =========================

module.exports = {
  name: "daily",
  async execute(message, coins, saveCoins) {
    const id = message.author.id;
    const now = Date.now();

    if (!daily[id]) {
      daily[id] = {
        lastClaim: 0,
        streak: 0
      };
    }

    const data = daily[id];

    // 24h = 86400000 ms
    if (now - data.lastClaim < 86400000) {
      const remaining = 86400000 - (now - data.lastClaim);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);

      return message.reply(
        `⏳ Bạn đã điểm danh rồi!\nQuay lại sau: **${hours}h ${minutes}m**`
      );
    }

    // =========================
    // STREAK LOGIC
    if (now - data.lastClaim < 172800000) {
      // trong vòng 48h giữ streak
      data.streak += 1;
    } else {
      data.streak = 1;
    }

    data.lastClaim = now;

    // =========================
    // REWARD RANDOM 1-50
    const reward = Math.floor(Math.random() * 50) + 1;

    coins[id] = (coins[id] || 0) + reward;
    saveCoins();

    saveDaily();

    // =========================
    // EMBED
    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setAuthor({
        name: `${message.author.username} Daily`,
        iconURL: message.author.displayAvatarURL()
      })
      .setDescription(
        `✅ **Điểm danh thành công!**\n\n` +
        `💰 Nhận: **${reward} 🪙**\n` +
        `🔥 Streak: **${data.streak} ngày**\n\n` +
        `📅 Come back tomorrow!`
      )
      .setThumbnail(message.author.displayAvatarURL())
      .setFooter({ text: "Cappy Daily System" })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
