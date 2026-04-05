const fs = require("fs");

// =========================
// LOAD DATA
let shop = fs.existsSync("./shop.json")
  ? JSON.parse(fs.readFileSync("./shop.json"))
  : { lastReset: Date.now(), item: null };

let inventory = fs.existsSync("./inventory.json")
  ? JSON.parse(fs.readFileSync("./inventory.json"))
  : {};

let shopUsers = fs.existsSync("./shop_users.json")
  ? JSON.parse(fs.readFileSync("./shop_users.json"))
  : {};

// =========================
// SAVE FUNCTIONS
function saveInventory() {
  fs.writeFileSync("./inventory.json", JSON.stringify(inventory, null, 2));
}

function saveShopUsers() {
  fs.writeFileSync("./shop_users.json", JSON.stringify(shopUsers, null, 2));
}

function saveShop() {
  fs.writeFileSync("./shop.json", JSON.stringify(shop, null, 2));
}

// =========================
// ANTI-SPAM LOCK
const cooldown = new Set();

// =========================

module.exports = {
name: "nbuy",

async execute(message, args, coins, dollars, saveCoins, saveDollars) {

const userId = message.author.id;

// =========================
// LOCK SPAM
if (cooldown.has(userId)) {
return message.reply("⏳ Đang xử lý, vui lòng chờ...");
}
cooldown.add(userId);
setTimeout(() => cooldown.delete(userId), 3000);

// =========================
// RESET SHOP AUTO
const RESET_TIME = 3600000; // 1h

if (!shop.lastReset) shop.lastReset = Date.now();

if (Date.now() - shop.lastReset >= RESET_TIME) {
shopUsers = {};
shop.lastReset = Date.now();

saveShopUsers();
saveShop();
}

// =========================
// CHECK INPUT
const choice = parseInt(args[0]);
if (!choice) return message.reply("❌ .nbuy <1 hoặc 2>");

// =========================
// CHECK ĐÃ MUA CHƯA
if (shopUsers[userId]) {
return message.reply("❌ Bạn đã mua trong shop này rồi! ⏱");
}

// =========================
// FREE ITEM
if (choice === 1) {

const reward = Math.floor(Math.random() * 50) + 1;

// cộng coin
coins[userId] = (coins[userId] || 0) + reward;
saveCoins();

// mark đã mua
shopUsers[userId] = true;
saveShopUsers();

return message.reply(`🎁 Bạn nhận ${reward} 🪙`);
}

// =========================
// ITEM PAY
if (choice === 2) {

const item = shop.item;

if (!item) {
return message.reply("❌ Shop chưa có item");
}

// check tiền
if ((dollars[userId] || 0) < item.price) {
return message.reply("❌ Không đủ 💲");
}

// TRỪ TIỀN
dollars[userId] -= item.price;
saveDollars();

// ADD INVENTORY
if (!inventory[userId]) inventory[userId] = [];
inventory[userId].push({
name: item.name,
price: item.price,
time: Date.now()
});
saveInventory();

// mark đã mua
shopUsers[userId] = true;
saveShopUsers();

return message.reply(`✅ Đã mua: ${item.name}`);
}

}
};



