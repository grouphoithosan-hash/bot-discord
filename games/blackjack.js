const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// =========================
// RANDOM CARD

function drawCard() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    { name: "A", value: 11 },
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "10", value: 10 },
    { name: "J", value: 10 },
    { name: "Q", value: 10 },
    { name: "K", value: 10 }
  ];

  const card = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];

  return {
    text: `${card.name}${suit}`,
    value: card.value
  };
}

// =========================

function calcTotal(hand) {
  let total = hand.reduce((a, b) => a + b.value, 0);
  let aces = hand.filter(c => c.value === 11).length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

// =========================

function checkSpecial(hand) {
  const total = calcTotal(hand);

  if (hand.length === 2 && total === 21) return "XIBAN";
  if (hand.length === 2 && total === 21) return "XIDACH";
  if (hand.length === 5 && total <= 21) return "NGULINH";

  return null;
}

// =========================

module.exports = {
  execute: async (message, coins, saveCoins) => {

    const userId = message.author.id;
    const bet = parseInt(message.content.split(" ")[1]);

    if (!bet || bet <= 0) {
      return message.reply("❌ Dùng: `.nxidach <coin>`");
    }

    if ((coins[userId] || 0) < bet) {
      return message.reply("❌ Không đủ coin");
    }

    coins[userId] -= bet;

    let player = [];
    let dealer = [];

    let gameState = "🎭 Đang chia bài...";

    const getText = (hand) => hand.map(c => c.text).join(" ");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("hit").setLabel("HIT").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("stand").setLabel("STAND").setStyle(ButtonStyle.Danger)
    );

    // =========================
    // UI RENDER (BOT & PLAYER SÁT NHAU)

    const render = (hideDealer = true, extraState = "") => {
      const pTotal = calcTotal(player);

      return new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`🎰 Xì Dách của ${message.author.username}`)
        .setDescription(
`Bot : ${dealer[0] ? dealer[0].text : ""} ${hideDealer ? "[ ẩn ]" : getText(dealer)}
Player : ${getText(player)} (${pTotal})
Tổng : ${pTotal}
${extraState || gameState}
Cược: ${bet} 🪙`
        );
    };

    // =========================
    // CHIA BÀI

    const msg = await message.reply({ embeds: [render(true)] });

    await new Promise(r => setTimeout(r, 700));
    player.push(drawCard());
    await msg.edit({ embeds: [render(true)] });

    await new Promise(r => setTimeout(r, 700));
    dealer.push(drawCard());
    await msg.edit({ embeds: [render(true)] });

    await new Promise(r => setTimeout(r, 700));
    player.push(drawCard());
    await msg.edit({ embeds: [render(true)] });

    await new Promise(r => setTimeout(r, 700));
    dealer.push(drawCard());

    gameState = "🎮 Đang chơi";

    await msg.edit({
      embeds: [render(true)],
      components: [row]
    });

    // =========================

    const collector = msg.createMessageComponentCollector({
      time: 60000
    });

    let finished = false;

    const dealerPlay = async () => {
      gameState = "🃏 Dealer mở bài";
      await msg.edit({ embeds: [render(false)] });

      await new Promise(r => setTimeout(r, 800));

      while (calcTotal(dealer) < 17) {
        const card = drawCard();
        dealer.push(card);

        gameState = `🔥 Dealer rút ${card.text}`;
        await msg.edit({ embeds: [render(false)] });

        await new Promise(r => setTimeout(r, 900));
      }
    };

    const finishGame = async () => {
      finished = true;

      await dealerPlay();

      const p = calcTotal(player);
      const d = calcTotal(dealer);

      let result = "";
      let win = 0;

      const special = checkSpecial(player);

      if (special === "XIBAN") {
        win = bet * 5;
        result = "🂡 XÌ BÀN (x5)";
      } 
      else if (special === "XIDACH") {
        win = bet * 4;
        result = "🂡 XÌ DÁCH (x4)";
      } 
      else if (special === "NGULINH") {
        win = bet * 3;
        result = "🐉 NGŨ LINH (x3)";
      } 
      else {
        if (p > 21) result = "❌ Thua";
        else if (d > 21 || p > d) {
          win = bet * 2;
          result = "🏆 Thắng";
        } else if (p === d) {
          win = bet;
          result = "🤝 Hòa";
        } else {
          result = "❌ Thua";
        }
      }

      coins[userId] += win;
      saveCoins();

      gameState = "🏁 Kết thúc";

      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(win > bet ? 0x00ff00 : 0xff0000)
            .setTitle(`🏁 KẾT QUẢ - ${message.author.username}`)
            .setDescription(
`Bot : ${getText(dealer)} (${d})
Player : ${getText(player)} (${p})
Tổng : ${p}
${result}
Nhận: ${win} 🪙`
            )
        ],
        components: []
      });
    };

    // =========================

    collector.on("collect", async (interaction) => {

      if (interaction.user.id !== userId) {
        return interaction.reply({ content: "❌ Không phải bạn", ephemeral: true });
      }

      if (interaction.customId === "hit") {
        player.push(drawCard());

        if (calcTotal(player) > 21) {
          collector.stop();
          return finishGame();
        }

        return interaction.update({
          embeds: [render(true)],
          components: [row]
        });
      }

      if (interaction.customId === "stand") {
        collector.stop();
        return finishGame();
      }

    });

    // =========================

    collector.on("end", async () => {
      if (finished) return;

      gameState = "💀 Ván bị hủy do không hành động";

      msg.edit({
        embeds: [render(true, gameState)],
        components: []
      });
    });

  }
};
