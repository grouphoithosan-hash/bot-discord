const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

const OWNER_ID = "ID_CUA_BAN"; // 🔥 thay ID của bạn

// =========================
// LOAD

let disabledChannels = [];

if (fs.existsSync("./off_channels.json")) {
  disabledChannels = JSON.parse(fs.readFileSync("./off_channels.json"));
}

function saveChannels() {
  fs.writeFileSync("./off_channels.json", JSON.stringify(disabledChannels, null, 2));
}

// =========================

module.exports = {

  name: "nbot",

  execute(message, cmd) {

    if (message.author.id !== OWNER_ID) return;

    const channelId = message.channel.id;

    // =========================
    // 🔴 NOFF

    if (cmd === "noff") {

      if (!disabledChannels.includes(channelId)) {
        disabledChannels.push(channelId);
        saveChannels();
      }

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("⛔ BOT OFF")
        .setDescription(
`❌ Bot đã tắt trong kênh này

👉 Vui lòng chuyển qua kênh game trong server để chơi`
        );

      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 6000);
      });

    }

    // =========================
    // 🟢 NON

    if (cmd === "non") {

      disabledChannels = disabledChannels.filter(id => id !== 
channelId);
      saveChannels();

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ BOT ON")
        .setDescription("Bot đã hoạt động lại trong kênh này");

      message.reply({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 6000);
      });

    }

  },

  // =========================

  isDisabled(channelId) {
    return disabledChannels.includes(channelId);
  }

};
