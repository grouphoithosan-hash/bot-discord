const fs = require("fs");

let data = fs.existsSync("./userIDs.json")
  ? JSON.parse(fs.readFileSync("./userIDs.json"))
  : {};

const VIP_IDS = ["9999", "8888", "7777", "6666"];

// 🎲 tạo ID random
function generateID() {
  // 5% ra VIP
  if (Math.random() < 0.05) {
    const vip = VIP_IDS[Math.floor(Math.random() * VIP_IDS.length)];
    return "CAPPY-" + vip;
  }

  let num;
  do {
    num = Math.floor(1000 + Math.random() * 9000);
  } while (Object.values(data).includes("CAPPY-" + num));

  return "CAPPY-" + num;
}

// 🔥 lấy hoặc tạo
function getOrCreateID(user) {
  if (!data[user.id]) {
    const newID = generateID();
    data[user.id] = newID;

    fs.writeFileSync("./userIDs.json", JSON.stringify(data, null, 2));

    return { id: newID, isNew: true };
  }

  return { id: data[user.id], isNew: false };
}

module.exports = { getOrCreateID };
