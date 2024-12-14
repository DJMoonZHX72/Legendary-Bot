console.warn('main.js loaded')

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
let quizMode = false;
let currentQuestion = {};
let correctAnswers = 0; // Hitungan jawaban benar untuk achievement
const achievements = []; // Array untuk menyimpan achievement

// Variabel untuk menyimpan nama pengguna
let userName = localStorage.getItem('userName') || '';

document.addEventListener('DOMContentLoaded', () => {
    if (!userName) {
        userName = prompt('Halo! Siapa nama Anda?');
        if (userName) {
            localStorage.setItem('userName', userName);
            displayMessage(`Bot: Selamat datang, ${userName}! Senang bertemu dengan Anda.`);
        }
    } else {
        displayMessage(`Bot: Selamat datang kembali, ${userName}!`);
    }
});

const questions = [
    { question: "Apa ibu kota Indonesia?", answer: "jakarta" },
    { question: "30×34 berapa?", answer: "1020" },
    { question: "Siapa penemu bola lampu?", answer: "thomas edison" },
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
    { question: "Negara terbesar di dunia berdasarkan luas wilayah adalah?", answer: "rusia" }
];

sendButton.addEventListener('click', sendMessage);

function sendMessage() {
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
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function getBotResponse(message) {
    message = message.toLowerCase();

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
    } else if (message.includes('calc')) {
        const expression = message.replace('calc ', '');
        return calculate(expression);
    } else if (message.includes('quiz')) {
        return startQuiz();
    } else if (message.includes('redeem code')) {
        return 'Kode Redeem Hari Ini Adalah Legendary72';
    } else if (message.includes('menu')) {
        return 'Command: redeem code, rank, weapon list (common/uncommon/rare/legendary/mythic/celestial), rules, admin slot, info server, info bot, changelog, support, quiz, calc, achievement, ganti nama';
    } else if (message.includes('achievement')) {
        return displayAchievements();
    } else if (message.includes('rank')) {
        return 'VIP: Harga, MVP: Harga, LEGEND: Harga, MYTHIC: Harga, LUXURY: Harga, HYPER: Harga';
    } else if (message.includes('weapon list common')) {
        return 'Common: Wooden Sword, Golden Sword, Stone Sword, Iron Sword, Bow, Crossbow, Copper Sword.';
    } else if (message.includes('weapon list uncommon')) {
        return 'Uncommon: Diamond Sword, Netherite Sword, Assassin Blade, Breeze Wand, Claw, Exposed Copper Sword, Weathered Copper Sword, Dagger, Double Axe, Firework Sword, Jester Cane, Magic Wand, Spear.';
    } else if (message.includes('weapon list rare')) {
        return 'Rare: Battle Axe, Club, Oxidized Copper Sword, End Wand, Frostbite, Gem Crusher, Goat Hammer, Golden Trident, Great Hammer, Halbert, Healing Wand, Katana, Lucky Sword, Phantom Blade, Scimitar, Scythe, Sickle, Spider Sword, Venomstrike, Villager Claymore, Wither Sword, Wolf Glaive';
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
        return 'Nama Bot: Legendary Bot, Dibuat Oleh CO-OWNER Legendary Craft (DJMoonZHX72) Untuk Info Server Legendary Craft, Versi Bot: 1.7.0';
    } else if (message.includes('changelog')) {
        return '1.0.0: created bot, 1.1.0: added player info, menu, & rank, 1.2.0: added weapon list, rules, admin slot, info server, & info bot, 1.2.1: added changelog, & support, 1.4.0: added calculator, 1.5.0: added achievement, 1.5.1: updated achievement & quiz, 1.6.0: added name, 1.6.1: bugfix, 1.7.0: Updated Weapon List';
    } else if (message.includes('support')) {
        return 'DJMoonZHX72: https://youtube.com/@DJMoonZHX72  https://www.instagram.com/djmoonzhx72/profilecard/?igsh=MXhhczVneWtld3RpdQ==  https://whatsapp.com/channel/0029VarfkCz9mrGkIcsHrW1D https://github.com/DJMoonZHX72 Rizkiwibu9696: https://whatsapp.com/channel/0029Var7OtgGzzKU3Qeq5s09 https://www.instagram.com/ikikidal_03/profilecard/?igsh=dnVnMW5zOXo3dTFo , Legendary Craft: https://whatsapp.com/channel/0029VakZDNU9Gv7TRP0TH53K';
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
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Beginner';
        } else if (correctAnswers === 20 && !achievements.includes('Expert')) {
            achievements.push('Expert');
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Expert';
        } else if (correctAnswers === 40 && !achievements.includes('Advanced')) {
            achievements.push('Advanced');
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Advanced';
        } else if (correctAnswers === 60 && !achievements.includes('Pro')) {
            achievements.push('Pro');
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Pro';
        } else if (correctAnswers === 80 && !achievements.includes('Elite')) {
            achievements.push('Elite');
            achievementMessage = 'Selamat! Anda mendapatkan achievement: Elite';
        } else if (correctAnswers === 100 && !achievements.includes('God')) {
            achievements.push('God');
            achievementMessage = 'Selamat! Anda mendapatkan achievement: God!!!';
        }

        quizMode = false;
        currentQuestion = {};
        return `Benar! ${achievementMessage}`;
    } else {
        quizMode = false;
        currentQuestion = {};
        return `Salah! Jawabannya adalah: ${currentQuestion.answer}`;
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
        return 'Ekspresi tidak valid.';
    }
}
