const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

module.exports = {
  name: "ntraodoi",

  async execute(message, args, coins, dollars, saveCoins, saveDollars) {

    const userId = message.author.id;
    const input = args[0];

    if (!input) {
      return message.reply("❌ Dùng: `.ntraodoi 200c` hoặc `.ntraodoi 1d`");
    }

    let coinAmount = 0;
    let dollarAmount = 0;
    let mode = null; // 🔥 xác định chiều

    // =========================
    // PARSE

    if (input.endsWith("c")) {
      mode = "coinToDollar";
      coinAmount = parseInt(input.replace("c", ""));
      dollarAmount = Math.floor(coinAmount / 200);
    } 
    else if (input.endsWith("d")) {
      mode = "dollarToCoin";
      dollarAmount = parseInt(input.replace("d", ""));
      coinAmount = dollarAmount * 200;
    } 
    else {
      return message.reply("❌ Sai định dạng (200c hoặc 1d)");
    }

    if (coinAmount <= 0 || dollarAmount <= 0) {
      return message.reply("❌ Số không hợp lệ");
    }

    // =========================
    // CHECK BALANCE

    if (mode === "coinToDollar" && (coins[userId] || 0) < coinAmount) {
      return message.reply("❌ Không đủ 🪙 coin");
    }

    if (mode === "dollarToCoin" && (dollars[userId] || 0) < dollarAmount) {
      return message.reply("❌ Không đủ 💲");
    }

    // =========================
    // CONFIRM

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle("💱 XÁC NHẬN TRAO ĐỔI")
      .setDescription(
mode === "coinToDollar"
? `🪙 ${coinAmount} ➜ 💲 ${dollarAmount}`
: `💲 ${dollarAmount} ➜ 🪙 ${coinAmount}`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("yes")
        .setLabel("YES")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("no")
        .setLabel("NO")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await message.reply({
      embeds: [embed],
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      time: 15000
    });

    // =========================

    collector.on("collect", async (interaction) => {

      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "❌ Không phải bạn",
          ephemeral: true
        });
      }

      if (interaction.customId === "no") {
        collector.stop();
        return interaction.update({
          content: "❌ Đã hủy trao đổi",
          embeds: [],
          components: []
        });
      }

      if (interaction.customId === "yes") {

        await interaction.update({
          content: "💱 Đang xử lý...",
          embeds: [],
          components: []
        });

        await new Promise(r => setTimeout(r, 1000));

        // =========================
        // 🔥 FIX CHUẨN LOGIC

        if (mode === "coinToDollar") {
          coins[userId] -= coinAmount;
          dollars[userId] = (dollars[userId] || 0) + dollarAmount;
        }

        if (mode === "dollarToCoin") {
          dollars[userId] -= dollarAmount;
          coins[userId] = (coins[userId] || 0) + coinAmount;
        }

        saveCoins();
        saveDollars();

        // =========================

        const done = new EmbedBuilder()
          .setColor(0x7CFC00)
          .setTitle("✅ TRAO ĐỔI THÀNH CÔNG")
          .setDescription(
mode === "coinToDollar"
? `🪙 -${coinAmount}\n💲 +${dollarAmount}`
: `💲 -${dollarAmount}\n🪙 +${coinAmount}`
          );

        return msg.edit({
          content: "",
          embeds: [done],
          components: []
        });
      }

    });

    // =========================

    collector.on("end", () => {
      if (msg.editable) {
        msg.edit({ components: [] });
      }
    });

  }
};
