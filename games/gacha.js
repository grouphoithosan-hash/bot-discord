const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

// LOAD TICKETS
let tickets = {};

if (fs.existsSync("./tickets.json")) {
  tickets = JSON.parse(fs.readFileSync("./tickets.json"));
}

function saveTickets() {
  fs.writeFileSync("./tickets.json", JSON.stringify(tickets, null, 2));
}

// =========================

module.exports = {
  name: "gacha",

  async execute(message, coins, saveCoins) {
    const id = message.author.id;

    // CHECK COIN
    if ((coins[id] || 0) < 100) {
      return message.reply("❌ Bạn cần ít nhất 100 🪙 để quay gacha");
    }

    coins[id] -= 100;

    // EFFECT
    const loadingMsg = await message.reply("🎰 Đang quay...");
    await new Promise(res => setTimeout(res, 2500));

    // RANDOM
    const roll = Math.random() * 100;

    let result;
    let rewardCoin = 0;
    let rewardTicket = 0;

    if (roll < 0.001) {
      result = "Mythic";
      rewardCoin = 200;
      rewardTicket = 1;
    } else if (roll < 5) {
      result = "Legendary";
      rewardCoin = 100;
    } else if (roll < 30.1) {
      result = "Rare";
      rewardCoin = 30;
    } else if (roll < 60.1) {
      result = "Uncommon";
      rewardCoin = 10;
    } else {
      result = "Common";
    }

    // APPLY
    coins[id] = (coins[id] || 0) + rewardCoin;

    if (rewardTicket > 0) {
      tickets[id] = (tickets[id] || 0) + rewardTicket;
      saveTickets();
    }

    saveCoins();

    // EMBED
    const color =
      result === "Mythic" ? 0xff0000 :
      result === "Legendary" ? 0xff66cc :
      result === "Rare" ? 0x0033cc :
      result === "Uncommon" ? 0x00bfff :
      0xffffff;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle("🎰 GACHA RESULT")
      .setDescription(
        `🎲 Kết quả: **${result}**\n` +
        `💸 Trừ: **100 🪙**\n` +
        `💰 Nhận: **${rewardCoin} 🪙**\n` +
        (rewardTicket ? `🎟️ +${rewardTicket}` : "")
      );

    return loadingMsg.edit({ content: null, embeds: [embed] });
  }
};

