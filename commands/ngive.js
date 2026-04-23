const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// =========================

module.exports = {
  name: "ngive",

  async execute(message, args, coins, tickets, saveCoins, saveTickets) {

    const user = message.mentions.users.first();
    const rawAmount = args[1];

    if (!user || !rawAmount) {
      return message.reply("❌ Sai cú pháp: .ngive @user 1c hoặc 1t");
    }

    const sender = message.author;

    // =========================
    // PARSE AMOUNT

    let type = null;
    let amount = 0;

    if (rawAmount.toLowerCase().endsWith("c")) {
      type = "coin";
      amount = parseInt(rawAmount.slice(0, -1));
    } else if (rawAmount.toLowerCase().endsWith("t")) {
      type = "ticket";
      amount = parseInt(rawAmount.slice(0, -1));
    }

    if (!type || isNaN(amount) || amount <= 0) {
      return message.reply("❌ Sai định dạng. Ví dụ: 1c hoặc 1t");
    }

    // =========================
    // CHECK BALANCE

    if (type === "coin" && (coins[sender.id] || 0) < amount) {
      return message.reply("❌ Không đủ coin");
    }

    if (type === "ticket" && (tickets[sender.id] || 0) < amount) {
      return message.reply("❌ Không đủ ticket");
    }

    // =========================
    // EMBED CONFIRM

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setDescription(
`👤 ${sender} xác nhận chuyển **${amount} ${type === "coin" ? "🪙" : "🎟️"}** cho ${user}

__Lưu ý: nếu lệnh lỗi hãy kiểm tra **${type}** trước khi thử lại!__`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_${sender.id}`)
        .setLabel("Xác nhận")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`cancel_${sender.id}`)
        .setLabel("Hủy")
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await message.reply({
      embeds: [embed],
      components: [row]
    });

    // =========================
    // BUTTON

    const filter = (i) => i.user.id === sender.id;

    const collector = msg.createMessageComponentCollector({
      filter,
      time: 15000
    });

    collector.on("collect", async (interaction) => {

      if (interaction.user.id !== sender.id) {
        return interaction.reply({
          content: "❌ Không phải bạn",
          ephemeral: true
        });
      }

      // =========================
      if (interaction.customId === `confirm_${sender.id}`) {

        // 🔥 FIX QUAN TRỌNG: đảm bảo có key
        if (!coins[sender.id]) coins[sender.id] = 0;
        if (!coins[user.id]) coins[user.id] = 0;

        if (!tickets[sender.id]) tickets[sender.id] = 0;
        if (!tickets[user.id]) tickets[user.id] = 0;

        // =========================

        if (type === "coin") {
          coins[sender.id] -= amount;
          coins[user.id] += amount;

          saveCoins(); // ✅ LƯU
        }

        if (type === "ticket") {
          tickets[sender.id] -= amount;
          tickets[user.id] += amount;

          saveTickets(); // ✅ LƯU
        }

        const successEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setDescription(
`✅ ${sender} đã chuyển **${amount} ${type === "coin" ? "🪙" : "🎟️"}** cho ${user} thành công`
          );

        return interaction.update({
          embeds: [successEmbed],
          components: []
        });
      }

      // =========================
      if (interaction.customId === `cancel_${sender.id}`) {

        const cancelEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setDescription(`❌ ${sender} đã hủy giao dịch`);

        return interaction.update({
          embeds: [cancelEmbed],
          components: []
        });
      }
    });

    // =========================

    collector.on("end", async () => {
      try {
        if (msg.editable) {
          await msg.edit({ components: [] });
        }
      } catch (err) {
        console.log("Collector end edit error:", err.message);
      }
    });
  }
};
