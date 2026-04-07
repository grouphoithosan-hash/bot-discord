const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

const OWNER_ID = "1441657956037820577";
const LOG_CHANNEL_ID = "1491036052994002994";

module.exports = {
  name: "nketqua",

  async execute(message, args) {

    // 🔒 CHỈ OWNER
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này!");
    }

    const status = args.join(" ");
    if (!status) return message.reply("❌ Nhập trạng thái!");

    let data = fs.existsSync("./checkvar.json")
      ? JSON.parse(fs.readFileSync("./checkvar.json"))
      : {};

    const lastMsgId = Object.keys(data).pop();
    if (!lastMsgId) return message.reply("❌ Không có check nào!");

    try {
      const msg = await message.channel.messages.fetch(lastMsgId);

      const embed = EmbedBuilder.from(msg.embeds[0]);

      embed.setDescription(
        embed.data.description.replace(
          /📌 Trạng Thái Kiểm:.*/,
          `📌 Trạng Thái Kiểm: ${status}`
        )
      );

      await msg.edit({ embeds: [embed] });

      // =========================
      // 📊 LOG

      const logChannel = await message.client.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("📊 LỊCH SỬ CHECKVAR")
          .setDescription(
`👮 Người check: ${message.author}

👤 Người bị check: <@${data[lastMsgId].target}>

📌 Kết quả: ${status}

📎 Link:
https://discord.com/channels/${message.guild.id}/${message.channel.id}/${msg.id}`
          )
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }

      message.reply("✅ Đã cập nhật + gửi log!");
    } catch (err) {
      message.reply("❌ Không tìm thấy bảng check!");
    }
  }
};
