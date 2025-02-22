console.warn('main.js loaded')

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
let quizMode = false;
let currentQuestion = {};
let correctAnswers = 0; // Hitungan jawaban benar untuk achievement
const achievements = [];
let afkTimer = null;
let isAfk = false;
const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

function chopTree() {
    const chance = Math.floor(Math.random() * 2) + 1;
    let item = chance === 1 ? 'Wood' : 'Stick';
    addStackableItem(item);
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
    
    if (pickaxe.durability === undefined) {
        const defaultDurability = {
            'Wooden Pickaxe': 60,
            'Stone Pickaxe': 132,
            'Iron Pickaxe': 251,
            'Gold Pickaxe': 33,
            'Diamond Pickaxe': 1562,
            'Netherite Pickaxe': 2032
        };
        pickaxe.durability = defaultDurability[pickaxe.name] || 0;
    }
    
    pickaxe.durability--;
    
    if (pickaxe.durability <= 0) {
        const index = inventory.findIndex(item => item.name === pickaxe.name);
        if (index !== -1) {
            inventory.splice(index, 1);
        }
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
    
    for (let resource of resources) {
        cumulativeChance += resource.chance;
        if (roll <= cumulativeChance) {
            addStackableItem(resource.name);
            localStorage.setItem('inventory', JSON.stringify(inventory));
            return `Anda mendapatkan ${resource.name}! (Durability Pickaxe: ${pickaxe.durability})`;
        }
    }
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
    return `Anda tidak mendapatkan apa-apa. (Durability Pickaxe: ${pickaxe.durability})`;
}


function addStackableItem(item) {
    const existingItem = inventory.find(i => i.name === item);
    if (existingItem) {
        existingItem.count++;
    } else {
        inventory.push({ name: item, count: 1 });
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

function updateLeaderboard() {
    const existingPlayer = leaderboard.find(player => player.name === userName);
    if (existingPlayer) {
        existingPlayer.score = Math.max(existingPlayer.score, correctAnswers);
    } else {
        leaderboard.push({ name: userName, score: correctAnswers });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    if (leaderboard.length === 0) {
        return 'Leaderboard kosong. Mulailah bermain dan dapatkan skor tertinggi!';
    }
    return leaderboard
        .map((player, index) => `${index + 1}. ${player.name}: ${player.score} jawaban benar`)
        .join('\n');
}

function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}


// Variabel untuk menyimpan nama pengguna
let userName = localStorage.getItem('userName') || '';

document.addEventListener('DOMContentLoaded', () => {
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

    displayMessage('Anda: ' + userMessage);
    userInput.value = '';

    let botResponse;
    if (quizMode) {
        botResponse = checkQuizAnswer(userMessage);
    } else {
        botResponse = getBotResponse(userMessage);
    }

    displayMessage('Bot: ' + botResponse);
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('fade-in'); // Tambahkan kelas
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function getBotResponse(message) {
    message = message.toLowerCase();
    
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
    } else if (message === 'leaderboard') {
        return displayLeaderboard();
    } else if (message === 'inv') {
        return displayInventory();
    } else if (message === 'mine') {
        return mineResources();
    } else if (message === 'calc') {
        const expression = message.replace('calc ', '');
        return calculate(expression);
    } else if (message === 'quiz') {
        return startQuiz();
    } else if (message === 'legendary72') {
        return addStackableItem('Diamond');
    } else if (message === 'menu') {
        return 'Command: rank, weapon list (common/uncommon/rare/legendary/mythic/celestial), rules, admin slot, info server, info bot, changelog, support, quiz, calc, achievement, ganti nama, info achievement, leaderboard, inv, mine, craft (wooden pickaxe/stone pickaxe/iron pickaxe/gold pickaxe/diamond pickaxe/netherite pickaxe), chop a tree';
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
        return 'Nama Bot: Legendary Bot, Dibuat Oleh CO-OWNER Legendary Craft (DJMoonZHX72), Versi Bot: 1.13.0';
    } else if (message === 'changelog') {
        return '1.0.0: created bot, 1.1.0: added player info, menu, & rank, 1.2.0: added weapon list, rules, admin slot, info server, & info bot, 1.2.1: added changelog, & support, 1.4.0: added calculator, 1.5.0: added achievement, 1.5.1: updated achievement & quiz, 1.6.0: added name, 1.6.1: bugfix, 1.7.0: Updated Weapon List, 1.8.0: Updated Achievement System, 1.9.0: added leaderboard, 1.9.1: Fixed Quiz Bug & added fade animation, 1.10.0: Added Inventory, 1.11.0: added mine, 1.12.0: updated send button design, 1.13.0: bugfix and add crafting tools';
    } else if (message === 'support') {
        return 'DJMoonZHX72: https://youtube.com/@DJMoonZHX72  https://www.instagram.com/djmoonzhx72/profilecard/?igsh=MXhhczVneWtld3RpdQ==  https://whatsapp.com/channel/0029VarfkCz9mrGkIcsHrW1D https://github.com/DJMoonZHX72 Rizkiwibu9696: https://whatsapp.com/channel/0029Var7OtgGzzKU3Qeq5s09 https://www.instagram.com/ikikidal_03/profilecard/?igsh=dnVnMW5zOXo3dTFo , Legendary Craft: https://whatsapp.com/channel/0029VakZDNU9Gv7TRP0TH53K';
    } else if (message === 'info achievement') {
        return 'info: Beginner: 5 jawaban benar di quiz. Expert: 20 jawaban benar di quiz. Advanced: 40 jawaban benar di quiz. Pro: 60 jawaban benar di quiz. Elite: 80 jawaban benar di quiz. God: 100 jawaban benar di quiz. Find The Secret: Temukan Rahasia. AFK?: AFK Selama 1 Jam 🗿, Diamonds?: Dapatkan item diamond';
    } else if (message === 'anothersecret?') {
        return addStackableItem('Secret Coin');
    } else if (message === 'chop a tree') {
        return chopTree()
    } else if (message === 'craft wooden pickaxe') {
        return craftTools('Wooden Pickaxe')
    } else if (message === 'craft stone pickaxe') {
        return craftTools('Stone Pickaxe')
    } else if (message === 'craft iron pickaxe') {
        return craftTools('Iron Pickaxe')
    } else if (message === 'craft gold pickaxe') {
        return craftTools('Gold Pickaxe')
    } else if (message === 'craft diamond pickaxe') {
        return craftTools('Diamond Pickaxe')
    } else if (message === 'craft netherite pickaxe') {
        craftTools('Netherite Pickaxe')
    } else if (message === 'シ') {
        return autoMine()
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
        
        const playerIndex = leaderboard.findIndex(player => player.name === userName)
        if (playerIndex !== -1) {
            leaderboard[playerIndex].score += 1;
        } else {
            leaderboard.push({ name: userName, score: 1 });
        }
        
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        
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
    // Hentikan timer lama jika ada aktivitas
    if (afkTimer) {
        clearTimeout(afkTimer);
    }

    // Mulai timer AFK
    afkTimer = setTimeout(() => {
        isAfk = true;

        // Tambahkan achievement jika belum ada
        if (!achievements.includes('AFK?')) {
            achievements.push('AFK?');
            saveAchievements();
            displayMessage('Bot: Selamat! Anda mendapatkan achievement: AFK?.');
        }
    }, 3600000); // 3600 detik
}

function resetAfkTimer() {
    if (isAfk) {
        isAfk = false;
    }
    startAfkTimer(); // Reset timer saat ada aktivitas
}

function craftTools(item) {
    const recipe = [
        { item: 'Wooden Pickaxe', materials: [{ name: 'Wood', count: 3 }, { name: 'Stick', count: 2 }], durability: 60 },
        { item: 'Stone Pickaxe', materials: [{ name: 'Stone', count: 3 }, { name: 'Stick', count: 2 }], durability: 132 },
        { item: 'Iron Pickaxe', materials: [{ name: 'Iron', count: 3 }, { name: 'Stick', count: 2 }], durability: 251 },
        { item: 'Gold Pickaxe', materials: [{ name: 'Gold', count: 3 }, { name: 'Stick', count: 2 }], durability: 33 },
        { item: 'Diamond Pickaxe', materials: [{ name: 'Diamond', count: 3 }, { name: 'Stick', count: 2 }], durability: 1562 },
        { item: 'Netherite Pickaxe', materials: [{ name: 'Netherite', count: 3 }, { name: 'Stick', count: 2 }], durability: 2032 }
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

function autoMine() {
    setInterval(() => {
        mineResources()
    },0)
}
