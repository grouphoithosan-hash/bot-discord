const { EmbedBuilder } = require("discord.js");

const symbols = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎"];

function getRandom() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

module.exports = {
  async execute(message, coins, saveCoins) {

    const userId = message.author.id;

    const args = message.content.split(" ");
    const bet = parseInt(args[1]);

    if (!bet || isNaN(bet) || bet <= 0) {
      return message.reply("❌ Sai cú pháp: .nslot <số_coin>");
    }

    if ((coins[userId] || 0) < bet) {
      return message.reply("❌ Không đủ coin");
    }

    // trừ tiền cược
    coins[userId] -= bet;
    saveCoins();

    // gửi message ban đầu
    let msg = await message.reply("🎰 Đang quay...");

    // hiệu ứng quay nhanh tự nhiên
    let r1 = getRandom();
    let r2 = getRandom();
    let r3 = getRandom();

    await new Promise(res => setTimeout(res, 500));
    await msg.edit(`🎰 [ ${r1} | ❓ | ❓ ]`);

    await new Promise(res => setTimeout(res, 500));
    r2 = getRandom();
    await msg.edit(`🎰 [ ${r1} | ${r2} | ❓ ]`);

    await new Promise(res => setTimeout(res, 500));
    r3 = getRandom();

    const result = [r1, r2, r3];

    // check win
    let multiplier = 0;

    if (r1 === r2 && r2 === r3) {
      // 3 giống nhau
      multiplier = 5;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      // 2 giống nhau
      multiplier = 2;
    }

    let winAmount = 0;

    if (multiplier > 0) {
      winAmount = bet * multiplier;
      coins[userId] += winAmount;
    }

    saveCoins();

    const embed = new EmbedBuilder()
      .setColor(multiplier > 0 ? 0x2ecc71 : 0xe74c3c)
      .setTitle("🎰 SLOT RESULT")
      .setDescription(
`👤 <@${userId}>

[ ${result.join(" | ")} ]

💰 Bet: ${bet} 🪙
${multiplier > 0 ? `🎉 Win: x${multiplier} (+${winAmount} 🪙)` : "❌ Thua"}`
      );

    return msg.edit({ content: "", embeds: [embed] });
  }
};
