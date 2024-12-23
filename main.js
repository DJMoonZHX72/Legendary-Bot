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

function mineResources() {
    const resources = [
        { name: 'Coal', chance: 29 },
        { name: 'Silver', chance: 13 },
        { name: 'Iron', chance: 15 },
        { name: 'Copper', chance: 18 },
        { name: 'Gold', chance: 10 },
        { name: 'Amethyst', chance: 4 },
        { name: 'Quartz', chance: 8 },
        { name: 'Emerald', chance: 2 },
        { name: 'Diamond', chance: 1 }
    ];

    const roll = Math.random() * 100; // Gulir angka antara 0-100
    let cumulativeChance = 0;

    for (let resource of resources) {
        cumulativeChance += resource.chance;
        if (roll <= cumulativeChance) {
            addStackableItem(resource.name);
            return `Anda mendapatkan ${resource.name}!`;
        }
    }
    return 'Anda tidak mendapatkan apa-apa. Coba lagi!';
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

function displayInventory() {
    if (inventory.length === 0) {
        return 'Inventori Anda kosong.';
    }
    return 'Inventori Anda:\n' +
        inventory.map(i => `${i.name} x${i.count}`).join('\n');
}8

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

    if (message.includes('halo')) {
        return `Halo, ${userName}! Bagaimana saya bisa membantu Anda?`;
    } else if (message.includes('ganti nama')) {
        userName = prompt('Masukkan nama baru Anda:');
        if (userName) {
            localStorage.setItem('userName', userName);
            return `Nama Anda berhasil diubah menjadi ${userName}!`;
        } else {
            return 'Nama tidak diubah.';
        }
    } else if (message.includes('leaderboard')) {
        return displayLeaderboard();
    } else if (message.includes('inv')) {
        return displayInventory();
    } else if (message.includes('mine')) {
        return mineResources();
    } else if (message.includes('calc')) {
        const expression = message.replace('calc ', '');
        return calculate(expression);
    } else if (message.includes('quiz')) {
        return startQuiz();
    } else if (message.includes('legendary72')) {
        return addStackableItem('Diamond');
    } else if (message.includes('menu')) {
        return 'Command: redeem code, rank, weapon list (common/uncommon/rare/legendary/mythic/celestial), rules, admin slot, info server, info bot, changelog, support, quiz, calc, lihat achievement, ganti nama, info achievement, leaderboard, inv, mine';
    } else if (message.includes('lihat achievement')) {
        return displayAchievements();
    } else if (message.includes('rank')) {
        return 'VIP: Harga, MVP: Harga, LEGEND: Harga, MYTHIC: Harga, LUXURY: Harga, HYPER: Harga';
    } else if (message.includes('weapon list common')) {
        return 'Common: Wooden Sword, Golden Sword, Stone Sword, Iron Sword, Bow, Crossbow, Copper Sword.';
    } else if (message.includes('weapon list uncommon')) {
        return 'Uncommon: Diamond Sword, Netherite Sword, Assassin Blade, Breeze Wand, Claw, Exposed Copper Sword, Weathered Copper Sword, Dagger, Double Axe, Firework Sword, Jester Cane, Magic Wand, Spear.';
    } else if (message.includes('weapon list rare')) {
        return 'Rare: Battle Axe, Club, Oxidized Copper Sword, End Wand, Frostbite, Gem Crusher, Goat Hammer, Golden Trident, Great Hammer, Halbert, Healing Wand, Katana, Lucky Sword, Phantom Blade, Scimitar, Scythe, Sickle, Spider Sword, Venomstrike, Villager Claymore, Wither Sword, Wolf Glaive.';
    } else if (message.includes('weapon list legendary')) {
        return 'Legendary: Mace, Dragonfang, Fire Armblade, Flamebrand, Ham Bat, Lance, Lightsaber, Obsidian Sword, Vampire Sword, Warhammer.';
    } else if (message.includes('weapon list mythic')) {
        return 'Mythic: God of The Death Axe, Fenuzdonoa Sword, Elheim Trident, Dual Ender Blade, Flamescion Blade, Frost Slayer.';
    } else if (message.includes('weapon list celestial')) {
        return 'Celestial: Voidblade💀, Flame Bow, Doombringer Axe, Dark Blade.'
    } else if (message.includes('rules')) {
        return 'Rules: No Spam, No Promosi Apapun, No X-ray, No Cheat, No Homo, No Glitch';
    } else if (message.includes('weapon list')) {
        return 'Gunakan weapon list (common/uncommon/rare/legendary/mythic/celestial)!';
    } else if (message.includes('admin slot')) {
        return 'Slot Admin Sisa 9';
    } else if (message.includes('info server')) {
        return 'Server: Legendary Craft, Dibuat pada tanggal __/__/____, Pembuat Server: Rizkiwibu9696';
    } else if (message.includes('info bot')) {
        return 'Nama Bot: Legendary Bot, Dibuat Oleh CO-OWNER Legendary Craft (DJMoonZHX72) Untuk Server Legendary Craft, Versi Bot: 1.11.0';
    } else if (message.includes('changelog')) {
        return '1.0.0: created bot, 1.1.0: added player info, menu, & rank, 1.2.0: added weapon list, rules, admin slot, info server, & info bot, 1.2.1: added changelog, & support, 1.4.0: added calculator, 1.5.0: added achievement, 1.5.1: updated achievement & quiz, 1.6.0: added name, 1.6.1: bugfix, 1.7.0: Updated Weapon List, 1.8.0: Updated Achievement System, 1.9.0: added leaderboard, 1.9.1: Fixed Quiz Bug & added fade animation, 1.10.0: Added Inventory, 1.11.0: added mine';
    } else if (message.includes('support')) {
        return 'DJMoonZHX72: https://youtube.com/@DJMoonZHX72  https://www.instagram.com/djmoonzhx72/profilecard/?igsh=MXhhczVneWtld3RpdQ==  https://whatsapp.com/channel/0029VarfkCz9mrGkIcsHrW1D https://github.com/DJMoonZHX72 Rizkiwibu9696: https://whatsapp.com/channel/0029Var7OtgGzzKU3Qeq5s09 https://www.instagram.com/ikikidal_03/profilecard/?igsh=dnVnMW5zOXo3dTFo , Legendary Craft: https://whatsapp.com/channel/0029VakZDNU9Gv7TRP0TH53K';
    } else if (message.includes('info achievement')) {
        return 'info: Beginner: 5 jawaban benar di quiz. Expert: 20 jawaban benar di quiz. Advanced: 40 jawaban benar di quiz. Pro: 60 jawaban benar di quiz. Elite: 80 jawaban benar di quiz. God: 100 jawaban benar di quiz. Find The Secret: Temukan Rahasia. AFK?: AFK Selama 1 Jam 🗿, Diamonds?: Dapatkan item diamond';
    } else if (message.includes('anothersecret?')) {
        return addStackableItem('Secret Coin');
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
            leaderboard[playerIndex].score = correctAnswers;
        } else {
            leaderboard.push({ name: userName, score: correctAnswers })
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
