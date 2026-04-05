const { EmbedBuilder } = require("discord.js");

// 🔥 ID của bạn (thay vào)
const OWNER_ID = "1441657956037820577";

module.exports = {
  name: "nthongbao",

  async execute(message, args) {

    // =========================
    // CHECK OWNER

    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này");
    }

    // =========================
    // CHECK NỘI DUNG

    const content = args.join(" ");

    if (!content) {
      return message.reply("❌ Nhập nội dung thông báo");
    }

    // =========================
    // TIME

    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, "0");

    // =========================
    // EMBED (XANH DƯƠNG)

    const embed = new EmbedBuilder()
      .setColor(0x3498db) // 🔵 xanh dương
      .setTitle("📢 Thông Báo Cappy Zone")
      .setDescription(
`👤 **Bởi:** ${message.author}

📅 **Ngày:** ${day}/${month}/${year}
⏰ **Thời gian:** ${hour}h : ${minute}p

━━━━━━━━━━━━━━━━━━

📌 **Nội dung:**
${content}`
      )
      .setFooter({ text: "Cappy System" });

    // =========================
    // SEND

    const msg = await message.channel.send({
      embeds: [embed]
    });

    // =========================
    // REACTIONS

    await msg.react("⭕");
    await msg.react("❌");

  }
};
