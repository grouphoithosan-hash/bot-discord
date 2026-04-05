const {
Client,
GatewayIntentBits,
Partials,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const fs = require("fs");

// =========================
// IMPORT GAMES
const slotGame = require("./games/slot.js");
const blackjackGame = require("./games/blackjack.js");
const gachaGame = require("./games/gacha.js");
const dailyGame = require("./games/daily.js");

// =========================
// IMPORT COMMANDS
const ntraodoiCommand = require("./commands/ntraodoi.js");

// =========================
// SYSTEMS
const giveaway = require("./giveaway.js");
const banSystem = require("./commands/ban.js");

// =========================
// COMMANDS
const ngiveCommand = require("./commands/ngive.js");
const ncoinCommand = require("./commands/ncoin.js");
const ntopCommand = require("./commands/ntop.js");
const nmeCommand = require("./commands/nme.js");
const nthongbaoCommand = require("./commands/nthongbao.js");

// =========================
// CODE SYSTEM
const ncreatecodeCommand = require("./commands/ncreatecode.js");
const nredeemcodeCommand = require("./commands/nredeemcode.js");

// =========================
// LOAN SYSTEM
const loanSystem = require("./loans.js");

// =========================

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
],
partials: [Partials.Channel]
});

const PREFIX = ".";

// =========================
// DATA

let coins = fs.existsSync("./coins.json") ? JSON.parse(fs.readFileSync("./coins.json")) : {};
let dollars = fs.existsSync("./dollars.json") ? JSON.parse(fs.readFileSync("./dollars.json")) : {};
let tickets = fs.existsSync("./tickets.json") ? JSON.parse(fs.readFileSync("./tickets.json")) : {};

function saveCoins() {
fs.writeFileSync("./coins.json", JSON.stringify(coins, null, 2));
}

function saveDollars() {
fs.writeFileSync("./dollars.json", JSON.stringify(dollars, null, 2));
}

function saveTickets() {
fs.writeFileSync("./tickets.json", JSON.stringify(tickets, null, 2));
}

// =========================

client.on("ready", () => {
console.log(`✅ Bot online: ${client.user.tag}`);
});

// =========================

client.on("messageCreate", async (message) => {
if (message.author.bot) return;
if (!message.content.startsWith(PREFIX)) return;

if (await banSystem.checkBan(message)) return;

const args = message.content.slice(PREFIX.length).trim().split(/ +/);
const cmd = args.shift().toLowerCase();

// BAN
if (cmd === "nban") return banSystem.handleBan(message, args);
if (cmd === "nunban") return banSystem.handleUnban(message, args);

// GAMES
if (cmd === "nslot") return slotGame.execute(message, coins, saveCoins);
if (cmd === "nxidach") return blackjackGame.execute(message, coins, saveCoins, client);
if (cmd === "ngacha") return gachaGame.execute(message, coins, saveCoins, tickets, saveTickets);
if (cmd === "ndaily") return dailyGame.execute(message, coins, saveCoins);

// ECONOMY
if (cmd === "ncoin") return ncoinCommand.execute(message, coins, tickets, dollars);
if (cmd === "ntop") return ntopCommand.execute(message);
if (cmd === "nme") return nmeCommand.execute(message);
if (cmd === "ngive") return ngiveCommand.execute(message, args, coins, tickets, saveCoins, saveTickets);

// CODE
if (cmd === "ncreatecode") return ncreatecodeCommand.execute(message, args);
if (cmd === "nredeemcode") {
return nredeemcodeCommand.execute(message, args, coins, tickets, dollars, saveCoins, saveTickets, saveDollars);
}

// TRAO ĐỔI
if (cmd === "ntraodoi") {
return ntraodoiCommand.execute(message, args, coins, dollars, saveCoins, saveDollars);
}

// LOAN
if (cmd === "nvay") return loanSystem.borrow(message, args, coins, saveCoins);
if (cmd === "nno") return loanSystem.info(message);
if (cmd === "ntrano") return loanSystem.pay(message, args, coins, saveCoins);

// GIVEAWAY
if (cmd === "ngiveaway") {
const time = args[args.length - 1];
const prize = args.slice(0, -1).join(" ");
if (!time || !prize) return message.reply("❌ Sai cú pháp");
return giveaway.createGiveaway(message, prize, time);
}

// =========================
// THÔNG BÁO
if (cmd === "nthongbao") {
return nthongbaoCommand.execute(message, args);
}

// =========================
// HELP
if (cmd === "helps") {
const embed = new EmbedBuilder()
.setColor(0x57F287)
.setTitle("✨ CAPPY BOT COMMANDS")
.setDescription("📌 Danh sách lệnh")
.addFields(
{ name: "💰 Economy", value: ".ncoin\n.ngive\n.ndaily\n.ntop\n.nme" },
{ name: "🎮 Games", value: ".nslot\n.nxidach\n.ngacha" },
{ name: "💸 Loan", value: ".nvay\n.nno\n.ntrano" }
);

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("appeal")
.setLabel("📩 Kháng cáo")
.setStyle(ButtonStyle.Primary)
);

return message.reply({ embeds: [embed], components: [row] });
}

});

// =========================

client.login(process.env.TOKEN);

