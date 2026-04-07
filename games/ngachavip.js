const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

// =========================
// LOAD DATA

let tickets = fs.existsSync("./tickets.json")
  ? JSON.parse(fs.readFileSync("./tickets.json"))
  : {};

let inventory = fs.existsSync("./inventory.json")
  ? JSON.parse(fs.readFileSync("./inventory.json"))
  : {};

function saveTickets() {
  fs.writeFileSync("./tickets.json", JSON.stringify(tickets, null, 2));
}

function saveInventory() {
  fs.writeFileSync("./inventory.json", JSON.stringify(inventory, null, 2));
}

// =========================
// ITEM LIST

const fruits = [
  // COMMON ⚪
  { name: "🚀 Rocket", rarity: "common", chance: 25 },
  { name: "🌀 Lò xo", rarity: "common", chance: 25 },
  { name: "💣 Bom", rarity: "common", chance: 25 },
  { name: "🌫️ Khói", rarity: "common", chance: 25 },

  // UNCOMMON 🔵
  { name: "🔥 Lửa", rarity: "uncommon", chance: 15 },
  { name: "❄️ Băng", rarity: "uncommon", chance: 15 },
  { name: "🏜️ Cát", rarity: "uncommon", chance: 15 },
  { name: "🌑 Bóng tối", rarity: "uncommon", chance: 15 },

  // RARE 🟣
  { name: "💡 Light", rarity: "rare", chance: 10 },
  { name: "🧪 Cao su", rarity: "rare", chance: 10 },
  { name: "👻 Hồn ma", rarity: "rare", chance: 10 },
  { name: "🌋 Dung nham", rarity: "rare", chance: 10 },

  // LEGENDARY 💗
  { name: "🌍 Quake", rarity: "legendary", chance: 5 },
  { name: "🧘 Phật tổ", rarity: "legendary", chance: 5 },
  { name: "💖 Love", rarity: "legendary", chance: 5 },
  { name: "🕷️ Spider", rarity: "legendary", chance: 5 },

  // SECRET ⚡
  { name: "⚡ Lightning", rarity: "secret", chance: 0.0001 },

  // MYTHICAL 🔴
  { name: "🌌 Gravity", rarity: "mythical", chance: 10 },
  { name: "🐘 Voi ma mút", rarity: "mythical", chance: 9.23 },
  { name: "🦖 Khủng long", rarity: "mythical", chance: 6 },
  { name: "☁️ Bột", rarity: "mythical", chance: 3 },
  { name: "☠️ Độc", rarity: "mythical", chance: 0.01 },
  { name: "💨 Gas", rarity: "mythical", chance: 1 },
  { name: "👻 Linh hồn", rarity: "mythical", chance: 2 },
  { name: "🐯 Tiger", rarity: "mythical", chance: 0.001 },
  { name: "❄️ Yeti", rarity: "mythical", chance: 0.001 },
  { name: "🎮 Control", rarity: "mythical", chance: 0.0003 }
];

// =========================
// RANDOM FUNCTION

function rollFruit() {
  const total = fruits.reduce((sum, f) => sum + f.chance, 0);
  let rand = Math.random() * total;

  for (let f of fruits) {
    if (rand < f.chance) return f;
    rand -= f.chance;
  }
}

// =========================
// COLOR

function getColor(rarity) {
  if (rarity === "common") return 0xffffff;
  if (rarity === "uncommon") return 0x3498db;
  if (rarity === "rare") return 0x9b59b6;
  if (rarity === "legendary") return 0xff66cc;
  if (rarity === "mythical") return 0xff0000;
  if (rarity === "secret") return 0xffff00;
}

// =========================

module.exports = {
  name: "ngachavip",

  async execute(message, args) {

    const userId = message.author.id;

    // check vé
    if ((tickets[userId] || 0) < 1) {
      return message.reply("❌ Bạn không đủ 🎟️ vé");
    }

    // trừ vé
    tickets[userId] -= 1;
    saveTickets();

    // quay
    const fruit = rollFruit();

    // save inventory
    if (!inventory[userId]) inventory[userId] = [];

    inventory[userId].push({
      id: Date.now(),
      name: fruit.name,
      type: "fruit",
      rarity: fruit.rarity
    });

    saveInventory();

    // =========================
    // EFFECT TEXT

    let text = `🎰 Bạn quay ra: **${fruit.name}**`;

    if (fruit.rarity === "mythical") {
      text =
`💥 OMGGGGG!!!
Hình như bạn trúng **MYTHIC** 😱

🔥 ${fruit.name}

☠️ NỔ HŨ TOOO!!!`;
    }

    if (fruit.rarity === "legendary") {
      text = `🌟 WOW!! Legendary xuất hiện: ${fruit.name}`;
    }

    if (fruit.rarity === "rare") {
      text = `✨ Bạn khá may mắn: ${fruit.name}`;
    }

    if (fruit.rarity === "common") {
      text = `🙂 Bình thường thôi: ${fruit.name}`;
    }

    // =========================
    // EMBED

    const embed = new EmbedBuilder()
      .setColor(getColor(fruit.rarity))
      .setTitle("🎰 GACHA VIP")
      .setDescription(text)
      .setFooter({ text: "Cappy Gacha System" });

    await message.reply({ embeds: [embed] });

    // =========================
    // LOG CHANNEL

    const logChannelId = "ID_KENH_LOG"; // 👈 THAY ID

    const logChannel = message.guild.channels.cache.get(logChannelId);

    if (logChannel) {
      logChannel.send(
`📢 ${message.author} vừa gachavip và ra được ${fruit.name}
🎁 Hãy trao quà cho thành viên nhanh!`
      );
    }

  }
};
