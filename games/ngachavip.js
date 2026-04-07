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
  { name: "🚀 Rocket", rarity: "common", color: 0xffffff },
  { name: "🌀 Lò xo", rarity: "common", color: 0xffffff },
  { name: "💣 Bom", rarity: "common", color: 0xffffff },
  { name: "🌫 Khói", rarity: "common", color: 0xffffff },
  { name: "🌵 Gai", rarity: "common", color: 0xffffff },

  // UNCOMMON
  { name: "🔥 Lửa", rarity: "uncommon", color: 0x00bfff },
  { name: "❄️ Băng", rarity: "uncommon", color: 0x00bfff },
  { name: "🏜 Cát", rarity: "uncommon", color: 0x00bfff },
  { name: "🌑 Bóng tối", rarity: "uncommon", color: 0x00bfff },
  { name: "🦅 Đại bàng", rarity: "uncommon", color: 0x00bfff },

  // RARE
  { name: "💡 Light", rarity: "rare", color: 0x9b59b6 },
  { name: "🧤 Cao su", rarity: "rare", color: 0x9b59b6 },
  { name: "👻 Hồn ma", rarity: "rare", color: 0x9b59b6 },
  { name: "🌋 Dung nham", rarity: "rare", color: 0x9b59b6 },

  // LEGENDARY
  { name: "🌎 Quake", rarity: "legendary", color: 0xff00ff },
  { name: "🧘 Phật tổ", rarity: "legendary", color: 0xff00ff },
  { name: "💖 Love", rarity: "legendary", color: 0xff00ff },
  { name: "🕷 Spider", rarity: "legendary", color: 0xff00ff },
  { name: "🔊 Sound", rarity: "legendary", color: 0xff00ff },
  { name: "🔥 Phượng hoàng", rarity: "legendary", color: 0xff00ff },

  // MYTHICAL
  { name: "🌌 Gravity", rarity: "mythical", color: 0xff0000, chance: 10 },
  { name: "🐘 Voi ma mút", rarity: "mythical", color: 0xff0000, chance: 9.23 },
  { name: "🦖 Khủng long", rarity: "mythical", color: 0xff0000, chance: 6 },
  { name: "🧂 Bột", rarity: "mythical", color: 0xff0000, chance: 3 },
  { name: "🌑 Dark", rarity: "mythical", color: 0xff0000, chance: 1 },
  { name: "☠️ Độc", rarity: "mythical", color: 0xff0000, chance: 0.01 },
  { name: "🌫 Gas", rarity: "mythical", color: 0xff0000, chance: 1 },
  { name: "👻 Linh hồn", rarity: "mythical", color: 0xff0000, chance: 2 },
  { name: "🐯 Tiger", rarity: "mythical", color: 0xff0000, chance: 0.001 },
  { name: "❄️ Yeti", rarity: "mythical", color: 0xff0000, chance: 0.001 },
  { name: "🎮 Control", rarity: "mythical", color: 0xff0000, chance: 0.0003 }
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

    if ((tickets[userId] || 0) < 1) {
      return message.reply("❌ Bạn không đủ vé 🎟️");
    }

    // trừ vé
    tickets[userId] -= 1;
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
    // LOG (1491036052994002994)

    const logChannel = message.guild.channels.cache.get("YOUR_CHANNEL_ID");

    if (logChannel) {
      logChannel.send(
        `📢 ${message.author} vừa gachavip và ra được ${fruit.name}`
      );
    }
  }
};
