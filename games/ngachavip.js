const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

// =========================
// DATA LOAD

function load(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =========================
// DANH SÁCH TRÁI

const fruits = [
  // COMMON
  { name: "🚀 Rocket", rarity: "common", color: 0xffffff, chance: 20 },
  { name: "🌀 Lò xo", rarity: "common", color: 0xffffff, chance: 20 },
  { name: "💣 Bom", rarity: "common", color: 0xffffff, chance: 20 },
  { name: "🌫 Khói", rarity: "common", color: 0xffffff, chance: 20 },
  { name: "🌵 Gai", rarity: "common", color: 0xffffff, chance: 20 },

  // UNCOMMON
  { name: "🔥 Lửa", rarity: "uncommon", color: 0x00bfff, chance: 20 },
  { name: "❄️ Băng", rarity: "uncommon", color: 0x00bfff, chance: 20 },
  { name: "🏜 Cát", rarity: "uncommon", color: 0x00bfff, chance: 20 },
  { name: "🌑 Bóng tối", rarity: "uncommon", color: 0x00bfff, chance: 20 },
  { name: "🦅 Đại bàng", rarity: "uncommon", color: 0x00bfff, chance: 20 },

  // RARE
  { name: "💡 Light", rarity: "rare", color: 0x9b59b6, chance: 20 },
  { name: "🧤 Cao su", rarity: "rare", color: 0x9b59b6, chance: 20 },
  { name: "👻 Hồn ma", rarity: "rare", color: 0x9b59b6, chance: 20 },
  { name: "🌋 Dung nham", rarity: "rare", color: 0x9b59b6, chance: 20 },

  // LEGENDARY
  { name: "🌎 Quake", rarity: "legendary", color: 0xff00ff, chance: 10 },
  { name: "🧘 Phật tổ", rarity: "legendary", color: 0xff00ff, chance: 10 },
  { name: "💖 Love", rarity: "legendary", color: 0xff00ff, chance: 10 },
  { name: "🕷 Spider", rarity: "legendary", color: 0xff00ff, chance: 20 },
  { name: "🔊 Sound", rarity: "legendary", color: 0xff00ff, chance: 20 },
  { name: "🔥 Phượng hoàng", rarity: "legendary", color: 0xff00ff, chance: 20 },

  // MYTHICAL
  { name: "🌌 Gravity", rarity: "mythical", color: 0xff0000, chance: 3 },
  { name: "🐘 Voi ma mút", rarity: "mythical", color: 0xff0000, chance: 2 },
  { name: "🦖 Khủng long", rarity: "mythical", color: 0xff0000, chance: 1 },
  { name: "🧂 Bột", rarity: "mythical", color: 0xff0000, chance: 0.005 },
  { name: "🌑 Dark", rarity: "mythical", color: 0xff0000, chance: 1 },
  { name: "☠️ Độc", rarity: "mythical", color: 0xff0000, chance: 0.01 },
  { name: "🌫 Gas", rarity: "mythical", color: 0xff0000, chance: 1 },
  { name: "👻 Linh hồn", rarity: "mythical", color: 0xff0000, chance: 2 },
  { name: "🐯 Tiger", rarity: "mythical", color: 0xff0000, chance: 0.000001 },
  { name: "❄️ Yeti", rarity: "mythical", color: 0xff0000, chance: 0.0000001 },
  { name: "🎮 Control", rarity: "mythical", color: 0xff0000, chance: 0.000003 }
];

// =========================
// RANDOM

function rollFruit() {
  const rand = Math.random() * 100;

  // ưu tiên mythic
  let cumulative = 0;
  for (const f of fruits.filter(x => x.rarity === "mythical")) {
    cumulative += f.chance;
    if (rand <= cumulative) return f;
  }

  // random còn lại
  return fruits[Math.floor(Math.random() * fruits.length)];
}

// =========================

module.exports = {
  name: "ngachavip",

  async execute(message, args) {

    const userId = message.author.id;

    let tickets = load("./tickets.json");
    let inventory = load("./inventory.json");

  // đảm bảo là số
if (!tickets[userId]) tickets[userId] = 0;

if (Number(tickets[userId]) < 1) {
  return message.reply("❌ Bạn không đủ vé 🎟️ cày thêm đi phần thưởng ngon lắm");
}

// trừ vé chuẩn
tickets[userId] = Number(tickets[userId]) - 1;

save("./tickets.json", tickets);


    const fruit = rollFruit();

    // lưu inventory
    if (!inventory[userId]) inventory[userId] = [];

    inventory[userId].push({
      id: Date.now(),
      name: fruit.name,
      rarity: fruit.rarity,
      emoji: fruit.name.split(" ")[0]
    });

    save("./inventory.json", inventory);

    // =========================
    // EMBED

    let desc = `🎰 Bạn nhận được: **${fruit.name}**`;

    if (fruit.rarity === "mythical") {
      desc = `💥 OMGGGGG!!!\n☠️ NỔ HŨ TO!!!\nBạn trúng **${fruit.name}**`;
    }

    const embed = new EmbedBuilder()
      .setColor(fruit.color)
      .setTitle("🎰 GACHA VIP")
      .setDescription(desc);

    message.reply({ embeds: [embed] });

   // =========================  
// LOG GLOBAL (fix mọi server)

const logChannel = await message.client.channels
  .fetch("1491036052994002994")
  .catch(() => null);

if (logChannel) {
  logChannel.send(
    `📢 ${message.author.tag} (${message.guild?.name || "DM"}) vừa gachavip và ra ${fruit.name}`
  );
}

  }
};
