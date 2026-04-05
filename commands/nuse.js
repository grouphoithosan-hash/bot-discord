const fs = require("fs");

module.exports = {
  name: "nuse",

  async execute(message, args) {

    let inventory = fs.existsSync("./inventory.json")
      ? JSON.parse(fs.readFileSync("./inventory.json"))
      : {};

    const userId = message.author.id;

    if (!inventory[userId] || inventory[userId].length === 0) {
      return message.reply("❌ Bạn chưa có vật phẩm");
    }

    const index = parseInt(args[0]);

    if (!index || index <= 0 || index > inventory[userId].length) {
      return message.reply("❌ STT không hợp lệ");
    }

    const item = inventory[userId][index - 1];

    // 🔥 XÓA ITEM
    inventory[userId].splice(index - 1, 1);

    fs.writeFileSync("./inventory.json", JSON.stringify(inventory, null, 2));

    // =========================

    if (item.type === "ticket") {
      let tickets = fs.existsSync("./tickets.json")
        ? JSON.parse(fs.readFileSync("./tickets.json"))
        : {};

      tickets[userId] = (tickets[userId] || 0) + 1;

      fs.writeFileSync("./tickets.json", JSON.stringify(tickets, null, 2));

      return message.reply("🎟️ +1 Ticket");
    }

    if (item.type === "fake") {
      return message.reply("🍀 +5% may mắn (chỉ hiệu ứng)");
    }

    return message.reply("❌ Item lỗi");
  }
};
