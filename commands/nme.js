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

// 🔥 streak
let daily = {};
if (fs.existsSync("./daily.json")) {
  daily = JSON.parse(fs.readFileSync("./daily.json", "utf8"));
}

// 💲 dollars
let dollars = {};
if (fs.existsSync("./dollars.json")) {
  dollars = JSON.parse(fs.readFileSync("./dollars.json", "utf8"));
}

// 🏅 achievement
let achievements = {};
if (fs.existsSync("./achievements.json")) {
  achievements = JSON.parse(fs.readFileSync("./achievements.json", "utf8"));
}

// =========================
// LEVEL SYSTEM

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

// =========================
// RANK

function getRank(userId) {
  const sorted = Object.entries(coins)
    .sort((a, b) => b[1] - a[1]);

  const index = sorted.findIndex(x => x[0] === userId);
  return index !== -1 ? index + 1 : "N/A";
}

// =========================
// ACHIEVEMENT AUTO

function updateAchievement(userId, coin, streak) {
  if (!achievements[userId]) achievements[userId] = [];

  const userAch = achievements[userId];

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
}

// =========================

module.exports = {
  name: "nme",

  async execute(message) {

    const user = message.author;

    const coin = coins[user.id] || 0;
    const ticket = tickets[user.id] || 0;
    const dollar = dollars[user.id] || 0;
    const streak = daily[user.id]?.streak || 0;

    // 🔥 LEVEL
    const level = getLevel(coin);
    const progress = getProgress(coin);
    const bar = progressBar(progress);

    // 🏆 RANK
    const rank = getRank(user.id);

    // 📅 JOIN DATE
    const member = message.guild.members.cache.get(user.id);
    const joinDate = member?.joinedAt
      ? `${member.joinedAt.getDate()}/${member.joinedAt.getMonth() + 1}/${member.joinedAt.getFullYear()}`
      : "Không rõ";

    // 🏅 ACHIEVEMENT
    updateAchievement(user.id, coin, streak);
    const userAch = achievements[user.id] || [];
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


