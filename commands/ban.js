const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

const ownerId = "1441657956037820577"; // ⚠️ THAY ID

// =========================
// LOAD FILE (FIX LỖI KHÔNG LƯU)

let bans = {};
if (fs.existsSync("./bans.json")) {
  bans = JSON.parse(fs.readFileSync("./bans.json", "utf8"));
}

// =========================
// SAVE FILE (CHẮC CHẮN LƯU)

function saveBan() {
  fs.writeFileSync("./bans.json", JSON.stringify(bans, null, 2));
}

// =========================
// CHECK BAN

async function checkBan(message) {
  const userId = message.author.id;

  if (!bans[userId]) return false;

  // cho phép .helps
  if (message.content.startsWith(".helps")) return false;

  const data = bans[userId];

  const reason = data.reason || "Không có lý do";
  const time = data.time || "Không rõ";

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("🚫 BẠN ĐÃ BỊ CẤM SỬ DỤNG BOT")
    .setDescription(
`👤 User: **${message.author.username}**

❌ Bạn đã bị cấm bởi **Admin/Mod**

🕒 Thời gian: ${time}

📌 Lý do: **${reason}**

📩 Nếu bạn thấy sai sót,
hãy dùng lệnh **.helps** để kháng cáo`
    )
    .setFooter({ text: "Cappy System" });

  // ✅ cách fake "ẩn"
  const msg = await message.reply({ embeds: [embed] });

  // xóa sau 5 giây để tránh spam
  setTimeout(() => {
    msg.delete().catch(() => {});
  }, 5000);

  return true;
}

// =========================
// BAN

function handleBan(message, args) {

  if (message.author.id !== ownerId) {
    return message.reply("❌ Không có quyền");
  }

  const id = args[0];
  const reason = args.slice(1).join(" ") || "Không có lý do";

  if (!id) return message.reply("❌ Nhập ID");

  bans[id] = {
    reason: reason,
    time: new Date().toLocaleString("vi-VN")
  };

  saveBan(); // 🔥 FIX LƯU

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("✅ BAN THÀNH CÔNG")
    .setDescription(
`👤 User: <@${id}>
📌 Lý do: **${reason}**`
    );

  return message.reply({ embeds: [embed] });
}

// =========================
// UNBAN

function handleUnban(message, args) {

  if (message.author.id !== ownerId) {
    return message.reply("❌ Không có quyền");
  }

  const id = args[0];
  const reason = args.slice(1).join(" ") || "Không có lý do";

  if (!id) return message.reply("❌ Nhập ID");

  if (!bans[id]) {
    return message.reply("❌ Người này chưa bị ban");
  }

  delete bans[id];

  saveBan(); // 🔥 FIX LƯU

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("✅ UNBAN THÀNH CÔNG")
    .setDescription(
`👤 User: <@${id}>
📌 Lý do: **${reason}**`
    );

  return message.reply({ embeds: [embed] });
}

// =========================

module.exports = {
  checkBan,
  handleBan,
  handleUnban
};
