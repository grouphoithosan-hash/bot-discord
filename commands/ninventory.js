const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ninventory",

  async execute(ctx) {

    // 🔥 auto detect message hoặc interaction
    const user = ctx.user || ctx.author;

    const inventory = fs.existsSync("./inventory.json")
      ? JSON.parse(fs.readFileSync("./inventory.json"))
      : {};

    const items = inventory[user.id] || [];

    const embed = new EmbedBuilder()
      .setColor(0x00FFFF)
      .setTitle("🎒 Inventory của bạn");

    if (items.length === 0) {
      embed.setDescription("❌ Bạn chưa có vật phẩm nào");
    } else {
      embed.setDescription(
        items.map((item, i) => `${i + 1}. ${item.name}`).join("\n")
      );
    }

    // 🔥 reply đúng kiểu
    if (ctx.reply) {
      return ctx.reply({ embeds: [embed], ephemeral: true });
    } else {
      return ctx.channel.send({ embeds: [embed] });
    }
  }
};
