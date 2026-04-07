const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

const OWNER_ID = "1441657956037820577";

module.exports = {
  name: "ncheckvar",

  async execute(message, args) {

    // 🔒 CHỈ OWNER
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Bạn không có quyền dùng lệnh này!");
    }

  let target =
  message.mentions.users.first() ||
  message.client.users.cache.get(args[0]);

// 🔥 nếu không có trong cache → fetch từ Discord
if (!target && args[0]) {
  try {
    target = await message.client.users.fetch(args[0]);
  } catch {
    return message.reply("❌ Không tìm thấy người dùng!");
  }
}

if (!target) return message.reply("❌ Tag hoặc nhập ID người cần check!");

    let data = fs.existsSync("./checkvar.json")
      ? JSON.parse(fs.readFileSync("./checkvar.json"))
      : {};

    let coins = fs.existsSync("./coins.json") ? JSON.parse(fs.readFileSync("./coins.json")) : {};
    let dollars = fs.existsSync("./dollars.json") ? JSON.parse(fs.readFileSync("./dollars.json")) : {};
    let tickets = fs.existsSync("./tickets.json") ? JSON.parse(fs.readFileSync("./tickets.json")) : {};

    const now = new Date();

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("🚨 Công Nghệ CheckVar")
      .setDescription(
`🔎 Người Bị Soi:
${target}

⏰ Thời gian: ${now.getHours()}:${now.getMinutes()}
📅 Ngày: ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}

💰 Hiện Đang Có:
🪙 : ${coins[target.id] || 0}
💲 : ${dollars[target.id] || 0}
🎟 : ${tickets[target.id] || 0}

📌 Trạng Thái Kiểm: ⏳ Đang chờ kết quả...`
      );

    const msg = await message.reply({ embeds: [embed] });

    data[msg.id] = {
      target: target.id
    };

    fs.writeFileSync("./checkvar.json", JSON.stringify(data, null, 2));
  }
};
