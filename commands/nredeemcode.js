const fs = require("fs");

module.exports = {
execute(message, args, coins, tickets, dollars, saveCoins, saveTickets, saveDollars) {

const code = args[0];
if (!code) return message.reply("❌ Nhập code!");

let codes = {};
if (fs.existsSync("./codes.json")) {
codes = JSON.parse(fs.readFileSync("./codes.json"));
}

if (!codes[code]) {
return message.reply("❌ Code không hợp lệ!");
}

const data = codes[code];

// check expire
if (data.expireAt && Date.now() > data.expireAt) {
return message.reply("⏳ Code đã hết hạn!");
}

// check used
let used = {};
if (fs.existsSync("./usedCodes.json")) {
used = JSON.parse(fs.readFileSync("./usedCodes.json"));
}

if (used[code]) {
return message.reply("❌ Code đã được sử dụng!");
}

// nhận thưởng
const userId = message.author.id;

coins[userId] = (coins[userId] || 0) + (data.coins || 0);
tickets[userId] = (tickets[userId] || 0) + (data.tickets || 0);
dollars[userId] = (dollars[userId] || 0) + (data.dollars || 0);

saveCoins();
saveTickets();
saveDollars();

// mark used
used[code] = true;
fs.writeFileSync("./usedCodes.json", JSON.stringify(used, null, 2));

// embed
const embed = {
color: 0x57F287,
title: "🎉 CONGRATULATIONS YOU UNBOX",
description: `Bạn đã nhập code thành công và nhận được:\n\n🪙 ${data.coins} coins\n🎟 ${data.tickets} tickets\n💲 ${data.dollars} dollars`
};

return message.reply({ embeds: [embed] });
}
};
