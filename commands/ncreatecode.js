const fs = require("fs");

// 🔒 ID của bạn
const OWNER_ID = "1441657956037820577";

// load codes
let codes = {};
if (fs.existsSync("./codes.json")) {
codes = JSON.parse(fs.readFileSync("./codes.json"));
}

function saveCodes() {
fs.writeFileSync("./codes.json", JSON.stringify(codes, null, 2));
}

// ⏳ parse thời gian
function parseDuration(str) {
if (!str) return null;

let match = str.match(/(\d+)([hmd])/);
if (!match) return null;

let num = parseInt(match[1]);
let type = match[2];

if (type === "h") return num * 60 * 60 * 1000;
if (type === "m") return num * 60 * 1000;
if (type === "d") return num * 24 * 60 * 60 * 1000;

return null;
}

module.exports = {
name: "ncreatecode",

execute(message, args) {

// 🔒 check owner
if (message.author.id !== OWNER_ID) {
return message.reply("❌ Bạn không có quyền!");
}

const code = args[0];
const cAmount = parseInt(args[1]); // 1c
const tAmount = parseInt(args[2]); // 1t
const dAmount = parseInt(args[3]); // 1d
const durationStr = args[4];

if (!code || isNaN(cAmount) || isNaN(tAmount) || isNaN(dAmount) || !durationStr) {
return message.reply(
"❌ Cú pháp:\n.ncreatecode <code> <1c> <1t> <1d> <time>\nVí dụ:\n.ncreatecode FREE 100 10 5 24h"
);
}

const duration = parseDuration(durationStr);
if (!duration) {
return message.reply("❌ Thời gian sai! (vd: 1h, 30m, 2d)");
}

// lưu code
codes[code] = {
coins: cAmount,
tickets: tAmount,
dollars: dAmount,
expireAt: Date.now() + duration
};

saveCodes();

return message.reply(
`✅ Tạo code thành công!\n🔑 ${code}\n🪙 ${cAmount} coins\n🎟 ${tAmount} tickets\n💲 ${dAmount} dollars\n⏳ Hết hạn: ${durationStr}`
);
}
};
