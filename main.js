console.warn('[Load Indicator] main.js loaded');

// Global Scope
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const questMessage = document.getElementById("questMessage");
const versionIndicator = document.getElementById('ver');
const title = document.getElementById('title');
const questList = document.getElementById("questList");
const botVersion = '1.16.0';
let quizMode = false;
let currentQuestion = {};
let correctAnswers = 0;
const achievements = [];
let afkTimer = null;
let isAfk = false;
let userName = localStorage.getItem('userName') || '';
let tag = localStorage.getItem('tag') || '';
const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let pets = JSON.parse(localStorage.getItem('pets')) || [];
const quests = JSON.parse(localStorage.getItem('quests')) || [];

versionIndicator.innerHTML = `V${botVersion}`;
title.innerHTML = `DJMoonZHX72 - Legendary Bot ${botVersion}`

// Function
function showQuestProgress() {
    if (quests.length === 0) {
        return "Anda belum mengambil quest.";
    }

    return quests.map(q => {
        const progressList = q.objectives.map(obj => {
            const progress = q.progress[obj.item || obj.action] || 0;
            return `- ${obj.item || obj.action}: ${progress}/${obj.required}`;
        }).join("\n");

        return `📜 **${q.name}**\n${q.description}\n🎯 Progres:\n${progressList}\n`;
    }).join("\n");
}

function displayQuests() {
    const quests = [
        {
            name: "Gathering Resources",
            description: "Kumpulkan berbagai sumber daya untuk memenuhi kebutuhan crafting.",
            objectives: [
                { item: "Wood", required: 10 },
                { item: "Stone", required: 5 },
                { item: "Iron", required: 3 }
            ],
            rewards: [
                { item: "Money", amount: 100 },
                { item: "Iron Pickaxe", amount: 1 }
            ]
        },
        {
            name: "Pet Adventure",
            description: "Biarkan pet-mu membantu dalam petualangan!",
            objectives: [
                { action: "adoptPet", required: 1 },
                { action: "petFindItem", required: 3 }
            ],
            rewards: [
                { item: "Money", amount: 150 },
                { item: "Emerald", amount: 1 }
            ]
        }
    ];

    return quests;
}

function showQuests() {
    const availableQuests = displayQuests();
    
    const formattedQuests = availableQuests.map(q => 
        `📜--${q.name }-- \n ${q.description }\n Objectives: \n ${q.objectives.map(obj => `- ${obj.item || obj.action}: ${obj.required}`).join("\n")}\n🏆 Rewards:\n${q.rewards.map(reward => `- ${reward.item}: ${reward.amount}`).join("\n")}`
    ).join("\n\n");

    return `${formattedQuests}`;
}

function updateQuestProgress(action, itemName, amount = 1) {
    let progressMessage = "";
    
    quests.forEach(quest => {
        quest.objectives.forEach(obj => {
            if ((obj.item && obj.item === itemName) || (obj.action && obj.action === action)) {
                quest.progress[obj.item || obj.action] = (quest.progress[obj.item || obj.action] || 0) + amount;
            }
        });
        
        if (isQuestComplete(quest)) {
            let completionMessage = completeQuest(quest);
            progressMessage += completionMessage + "\n";
        }
    });
    
    localStorage.setItem('quests', JSON.stringify(quests));
    getQuestProgress();
    
    if (progressMessage) {
        sendMessage(progressMessage);
    }
    
    return progressMessage || "Tidak ada progres yang diperbarui.";
}

function takeQuest(questName) {
    const availableQuests = displayQuests();
    const quest = availableQuests.find(q => q.name.toLowerCase() === questName.toLowerCase());
    
    if (!quest) return "Quest tidak ditemukan!";
    
    if (quests.find(q => q.name === quest.name)) return "Anda sudah mengambil quest ini!";
    
    quests.push({ ...quest, progress: {} });
    localStorage.setItem('quests', JSON.stringify(quests));
    getQuestProgress();
    
    return `Anda telah mengambil quest: ${quest.name}!`;
}

function isQuestComplete(quest) {
    return quest.objectives.every(obj => (quest.progress[obj.item || obj.action] || 0) >= obj.required);
}

function showCompletionMessage(message) {
    if (!questMessage) return;

    questMessage.textContent = message;
    questMessage.style.display = "block";

    setTimeout(() => {
        questMessage.style.display = "none";
    }, 3000);
}

function completeQuest(quest) {
    let rewardText = `Selamat! Anda menyelesaikan quest "${quest.name}" dan mendapatkan hadiah:\n`;
    
    if (!quest.rewards || quest.rewards.length === 0) {
        rewardText += "(Tidak ada reward 😢)";
    } else {
        quest.rewards.forEach(reward => {
            addStackableItem(reward.item, reward.amount);
            rewardText += `- ${reward.item}: ${reward.amount}\n`;
        });
    }
    
    showCompletionMessage(rewardText)
    
    quests.splice(quests.indexOf(quest), 1);
    localStorage.setItem('quests', JSON.stringify(quests));
    
    return rewardText;
}

function getQuestProgress() {
    if (quests.length === 0) {
        questList.innerHTML = "Belum ada quest yang diambil.";
        return;
    }

    let questText = quests.map(q => {
        const progressList = q.objectives.map(obj => {
            const progress = q.progress[obj.item || obj.action] || 0;
            return `- ${obj.item || obj.action}: ${progress}/${obj.required}`;
        }).join("<br>");

        return `<b>${q.name}</b><br>${q.description}<br>🎯 Progress:<br>${progressList}<br>`;
    }).join("<br>");

    questList.innerHTML = questText;
}

function formatItemName(itemName) {
    return itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
}

function sellItem(itemName, amount) {
    const sellPrices = {
        "Wood": 25,
        "Stick": 10,
        "Stone": 45,
        "Iron": 140,
        "Gold": 250,
        "Emerald": 1450,
        "Diamond": 2500,
        "Netherite": 25000,
        "Silver": 190,
        "Coal": 60,
        "Copper": 100,
        "Amethyst": 725,
        "Quartz": 340
    };
    
    itemName = formatItemName(itemName);
    
    const invItem = inventory.find(i => i.name === itemName);
    if (!invItem || invItem.count < amount) {
        return `Anda tidak memiliki cukup ${itemName} untuk dijual!`;
    }
    
    if (!sellPrices[itemName]) {
        return `Item ${itemName} tidak bisa dijual!`;
    }
    
    const totalSellPrice = sellPrices[itemName] * amount;
    
    removeItem(itemName, amount);
    
    addStackableItem("Money", totalSellPrice);
    
    return `Anda menjual ${amount} ${itemName} dan mendapatkan ${totalSellPrice} Money!`;
}

function buyItem(itemName, amount) {
    const shopItems = [
        { name: 'Wood', price: 35 },
        { name: 'Stick', price: 20 },
        { name: 'Stone', price: 55 },
        { name: 'Iron', price: 150 },
        { name: 'Gold', price: 300 },
        { name: 'Emerald', price: 1500 },
        { name: 'Diamond', price: 3000 },
        { name: 'Netherite', price: 15000 },
        { name: 'Silver', price: 200 },
        { name: 'Coal', price: 80 },
        { name: 'Copper', price: 150 },
        { name: 'Amethyst', price: 750 },
        { name: 'Quartz', price: 375 }
    ];
    
    itemName = formatItemName(itemName);
    
    const selectedItem = shopItems.find(i => i.name === itemName);
    if (!selectedItem) return `Item ${itemName} tidak tersedia untuk dibeli!`;
    
    const totalPrice = selectedItem.price * amount;
    const moneyItem = inventory.find(i => i.name === 'Money');
    
    if (!moneyItem || moneyItem.count < totalPrice) {
        return `Anda tidak memiliki cukup Money untuk membeli ${amount} ${itemName}!`;
    }
    
    removeItem('Money', totalPrice);
    
    addStackableItem(itemName, amount);
    
    return `Anda membeli ${amount} ${itemName} seharga ${totalPrice} Money!`;
}

function adoptPet(petName, petType) {
    const validPets = ['dog', 'cat', 'fox'];
    if (!validPets.includes(petType)) {
        return 'Jenis pet tidak valid!';
    }
    
    const emeraldIndex = inventory.findIndex(item =>
        item && item.name === 'Emerald' && Number(item.count) >= 3
    );

    if (emeraldIndex !== -1) {
        inventory[emeraldIndex].count -= 3;
        
        if (inventory[emeraldIndex].count === 0) {
            inventory.splice(emeraldIndex, 1);
        }
        
        pets.push({ name: petName, type: petType, level: 1, exp: 0 });
        
        updateQuestProgress("adoptPet", null, 1);
        
        localStorage.setItem('pets', JSON.stringify(pets));
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return `Anda mengadopsi pet ${petType} bernama ${petName}!`;
    } else {
        return 'Anda tidak memiliki cukup Emerald untuk mengadopsi pet!';
    }
}

function getPetChance(pet) {
    const baseChances = {
        dog: 20,
        cat: 20,
        fox: 20,
    };

    if (!baseChances[pet.type]) return 0;

    let chance = baseChances[pet.type] + (pet.level - 1);
    return Math.min(chance, 50);
}

function getPetBonus(resource) {
    let bonus = '';
    pets.forEach(pet => {
        const expRequired = pet.level * 25;
        let gainedExp = 0;
        const petChance = getPetChance(pet) / 100;

        if (pet.type === 'dog' && Math.random() < petChance) {
            addStackableItem(resource, 1);
            gainedExp = 1;
            updateQuestProgress("petFindItem", null, 1);
            bonus += `Pet ${pet.name} (🐶 Dog) menemukan ${resource} lainnya! `;
        }

        if (pet.type === 'cat' && Math.random() < petChance) {
            const findChance = Math.random() * 100;
            let foundItem = 'Emerald';
            if (findChance > 70) foundItem = 'Diamond';
            if (findChance > 99) foundItem = 'Netherite';
            addStackableItem(foundItem, 1);
            gainedExp = 1;
            updateQuestProgress("petFindItem", null, 1);
            bonus += `Pet ${pet.name} ( 🐱 Cat) menemukan ${foundItem}! `;
        }

        if (pet.type === 'fox' && Math.random() < petChance) {
            const randomItems = ['Gold', 'Iron', 'Coal'];
            const foundItem = randomItems[Math.floor(Math.random() * randomItems.length)];
            addStackableItem(foundItem, 1);
            gainedExp = 1;
            updateQuestProgress("petFindItem", null, 1);
            bonus += `Pet ${pet.name} (🦊 Fox) menemukan ${foundItem}! `;
        }

        pet.exp += gainedExp;
        if (pet.exp >= expRequired) {
            pet.level++;
            pet.exp = 0;
            bonus += `Pet ${pet.name} naik ke level ${pet.level}!`;
        }
    });

    localStorage.setItem('pets', JSON.stringify(pets));
    return bonus;
}

function displayPets() {
    if (pets.length === 0) {
        return 'Anda belum meliliki pet.'
    }
    return pets.map(pet => `Nama: ${pet.name}, Jenis: ${pet.type}, Level: ${pet.level}, Exp: ${pet.exp}`).join(`\n`);
}

function chopTree() {
    const chance = Math.floor(Math.random() * 2) + 1;
    let item = chance === 1 ? 'Wood' : 'Stick';
    
    addStackableItem(item, 1);
    
    updateQuestProgress("chopTree", item);
    
    return `Anda mendapatkan ${item}!`;
}

function getItem(itemName) {
    return inventory.find(item => item.name === itemName) || null;
}

function mineResources() {
    const pickaxes = ['Netherite Pickaxe', 'Diamond Pickaxe', 'Gold Pickaxe', 'Iron Pickaxe', 'Stone Pickaxe', 'Wooden Pickaxe'];
    const pickaxe = inventory.find(item => pickaxes.includes(item.name));
    
    if (!pickaxe) {
        return 'Anda tidak memiliki Pickaxe! Craft satu terlebih dahulu.';
    }
    
    pickaxe.durability--;
    if (pickaxe.durability <= 0) {
        inventory.splice(inventory.indexOf(pickaxe), 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return 'Pickaxe Anda telah hancur! Anda perlu membuat yang baru.';
    }
    
    const resources = [
        { name: 'Stone', chance: 49.9 },
        { name: 'Coal', chance: 14.5 },
        { name: 'Silver', chance: 6.5 },
        { name: 'Iron', chance: 7.5 },
        { name: 'Copper', chance: 9 },
        { name: 'Gold', chance: 5 },
        { name: 'Amethyst', chance: 2 },
        { name: 'Quartz', chance: 4 },
        { name: 'Emerald', chance: 1 },
        { name: 'Diamond', chance: 0.5 },
        { name: 'Netherite', chance: 0.1 }
    ];
    
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let foundResource = '';
    
    for (let resource of resources) {
        cumulativeChance += resource.chance;
        if (roll <= cumulativeChance) {
            addStackableItem(resource.name, 1);
            foundResource = resource.name;
            updateQuestProgress("mine", foundResource);
            break;
        }
    }
    
    const petBonus = getPetBonus(foundResource);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    return `Anda mendapatkan ${foundResource}! ${petBonus}(Durability Pickaxe: ${pickaxe.durability})`;
}


function addStackableItem(item, amount) {
    const existingItem = inventory.find(i => i.name === item);
    if (existingItem) {
        existingItem.count += amount;
    } else {
        inventory.push({ name: item, count: amount });
    }
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function removeItem(item, amount) {
    const existingItem = inventory.find(i => i.name === item);
    if (existingItem && existingItem.count >= amount) {
        existingItem.count -= amount;
        if (existingItem.count === 0) {
            inventory.splice(inventory.indexOf(existingItem), 1);
        }
        localStorage.setItem('inventory', JSON.stringify(inventory));
    } else {
        return;
    }
}

function displayInventory() {
    if (inventory.length === 0) {
        return 'Inventori Anda kosong.';
    }
    return 'Inventori Anda:\n' +
        inventory.map(i => `${i.name} x${i.count}`).join('\n');
}

function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

document.addEventListener('DOMContentLoaded', () => {
    getQuestProgress();
    startAfkTimer();
    if (!userName) {
        userName = prompt('Halo! Siapa nama Anda?');
        if (userName) {
            localStorage.setItem('userName', userName);
            displayMessage(`Bot: Selamat datang, ${userName}! Senang bertemu dengan Anda.`);
        }
    } else {
        displayMessage(`Bot: Selamat datang kembali, ${userName}!`);
    }
    const storedAchievements = localStorage.getItem('achievements');
    if (storedAchievements) {
        achievements.push(...JSON.parse(storedAchievements));
    }
});

const questions = [
    { question: "Apa ibu kota Indonesia?", answer: "jakarta" },
    { question: "30×34 berapa?", answer: "1020" },
    { question: "Siapa penemu bola lampu?", answer: "thomas alva edison" },
    { question: "Hewan tercepat di dunia?", answer: "cheetah" },
    { question: "Apa nama planet terbesar di tata surya?", answer: "yupiter" },
    { question: "Berapa jumlah pulau yang ada di Indonesia? A:10.000 B: 13.000 C:17.000 D:20.000", answer: "c" },
    { question: 'Siapa yang menulis novel "Laskar Pelangi"?', answer: "andrea hirata" },
    { question: "Apa simbol kimia untuk air?", answer: "h2o" },
    { question: "Siapa presiden pertama Indonesia?", answer: "soekarno" },
    { question: "Apa nama gunung tertinggi di dunia?", answer: "everest" },
    { question: "1 Dekade = berapa tahun?", answer: "10" },
    { question: "Apa ibukota Jepang?", answer: "tokyo" },
    { question: "Tahun berapa perang dunia II berakhir?", answer: "1945" },
    { question: "Negara terbesar di dunia berdasarkan luas wilayah adalah?", answer: "rusia" },
    { question: "Jika sebuah segitiga memiliki sisi 3 cm, 4 cm, dan 5 cm, maka jenis segitiga ini adalah?", answer: "segitiga siku-siku" },
    { question: "Apa nama proses tumbuhan membuat makanan sendiri?", answer: "fotosintesis" },
    { question: "Hewan apa yang dikenal sebagai mamalia terbesar di dunia?", answer: "paus biru" },
    { question: "Apa yang bisa dipatahkan, tapi tak pernah dipegang?", answer: "janji" },
    { question: "Apa yang naik, tapi tidak pernah turun?", answer: "umur" }
];

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
    resetAfkTimer();
    const userMessage = userInput.value;
    if (userMessage.trim() === '') return;

    displayMessage(`${userName}: ${userMessage}`);
    userInput.value = '';

    let botResponse;
    if (quizMode) {
        botResponse = checkQuizAnswer(userMessage);
    } else {
        botResponse = getBotResponse(userMessage);
    }

    displayMessage(`Bot: ${botResponse}`);
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('fade-in');
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function getBotResponse(message) {
    message = message.toLowerCase();
    const args = message.split(' ');
    
    if (message === 'secret') {
      if (!achievements.includes('Find The Secret')) {
        achievements.push('Find The Secret')
        saveAchievements();
        return '1000000 100 1000000. Selamat! Anda Mendapatkan Achievement: Find The Secret'
      } else {
        return 'GET OUT!'
      }
    }

    if (message === 'halo') {
        return `Halo, ${userName}! Bagaimana saya bisa membantu Anda?`;
    } else if (message === 'ganti nama') {
        userName = prompt('Masukkan nama baru Anda:');
        if (userName) {
            localStorage.setItem('userName', userName);
            return `Nama Anda berhasil diubah menjadi ${userName}!`;
        } else {
            return 'Nama tidak diubah.';
        }
    } else if (message === 'inv') {
        return displayInventory();
    } else if (message === 'mine') {
        return mineResources();
    } else if (message.includes('calc')) {
        const expression = message.replace('calc ', '');
        return calculate(expression);
    } else if (message === 'quiz') {
        return startQuiz();
    } else if (message === 'menu') {
        return 'Command: rank, weapon list (common/uncommon/rare/legendary/mythic/celestial), rules, admin slot, info server, info bot, changelog, support, quiz, calc, achievement, ganti nama, info achievement, inv, mine, craft (wooden pickaxe/stone pickaxe/iron pickaxe/gold pickaxe/diamond pickaxe/netherite pickaxe), chop a tree, adopt [nama_pet] [jenis_pet], my pets, buy [nama_item] [jumlah], sell [nama_item] [jumlah], quests, take quest [nama_quest], my quests, quest progress, clear chat';
    } else if (message === 'achievement') {
        return displayAchievements();
    } else if (message === 'rank') {
        return 'VIP: Harga, MVP: Harga, LEGEND: Harga, MYTHIC: Harga, LUXURY: Harga, HYPER: Harga';
    } else if (message === 'weapon list common') {
        return 'Common: Wooden Sword, Golden Sword, Stone Sword, Iron Sword, Bow, Crossbow, Copper Sword.';
    } else if (message === 'weapon list uncommon') {
        return 'Uncommon: Diamond Sword, Netherite Sword, Assassin Blade, Breeze Wand, Claw, Exposed Copper Sword, Weathered Copper Sword, Dagger, Double Axe, Firework Sword, Jester Cane, Magic Wand, Spear.';
    } else if (message === 'weapon list rare') {
        return 'Rare: Battle Axe, Club, Oxidized Copper Sword, End Wand, Frostbite, Gem Crusher, Goat Hammer, Golden Trident, Great Hammer, Halbert, Healing Wand, Katana, Lucky Sword, Phantom Blade, Scimitar, Scythe, Sickle, Spider Sword, Venomstrike, Villager Claymore, Wither Sword, Wolf Glaive.';
    } else if (message === 'weapon list legendary') {
        return 'Legendary: Mace, Dragonfang, Fire Armblade, Flamebrand, Ham Bat, Lance, Lightsaber, Obsidian Sword, Vampire Sword, Warhammer.';
    } else if (message === 'weapon list mythic') {
        return 'Mythic: God of The Death Axe, Fenuzdonoa Sword, Elheim Trident, Dual Ender Blade, Flamescion Blade, Frost Slayer.';
    } else if (message === 'weapon list celestial') {
        return 'Celestial: Voidblade💀, Flame Bow, Doombringer Axe, Dark Blade.'
    } else if (message === 'rules') {
        return 'Rules: No Spam, No Promosi Apapun, No X-ray, No Cheat, No Homo, No Glitch';
    } else if (message === 'weapon list') {
        return 'Gunakan weapon list (common/uncommon/rare/legendary/mythic/celestial)!';
    } else if (message === 'admin slot') {
        return 'Slot Admin Sisa 9';
    } else if (message === 'info server') {
        return 'Server: Legendary Elden Craft, Dibuat pada tanggal __/__/____, Pembuat Server: Rizkiwibu9696';
    } else if (message === 'info bot') {
        return `Nama Bot: Legendary Bot, Dibuat Oleh CO-OWNER Legendary Craft (DJMoonZHX72), Versi Bot: ${botVersion}`;
    } else if (message === 'changelog') {
        return '1.0.0: created bot, 1.1.0: added player info, menu, & rank, 1.2.0: added weapon list, rules, admin slot, info server, & info bot, 1.2.1: added changelog, & support, 1.4.0: added calculator, 1.5.0: added achievement, 1.5.1: updated achievement & quiz, 1.6.0: added name, 1.6.1: bugfix, 1.7.0: Updated Weapon List, 1.8.0: Updated Achievement System, 1.9.0: added leaderboard, 1.9.1: Fixed Quiz Bug & added fade animation, 1.10.0: Added Inventory, 1.11.0: added mine, 1.12.0: updated send button design, 1.13.0: bugfix and add crafting tools, 1.13.1: bugfix, 1.14.0: added pets, 1.15.1: shop, style update, & removed leaderboard, 1.16.0: added quest, code efficiency';
    } else if (message === 'support') {
        return 'DJMoonZHX72: https://youtube.com/@DJMoonZHX72  https://www.instagram.com/djmoonzhx72/profilecard/?igsh=MXhhczVneWtld3RpdQ==  https://whatsapp.com/channel/0029VarfkCz9mrGkIcsHrW1D https://github.com/DJMoonZHX72 Rizkiwibu9696: https://whatsapp.com/channel/0029Var7OtgGzzKU3Qeq5s09 https://www.instagram.com/ikikidal_03/profilecard/?igsh=dnVnMW5zOXo3dTFo , Legendary Craft: https://whatsapp.com/channel/0029VakZDNU9Gv7TRP0TH53K';
    } else if (message === 'info achievement') {
        return 'info: Beginner: 5 jawaban benar di quiz. Expert: 20 jawaban benar di quiz. Advanced: 40 jawaban benar di quiz. Pro: 60 jawaban benar di quiz. Elite: 80 jawaban benar di quiz. God: 100 jawaban benar di quiz. Find The Secret: Temukan Rahasia. AFK?: diam di chatbot ini tanpa melakukan apapun selama 1 jam 🗿, Diamonds?: Dapatkan diamond';
    } else if (message === 'anothersecret?') {
        return addStackableItem('Secret Coin', 1);
    } else if (message === 'chop a tree') {
        return chopTree()
    } else if (message === 'craft wooden pickaxe') {
        return craftTools('Wooden Pickaxe');
    } else if (message === 'craft stone pickaxe') {
        return craftTools('Stone Pickaxe');
    } else if (message === 'craft iron pickaxe') {
        return craftTools('Iron Pickaxe');
    } else if (message === 'craft gold pickaxe') {
        return craftTools('Gold Pickaxe');
    } else if (message === 'craft diamond pickaxe') {
        return craftTools('Diamond Pickaxe');
    } else if (message === 'craft netherite pickaxe') {
        return craftTools('Netherite Pickaxe');
    } else if (message === '⎙') {
        return getTag();
    } else if (message === '自動マイニング') {
        return autoMine()
    } else if (message.startsWith('adopt ')) {
        if (args.length === 3) {
            return adoptPet(args[1], args[2]);
        }
        return 'Format perintah salah! Gunakan: adopt [nama_pet] [jenis_pet]'
    } else if (message === 'my pets') {
        return displayPets();
    } else if (message.startsWith('ゴッドモード ')) {
        if (args.length === 3) {
            return godMode(args[1], args[2]);
        }
    } else if (message.startsWith('ペットのレベルアップ ')) {
        if (args.length === 2) {
          return levelUpPet(args[1]);
        }
    } else if (message === '壊れない') {
        return makeUnbreakable();
    } else if (message === 'オートチョップ') {
        return autoChop();
    } else if (message.startsWith('ペット削除 ')) {
        const petName = message.replace('ペット削除 ', '');
        return removePet(petName);
    } else if (message.startsWith('buy ')) {
        if (args.length === 3) {
            return buyItem(args[1], args[2]);
        }
        return 'Format perintah salah! Gunakan: buy [nama_item] [jumlah]'
    } else if (message.startsWith('sell ')) {
        if (args.length === 3) {
            return sellItem(args[1], args[2]);
        }
        return 'Format perintah salah! Gunakan: sell [nama_item] [jumlah]'
    } else if (message === "quests") {
        return showQuests();
    } else if (message.startsWith("take quest ")) {
        return takeQuest(message.replace("take quest ", ""));
    } else if (message === "my quests") {
        return quests.length ? quests.map(q => `${q.name} - ${q.progress ? "Sedang dikerjakan" : "Belum dimulai"}`).join("\n") : "Anda belum mengambil quest.";
    } else if (message === "quest progress") {
        let progress = showQuestProgress();
        return progress;
    } else if (message === 'clear chat') {
        chatbox.innerHTML = '';
        alert('Chat berhasil dibersihkan!');
    } else {
        return 'Maaf, saya tidak mengerti. Ketik "menu" untuk melihat list perintah';
    }
}

function startQuiz() {
    quizMode = true;
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    return `Pertanyaan: ${currentQuestion.question}`;
}

function checkQuizAnswer(answer) {
    if (answer.toLowerCase() === currentQuestion.answer) {
        correctAnswers++;
        
        let achievementMessage = '';
        
        if (correctAnswers === 5 && !achievements.includes('Beginner')) {
            achievements.push('Beginner');
            saveAchievements();
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Beginner';
        } else if (correctAnswers === 20 && !achievements.includes('Expert')) {
            achievements.push('Expert');
            saveAchievements();
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Expert';
        } else if (correctAnswers === 40 && !achievements.includes('Advanced')) {
            achievements.push('Advanced');
            saveAchievements();
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Advanced';
        } else if (correctAnswers === 60 && !achievements.includes('Pro')) {
            achievements.push('Pro');
            saveAchievements();
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Pro';
        } else if (correctAnswers === 80 && !achievements.includes('Elite')) {
            achievements.push('Elite');
            saveAchievements();
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Elite';
        } else if (correctAnswers === 100 && !achievements.includes('God')) {
            achievements.push('God');
            saveAchievements();
            achievementMessage = 'Selamat! Anda mendapatkan achievement: God!!!';
        }

        quizMode = false;
        currentQuestion = {};
        return `Benar! ${achievementMessage}`;
    } else {
        const correctAnswer = currentQuestion.answer
        quizMode = false;
        currentQuestion = {};
        return `Salah! Jawabannya adalah: ${correctAnswer}`;
    }
}

function displayAchievements() {
    if (achievements.length === 0) {
        return 'Anda belum memiliki achievement. Mulai quiz dan dapatkan!';
    }
    return 'Achievements Anda: ' + achievements.join(', ');
}

function calculate(expression) {
    try {
        return `Hasil: ${eval(expression)}`;
    } catch {
        return 'Ekspresi tidak valid. Contoh penggunaan: calc 1+1, calc 2-1, calc 2*2, calc 4/2';
    }
}

function startAfkTimer() {
    if (afkTimer) {
        clearTimeout(afkTimer);
    }
    
    afkTimer = setTimeout(() => {
        isAfk = true;
        
        if (!achievements.includes('AFK?')) {
            achievements.push('AFK?');
            saveAchievements();
            displayMessage('Bot: Selamat! Anda mendapatkan achievement: AFK?.');
        }
    }, 3600000);
}

function resetAfkTimer() {
    if (isAfk) {
        isAfk = false;
    }
    startAfkTimer();
}

function craftTools(item) {
    const recipe = [
        { item: 'Wooden Pickaxe', materials: [{ name: 'Wood', count: 3 }, { name: 'Stick', count: 2 }], durability: 60 },
        { item: 'Stone Pickaxe', materials: [{ name: 'Stone', count: 3 }, { name: 'Stick', count: 2 }], durability: 132 },
        { item: 'Iron Pickaxe', materials: [{ name: 'Iron', count: 3 }, { name: 'Stick', count: 2 }], durability: 251 },
        { item: 'Gold Pickaxe', materials: [{ name: 'Gold', count: 3 }, { name: 'Stick', count: 2 }], durability: 33 },
        { item: 'Diamond Pickaxe', materials: [{ name: 'Diamond', count: 3 }, { name: 'Stick', count: 2 }], durability: 1562 },
        { item: 'Netherite Pickaxe', materials: [{ name: 'Netherite', count: 1 }, { name: 'Diamond Pickaxe', count: 1 }], durability: 2032 }
    ];
    
    const selectedRecipe = recipe.find(r => r.item === item);
    
    if (!selectedRecipe) {
        return 'Resep tidak ditemukan.';
    }
    
    for (let material of selectedRecipe.materials) {
        const invItem = getItem(material.name);
        if (!invItem || invItem.count < material.count) {
            return `Anda tidak memiliki cukup ${material.name} untuk membuat ${item}.`;
        }
    }
    
    for (let material of selectedRecipe.materials) {
        removeItem(material.name, material.count);
    }
    
    inventory.push({ name: selectedRecipe.item, count: 1, durability: selectedRecipe.durability });
    localStorage.setItem('inventory', JSON.stringify(inventory));

    return `Anda telah berhasil membuat ${selectedRecipe.item} dengan durability ${selectedRecipe.durability}!`;
}

function getTag() {
    let tag = prompt('Masukkan tag');
    localStorage.setItem('tag', tag);
}

function autoMine() {
    if (tag === 'シ') {
        const pickaxes = ['Netherite Pickaxe', 'Diamond Pickaxe', 'Gold Pickaxe', 'Iron Pickaxe', 'Stone Pickaxe', 'Wooden Pickaxe'];
        const pickaxe = inventory.find(item => pickaxes.includes(item.name));
        
        const interval = setInterval(() => {
            mineResources();
            if (!pickaxe) {
                clearInterval(interval);
            }
        },0);
        return '[Secret Command] autoMine Aktif シ';
    }
}

function godMode(item, amount) {
  if (tag === 'シ') {
      addStackableItem(item.charAt(0).toUpperCase() + item.slice(1), parseInt(amount));
      return `[Secret Command] godMode addItem: ${item}, count: ${amount} シ`;
  }
}

function levelUpPet(petName) {
    if (tag === 'シ') {
        let pet = pets.find(p => p.name === petName);
        if (pet) {
            pet.level++;
            pet.exp = 0;
            localStorage.setItem('pets', JSON.stringify(pets));
            return `[Secret Command] ${petName} naik ke level ${pet.level}! シ`;
        } else {
            return 'Pet tidak ditemukan!';
        }
    }
}

function makeUnbreakable() {
    if (tag === 'シ') {
        let pickaxe = inventory.find(item => item.name.includes('Pickaxe'));
        if (!pickaxe) return 'Anda tidak memiliki pickaxe!';
        
        pickaxe.durability = Infinity;
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return '[Secret Command] Pickaxe sekarang tidak bisa hancur! シ';
    }
}

function autoChop() {
    if (tag === 'シ') {
        setInterval(() => {
            chopTree();
        },0);
        return '[Secret Command] autoChop Aktif シ'
    }
}

function removePet(petName) {
    if (tag === 'シ') {
        const petIndex = pets.findIndex(p => p.name === petName);
        
        if (petIndex !== -1) {
            pets.splice(petIndex, 1);
            localStorage.setItem('pets', JSON.stringify(pets));
            return `[Secret Command] Pet "${petName}" telah dihapus! シ`;
        } else {
            return 'Pet tidak ditemukan!';
        }
    } else {
        return 'Anda tidak memiliki akses ke perintah ini!';
    }
}
