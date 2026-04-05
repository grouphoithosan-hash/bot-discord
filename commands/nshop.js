const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

module.exports = {
  execute(message) {

    // =========================
    // LOAD SHOP

    let shop = fs.existsSync("./shop.json")
      ? JSON.parse(fs.readFileSync("./shop.json"))
      : { item: null, lastReset: 0 };

    const now = Date.now();

    // =========================
    // RESET 2H

    if (!shop.lastReset || now - shop.lastReset > 2 * 60 * 60 * 1000 || !shop.item) {

      const random = Math.random();

      if (random < 0.5) {
        shop.item = {
          name: "🎟️ Ticket",
          price: 10,
          type: "ticket"
        };
      } else {
        shop.item = {
          name: "🍀 Luck +5%",
          price: 1,
          type: "fake"
        };
      }

      shop.lastReset = now;

      fs.writeFileSync("./shop.json", JSON.stringify(shop, null, 2));
    }

    // =========================
    // TIME LEFT

    const timeLeft = 2 * 60 * 60 * 1000 - (now - shop.lastReset);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    // =========================
    // FIX LỖI ITEM NULL

    const itemName = shop.item?.name || "❓ Unknown Item";
    const itemPrice = shop.item?.price || 0;

    // =========================
    // EMBED

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("🛒 SHOP")
      .setDescription(
`⏳ Stock reset sau: **${minutes}m ${seconds}s**

1️⃣ 🎁 Random coin (FREE)

2️⃣ ${itemName} - ${itemPrice}💲`
      );

    // =========================
    // BUTTON

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("shop_free")
        .setLabel("🎁 Free")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("shop_buy")
        .setLabel("🛒 Buy")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("open_inventory")
        .setLabel("🎒 Inventory")
        .setStyle(ButtonStyle.Secondary)
    );

    return message.reply({ embeds: [embed], components: [row] });
  }
};
