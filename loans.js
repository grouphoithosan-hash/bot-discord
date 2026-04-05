const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

let loans = {};

// =========================
// LOAD DATA
if (fs.existsSync("./loans.json")) {
  loans = JSON.parse(fs.readFileSync("./loans.json"));
}

function saveLoans() {
  fs.writeFileSync("./loans.json", JSON.stringify(loans, null, 2));
}

// =========================
// CONFIG
const MAX_LOAN = 150;
const INTEREST = 1.2;

// =========================

module.exports = {

  // =========================
  // VAY
  borrow(message, args, coins, saveCoins) {
    const userId = message.author.id;
    const amount = parseInt(args[0]);

    if (!amount || amount <= 0) {
      return message.reply("❌ Nhập số coin hợp lệ");
    }

    if (amount > MAX_LOAN) {
      return message.reply("❌ Tối đa 150 coin");
    }

    // 🔒 FIX: còn nợ là không vay được
    if (loans[userId] && loans[userId].pay > 0) {
      return message.reply("❌ Bạn chưa trả hết nợ");
    }

    coins[userId] = (coins[userId] || 0) + amount;
    saveCoins();

    const now = Date.now();
    const due = now + 24 * 60 * 60 * 1000;
    const payAmount = Math.floor(amount * INTEREST);

    loans[userId] = {
      amount,
      pay: payAmount,
      due,
      penalized: false
    };

    saveLoans();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle("💰 VAY THÀNH CÔNG")
      .setDescription(
`✅ Bạn đã vay **${amount} coin**

💰 Đã cộng vào ví  
💸 Phải trả: **${payAmount} coin**  
⏰ Hạn: **24 giờ**`
      );

    return message.reply({ embeds: [embed] });
  },

  // =========================
  // XEM NỢ

  info(message) {
    const userId = message.author.id;

    if (!loans[userId]) {
      return message.reply("❌ Bạn không có khoản nợ");
    }

    const loan = loans[userId];
    const now = Date.now();

    // quá hạn → +10%
    if (now > loan.due && !loan.penalized) {
      const extra = Math.floor(loan.pay * 0.1);
      loan.pay += extra;
      loan.penalized = true;
      saveLoans();
    }

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle("📌 THÔNG TIN NỢ")
      .setDescription(
`💰 Đã vay: **${loan.amount} coin**
💸 Còn phải trả: **${loan.pay} coin**
⏰ Hạn: <t:${Math.floor(loan.due / 1000)}:R>`
      );

    return message.reply({ embeds: [embed] });
  },

  // =========================
  // TRẢ NỢ

  pay(message, args, coins, saveCoins) {
    const userId = message.author.id;
    const loan = loans[userId];

    if (!loan) {
      return message.reply("❌ Bạn không có nợ");
    }

    const now = Date.now();

    // quá hạn → +10%
    if (now > loan.due && !loan.penalized) {
      const extra = Math.floor(loan.pay * 0.1);
      loan.pay += extra;
      loan.penalized = true;
      saveLoans();
    }

    let payAmount;

    if (args[0] === "all") {
      payAmount = loan.pay;
    } else {
      payAmount = parseInt(args[0]);

      if (!payAmount || payAmount <= 0) {
        return message.reply("❌ Số tiền không hợp lệ");
      }
    }

    if ((coins[userId] || 0) < payAmount) {
      return message.reply("❌ Không đủ coin");
    }

    // =========================
    // 🔥 FIX CHÍNH

    if (payAmount >= loan.pay) {
      // trả hết
      coins[userId] -= loan.pay;
      delete loans[userId];

      saveCoins();
      saveLoans();

      return message.reply("✅ Bạn đã trả hết nợ");
    } else {
      // trả một phần
      coins[userId] -= payAmount;
      loan.pay -= payAmount;

      saveCoins();
      saveLoans();

      return message.reply(`💸 Đã trả ${payAmount} coin\n📉 Còn nợ: ${loan.pay} coin`);
    }
  }

};
