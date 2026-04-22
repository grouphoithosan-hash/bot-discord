const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "nme",

  async execute(message) {

    const user = message.author;

    // 🔥 LOAD LẠI MỖI LẦN (FIX LỖI)
    let coins = fs.existsSync("./coins.json") ? JSON.parse(fs.readFileSync("./coins.json", "utf8")) : {};
    let tickets = fs.existsSync("./tickets.json") ? JSON.parse(fs.readFileSync("./tickets.json", "utf8")) : {};
    let daily = fs.existsSync("./daily.json") ? JSON.parse(fs.readFileSync("./daily.json", "utf8")) : {};
    let dollars = fs.existsSync("./dollars.json") ? JSON.parse(fs.readFileSync("./dollars.json", "utf8")) : {};
    let achievements = fs.existsSync("./achievements.json") ? JSON.parse(fs.readFileSync("./achievements.json", "utf8")) : {};

    const coin = coins[user.id] || 0;
    const ticket = tickets[user.id] || 0;
    const dollar = dollars[user.id] || 0;
    const streak = daily[user.id]?.streak || 0;

    // =========================
    // LEVEL

    function getLevel(coins) {
      return Math.floor(Math.log10(coins + 1));
    }

    function getProgress(coins) {
      const level = getLevel(coins);
      const current = coins - Math.pow(10, level);
      const needed = Math.pow(10, level + 1) - Math.pow(10, level);
      return Math.max(0, Math.min(1, current / needed));
    }

    function progressBar(percent) {
      const total = 10;
      const filled = Math.round(percent * total);
      return "█".repeat(filled) + "░".repeat(total - filled);
    }

    const level = getLevel(coin);
    const progress = getProgress(coin);
    const bar = progressBar(progress);

    // =========================
    // RANK

    const sorted = Object.entries(coins).sort((a, b) => b[1] - a[1]);
    const index = sorted.findIndex(x => x[0] === user.id);
    const rank = index !== -1 ? index + 1 : "N/A";

    // =========================
    // JOIN DATE

    const member = message.guild.members.cache.get(user.id);
    const joinDate = member?.joinedAt
      ? `${member.joinedAt.getDate()}/${member.joinedAt.getMonth() + 1}/${member.joinedAt.getFullYear()}`
      : "Không rõ";

    // =========================
    // ACHIEVEMENT (FIX LOAD)

    if (!achievements[user.id]) achievements[user.id] = [];

    const userAch = achievements[user.id];

    if (coin >= 1000 && !userAch.includes("💰 Nhà giàu")) {
      userAch.push("💰 Nhà giàu");
    }

    if (coin >= 1000000 && !userAch.includes("👑 Đại gia")) {
      userAch.push("👑 Đại gia");
    }

    if (streak >= 3 && !userAch.includes("🔥 Chăm chỉ")) {
      userAch.push("🔥 Chăm chỉ");
    }

    fs.writeFileSync("./achievements.json", JSON.stringify(achievements, null, 2));

    const achText = userAch.length > 0 ? userAch.join(", ") : "Chưa có";

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
🔥 Chuỗi: **${streak} ngày**

📊 Level: **${level}**
${bar} (${Math.round(progress * 100)}%)

🏆 Rank: **#${rank}**
📅 Tham gia: **${joinDate}**

🏅 Thành tựu:
${achText}`
      )
      .setFooter({ text: "Cappy System" });

    return message.reply({ embeds: [embed] });
  }
};
