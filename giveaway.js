const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

let activeGiveaways = [];

// Parse thời gian: 1m / 1h / 1d
function parseTime(input) {
  if (typeof input !== "string") return 0;

  const match = input.match(/^(\d+)([mhd])$/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  if (unit === "d") return value * 24 * 60 * 60 * 1000;

  return 0;
}

// Tạo giveaway
async function createGiveaway(message, time, prizeText) {
  const duration = parseTime(time);

  if (!duration) {
    return message.reply("❌ Sai định dạng thời gian (vd: 1m, 1h, 1d)");
  }

  const endTime = Date.now() + duration;

  const embed = new EmbedBuilder()
    .setColor(0x8B5A2B)
    .setTitle("🎉 Giveaway Cappy Zone")
    .setDescription(
`🎁 **Phần thưởng:** ${prizeText}

👥 **Người tham gia:** 0

⏰ **Thời gian:** ${time}
👤 **Tạo bởi:** <@${message.author.id}>

🕒 **Kết thúc lúc:** <t:${Math.floor(endTime / 1000)}:F>`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("join_giveaway")
      .setLabel("🎉 Tham gia")
      .setStyle(ButtonStyle.Success)
  );

  const msg = await message.channel.send({
    embeds: [embed],
    components: [row]
  });

  activeGiveaways.push({
    messageId: msg.id,
    channelId: message.channel.id,
    participants: [],
    endTime,
    prize: prizeText,
    host: message.author.id
  });

  setTimeout(() => endGiveaway(message.client, msg.id), duration);
}

// Xử lý tham gia
async function handleJoin(interaction) {
  const gw = activeGiveaways.find(g => g.messageId === interaction.message.id);
  if (!gw) return;

  if (gw.participants.includes(interaction.user.id)) {
    return interaction.reply({
      content: "❌ Bạn đã tham gia rồi!",
      ephemeral: true
    });
  }

  gw.participants.push(interaction.user.id);

  // update embed số người tham gia
  const channel = await interaction.client.channels.fetch(gw.channelId);
  const msg = await channel.messages.fetch(gw.messageId);

  const embed = EmbedBuilder.from(msg.embeds[0]).setDescription(
`🎁 **Phần thưởng:** ${gw.prize}

👥 **Người tham gia:** ${gw.participants.length}

⏰ **Thời gian:** ⏳
👤 **Tạo bởi:** <@${gw.host}>

🕒 **Kết thúc lúc:** <t:${Math.floor(gw.endTime / 1000)}:F>`
  );

  await msg.edit({ embeds: [embed] });

  return interaction.reply({
    content: "✅ Đã tham gia giveaway!",
    ephemeral: true
  });
}

// Kết thúc giveaway
async function endGiveaway(client, messageId) {
  const gw = activeGiveaways.find(g => g.messageId === messageId);
  if (!gw) return;

  const channel = await client.channels.fetch(gw.channelId);
  const msg = await channel.messages.fetch(messageId);

  let winnerText = "Không có người tham gia";

  if (gw.participants.length > 0) {
    const winner = gw.participants[Math.floor(Math.random() * gw.participants.length)];
    winnerText = `<@${winner}>`;
  }

  const embed = new EmbedBuilder()
    .setColor(0x8B5A2B)
    .setTitle("🎉 Giveaway ENDED")
    .setDescription(
`🎁 **Phần thưởng:** ${gw.prize}

🏆 **Người thắng:** ${winnerText}
👤 **Tạo bởi:** <@${gw.host}>

✅ Giveaway đã kết thúc`
    );

  await msg.edit({
    embeds: [embed],
    components: []
  });

  activeGiveaways = activeGiveaways.filter(g => g.messageId !== messageId);
}

module.exports = {
  createGiveaway,
  handleJoin
};
