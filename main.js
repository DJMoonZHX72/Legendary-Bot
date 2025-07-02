/*****************************************
+* (c) DJMoonZHX72. All rights reserved. *
+*  (c) Crystal24. All rights reserved.  *
+*(c) Rizkiwibu9696. All rights reserved.*
+*****************************************/

console.warn('main.js loaded');

// Global Scope
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const questMessage = document.getElementById('questMessage');
const versionIndicator = document.getElementById('ver');
const title = document.getElementById('title');
const questList = document.getElementById('questList');
const botVersion = '1.17.1';
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
let player = {
    name: userName,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    weapon: null,
};

const enemies = [
    { name: 'Zombie', hp: 50, maxHp: 50, attack: 8, defense: 2, xp: 10, money: 50, rewards: [{ item: 'Iron', count: 1 }] },
    { name: 'Skeleton', hp: 60, maxHp: 60, attack: 10, defense: 3, xp: 15, money: 75, rewards: [{ item: 'Emerald', count: 1 }] },
    { name: 'Enderman', hp: 100, maxHp: 80, attack: 12, defense: 4, xp: 25, money: 150, rewards: [{ item: 'Diamond', count: 1 }] }
];
let currentEnemy = null;
let inBattle = false;
const places = [
    {
        name: 'Forest',
        requirement: '',
        challenge: 'Anda tersesat',
        loot: [
            { item: 'Wood', chance: 30 },
            { item: 'Leaf', chance: 30 },
            { item: 'Leather', chance: 15 },
            { item: 'Apple', chance: 10 },
            { item: 'Rope', chance: 10 },
            { item: 'Water', chance: 5 }
        ]
    },
    {
        name: 'Mountain',
        requirement: 'Rope',
        challenge: 'Longsor & jatuh',
        loot: [
            { item: 'Stone', chance: 50 },
            { item: 'Coal', chance: 30 },
            { item: 'Iron', chance: 15 },
            { item: 'Emerald', chance: 5 }
        ]
    },
    {
        name: 'Cave',
        requirement: 'Torch',
        challenge: 'Monster & runtuhan',
        loot: [
            { item: 'Stone', chance: 40 },
            { item: 'Iron', chance: 30 },
            { item: 'Gold', chance: 23 },
            { item: 'Diamond', chance: 5 },
            { item: 'Netherite', chance: 2 }
        ]
    },
    {
        name: 'Desert',
        requirement: 'Water',
        challenge: 'Cuaca ekstrem',
        loot: [
            { item: 'Sand', chance: 50 },
            { item: 'Cactus', chance: 25 },
            { item: 'Bone', chance: 20 },
            { item: 'Chest', chance: 5 }
        ]
    },
    {
        name: 'Ocean',
        requirement: 'Boat',
        challenge: 'Hiu & arus',
        loot: [
            { item: 'Fish', chance: 50 },
            { item: 'Seaweed', chance: 30 },
            { item: 'Pearl', chance: 15 },
            { item: 'Treasure', chance: 5 }
        ]
    },
    {
        name: 'Swamp',
        requirement: '',
        challenge: 'Lumpur hisap',
        loot: [
            { item: 'Mud', chance: 50 },
            { item: 'Frog', chance: 25 },
            { item: 'Lilypad', chance: 20 },
            { item: 'Potion', chance: 5 }
        ]
    },
    {
        name: 'Abandoned City',
        requirement: 'weapon',
        challenge: 'Zombie & perangkap',
        loot: [
            { item: 'Junk', chance: 40 },
            { item: 'Old Book', chance: 30 },
            { item: 'Ancient Artifact', chance: 20 },
            { item: 'Secret Map', chance: 10 }
        ]
    },
    {
        name: 'Moon',
        requirement: 'Spacesuit',
        challenge: 'Gravitasi rendah & radiasi',
        loot: [
            { item: 'Moon Rock', chance: 50 },
            { item: 'Lunar Crystal', chance: 25 },
            { item: 'Alien Artifact', chance: 15 },
            { item: 'Cosmic Core', chance: 10 }
        ]
    },
    {
        name: 'Asteroid Belt',
        requirement: 'Spaceship',
        challenge: 'Tabrakan asteroid',
        loot: [
            { item: 'Space Rock', chance: 49.5 },
            { item: 'Meteorite Shard', chance: 30 },
            { item: 'Alien Alloy', chance: 15 },
            { item: 'Cosmic Crystal', chance: 5 },
            { item: 'Void Key', chance: 0.5 }
        ]
    },
    {
        name: 'Deep Ocean Trench',
        requirement: 'Diving Suit',
        challenge: 'Tekanan tinggi & monster',
        loot: [
            { item: 'Bioluminescent Coral', chance: 45 },
            { item: 'Deep Sea Pearl', chance: 35 },
            { item: 'Abyssal Gem', chance: 15 },
            { item: 'Leviathan Relic', chance: 5 }
        ]
    },
    {
        name: 'Lost Civilization',
        requirement: 'Explorer Gear',
        challenge: 'Teka-teki mistis',
        loot: [
            { item: 'Ancient Coin', chance: 38 },
            { item: 'Forgotten Artifact', chance: 35 },
            { item: 'Mythic Scroll', chance: 15 },
            { item: 'Lost Emperor’s Crown', chance: 10 },
            { item: 'Key of Eternity', chance: 2 }
        ]
    },
    {
        name: 'Void Rift',
        requirement: 'Void Key',
        challenge: 'Gravitasi tidak stabil',
        loot: [
            { item: 'Darkness Fragment', chance: 51 },
            { item: 'Void Core', chance: 35 },
            { item: 'Void Fragment', chance: 10 },
            { item: 'Chrono Relic', chance: 3 },
            { item: 'Divine Sigil', chance: 1 }
        ]
    },
    {
        name: 'Temporal Nexus',
        requirement: 'Chrono Relic',
        challenge: 'Distorsi waktu',
        loot: [
            { item: 'Chrono Dust', chance: 50 },
            { item: 'Time Crystal', chance: 30 },
            { item: 'Temporal Fragment', chance: 15 },
            { item: 'Tachyon Core', chance: 5 }
        ]
    },
    {
        name: 'Supernova Event',
        requirement: 'Cosmic Shield',
        challenge: 'Gelombang panas',
        loot: [
            { item: 'Solar Fragment', chance: 55 },
            { item: 'Nebula Core', chance: 20 },
            { item: 'Cosmic Energy', chance: 15 },
            { item: 'Starborn Relic', chance: 10 }
        ]
    },
    {
        name: 'Eternal Star Core',
        requirement: 'Stellar Key',
        challenge: 'Suhu ekstrem',
        loot: [
            { item: 'Starlight Dust', chance: 50 },
            { item: 'Celestial Gem', chance: 20 },
            { item: 'Cosmic Ore', chance: 15 },
            { item: 'Essence of Infinity', chance: 5 },
            { item: 'StarFire Ore', chance: 10 }
        ]
    },
    {
        name: 'Vault of Eternity',
        requirement: 'Key of Eternity',
        challenge: 'Perangkap & teka-teki',
        loot: [
            { item: 'Ancient Coin', chance: 50 },
            { item: 'Time-Lost Relic', chance: 35 },
            { item: 'Another Dimension Treasure', chance: 10 },
            { item: 'Legendary Artifact', chance: 5 }
        ]
    },
    {
        name: 'Cosmic Throne',
        requirement: 'Divine Sigil',
        challenge: 'Guardian legendaris',
        loot: [
            { item: 'Cosmic Shard', chance: 50 },
            { item: 'Divine Relic', chance: 40 },
            { buff: 'Throne’s Blessing', chance: 10 },
        ]
    }
];
let challengeCompleted = false;
let beforeSupernova = true;
let currentPlace = JSON.parse(localStorage.getItem('place')) || {};
const bosses = [
    { name: 'Void Warden', place: 'Void Rift', hp: 520, maxHp: 520, attack: 50, defense: 10, xp: 200, money: 5000, rewards: [{ item: 'Void Essence', count: 1 }] },
    { name: 'Cosmic Guardian', place: 'Cosmic Throne', hp: 20000, maxHp: 20000, attack: 500, defense: 100, xp: 20000, money: 500000000, rewards: [{ item: 'Cosmic Claw Frame', count: 1 }] }
];
let inBossfight = false;

// HTML
versionIndicator.innerHTML = `V${botVersion}`;
title.innerHTML = `DJMoonZHX72 - Legendary Bot ${botVersion}`

// Onload
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
    
    setInterval(enemyHeal, 10000);
});

// Function
function showNotif() {
  const notif = document.getElementById('notifikasi');
  notif.classList.add('muncul');
  
  setTimeout(() => {
    notif.classList.remove('muncul');
  }, 3000);
}

setInterval(showNotif, 60000);
showNotif();

function bossfight() {
    const currentEnemy = bosses.find(b => b.place === currentPlace.name);
    
    if (currentEnemy === '' || !currentEnemy) {
        return `❌️ Tidak ada boss di ${currentPlace.name}`;
    }
    
    if (inBossfight) return '⚠️ Anda sudah dalam pertarungan!';
    
    inBossfight = true;
    return `⚔️ Anda bertarung melawan ${currentEnemy.name}`;
}

function attackBoss() {
    if (!inBattle || !currentEnemy) {
        return '❌️ Tidak ada boss yang sedang dilawan.';
    }
    
    const damageToBoss = Math.max(player.attack - currentEnemy.defense, 0);
    currentEnemy.hp -= damageToBoss;
    return `⚔️ Kamu menyerang ${currentEnemy.name} dan memberikan ${damageToBoss} damage!`;
    
    if (currentEnemy.hp <= 0) {
        return `🎉 Kamu telah mengalahkan ${currentEnemy.name}!`;
        inBattle = false;
        
        player.hp = Math.min(player.hp + 10, player.maxHp);
        return `🩸 Kesehatanmu dipulihkan 10 poin.`;
        
        currentEnemy.rewards.forEach(reward => {
            inventory.push({ item: reward.item, count: reward.count });
            return `Kamu mendapatkan ${reward.count}x ${reward.item}!`;
        });
        
        localStorage.setItem('inventory', JSON.stringify(inventory));
        currentEnemy = null;
    }
    
    const damageToPlayer = Math.max(currentEnemy.attack - player.defense, 0);
    player.hp -= damageToPlayer;
    return `${currentEnemy.name} menyerang balik dan memberikan ${damageToPlayer} damage padamu!`;

    if (player.hp <= 0) {
        return '💀 Kamu kalah! Pulihkan dirimu sebelum bertarung lagi.';
        inBattle = false;
    }
}

function getCelestialCatalyst() {
    if (currentPlace.name.toLowerCase() !== 'vault of eternity') {
        return '❌️ Celestial Catalyst hanya bisa didapat di Vault of Eternity!';
    } else {
        const random = Math.floor(Math.random() * 10) + 1;
        const userAnswer = parseInt(prompt('Tebak angka dari 1-10'));
        
        if (userAnswer === random) {
            addStackableItem('Celestial Catalyst', 1);
            return '✅️ Jawaban benar! +1 Celestial Catalyst';
        } else {
            return `❌️ Salah! Angka yang benar adalah ${random}.`;
        }
    }
}

function craftItem(item) {
    const items = [
        { name: 'Torch', count: 1, materials: [{ name: 'Stick', count: 1 }, { name: 'Coal', count: 1 }] },
        { name: 'Boat', count: 1, materials: [{ name: 'Wood', count: 5 }] },
        { name: 'Spacesuit', count: 1, materials: [{ name: 'Iron', count: 10 }, { name: 'Silver', count: 5 }, { name: 'Leather', count: 3 }, { name: 'Potion', count: 2 }, { name: 'Glass', count: 1 }] },
        { name: 'Glass', count: 20, materials: [{ name: 'Sand', count: 20 }, { name: 'Coal', count: 1 }] },
        { name: 'Spaceship', count: 1, materials: [{ name: 'Iron', count: 20 }, { name: 'Silver', count: 10 }, { name: 'Gold', count: 5 }, { name: 'Quartz', count: 5 }, { name: 'Amethyst', count: 2 }] },
        { name: 'Diving Suit', count: 1, materials: [{ name: 'Iron', count: 10 }, { name: 'Leather', count: 5 }, { name: 'Potion', count: 2 }, { name: 'Glass', count: 2 }] },
        { name: 'Explorer Gear', count: 1, materials: [{ name: 'Leather', count: 8 }, { name: 'Stick', count: 5 }, { name: 'Iron', count: 5 }, { name: 'Potion', count: 2 }, { name: 'Secret Map', count: 1 }] },
        { name: 'Cosmic Shield', count: 1, materials: [{ name: 'Cosmic Crystal', count: 1 }, { name: 'Lunar Crystal', count: 1 }, { name: 'Void Essence', count: 1 }] },
        { name: 'Stellar Key', count: 1, materials: [{ name: 'Void Fragment', count: 2 }, { name: 'Nebula Core', count: 3 }, { name: 'Lunar Crystal', count: 1 }] },
        { name: 'Omniversal Alloy', count: 1, materials: [{ name: 'StarFire Ore', count: 2 }, { name: 'Void Core', count: 3 }, { name: 'Cosmic Crystal', count: 2 }, { name: 'Nebula Core', count: 1 }] }
    ];
    
    const selectedItem = items.find(i => i.name.toLowerCase() === item);
    
    if (!selectedItem) {
        return '❌️ Item tidak ditemukan';
    }
    
    for (let material of selectedItem.materials) {
        const invItem = inventory.find(i => i.name === material.name);
        if (!invItem || invItem.count < material.count) {
            return `⚠️ Anda tidak memiliki cukup ${material.name} untuk membuat ${selectedItem.name}!`;
        }
    }
    
    for (let material of selectedItem.materials) {
        removeItem(material.name, material.count);
    }
    
    addStackableItem(selectedItem.name, selectedItem.count);
    return `🛠 Anda membuat ${selectedItem.name} berjumlah ${selectedItem.count}`;
}

function setPlace(newPlace) {
    if (!places.some(p => p.name.toLowerCase() === newPlace)) {
        return `❌️ Tempat ${newPlace} tidak valid!`;
    } else {
        const place = places.find(p => p.name.toLowerCase() === newPlace);
        
        let isRequirementComplete = false;
        
        if (!place.requirement) {
            isRequirementComplete = true;
        } else if (place.requirement === 'weapon') {
            isRequirementComplete = inventory.some(i =>
                /sword|axe|claw/i.test(i.name)
            );
        } else {
            isRequirementComplete = inventory.some(i => i.name === place.requirement);
        }
        
        if (!isRequirementComplete) {
            return '⚠️ Dapatkan requirement sebelum pergi!';
        } else {
            if (place.name.includes('Event')) {
                setTimeout(() => {
                    goTo = places.find(p => p.name.toLowerCase() === 'forest');
                    localStorage.setItem('place', JSON.stringify(goTo));
                    displayMessage('Bot: Anda keluar dari Supernova Event karena Supernova telah selesai');
                }, 10000);
            }
            
            let goTo = places.find(p => p.name.toLowerCase() === newPlace);
            localStorage.setItem('place', JSON.stringify(goTo));
            currentPlace = JSON.parse(localStorage.getItem('place'));
            return `✅ Anda telah pergi ke ${newPlace}!`;
        }
    }
}

function adventure() {
    let currentPlace = JSON.parse(localStorage.getItem('place')) || {};
    if (!currentPlace.name) return '❌️ Tidak ada tempat aktif untuk dijelajahi!';
    
    const place = places.find(p => p.name === currentPlace.name);
    if (!place) return '️❌️ Tempat tidak ditemukan!';
    
    if (Math.random() < 0.2) return `❌ Kamu gagal menjelajahi ${place.name} karena ${place.challenge}!`;
    
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let foundLoot = null;
    
    for (const loot of place.loot) {
        cumulativeChance += loot.chance;
        if (roll <= cumulativeChance) {
            foundLoot = loot;
            break;
        }
    }
    
    if (!foundLoot) return `❌ Kamu tidak menemukan apa-apa di ${place.name}.`;
    
    if (foundLoot.item) {
        if (currentPlace.name === 'Supernova Event') {
            addStackableItem('Hypernova Core', 1);
        }
        
        addStackableItem(foundLoot.item, 1);
        return `✅ Kamu berhasil menjelajahi ${place.name} dan mendapatkan ${foundLoot.item}!`;
    }
    
    if (foundLoot.buff) {
        return `✨ Kamu mendapatkan buff spesial: ${foundLoot.buff}!`;
    }
}

function displayPlaces() {
    return places.map(place => {
        return `🏞️ ${place.name} ` +
            (place.requirement ? `(Requirement: ${place.requirement})` : '(No Requirement)') +
            `\n⚠️ Challenge: ${place.challenge}`;
    }).join('\n\n');
}

function selectWeapon(weaponName) {
    let weapon = inventory.find(item => item.name.toLowerCase() === weaponName.toLowerCase());

    if (!weapon) return `❌ Anda tidak memiliki ${weaponName} dalam inventori!`;

    player.weapon = weapon;
    return `✅ Anda sekarang menggunakan ${weapon.name} (DMG: ${weapon.damage}, Durability: ${weapon.durability}).`;
}

function craftWeapon(weaponName) {
    const weapons = [
        { name: 'Wooden Sword', materials: [{ name: 'Wood', count: 2 }, { name: 'Stick', count: 1 }], damage: 4, durability: 60 },
        { name: 'Stone Sword', materials: [{ name: 'Stone', count: 2 }, { name: 'Stick', count: 1 }], damage: 6, durability: 132 },
        { name: 'Iron Sword', materials: [{ name: 'Iron', count: 2 }, { name: 'Stick', count: 1 }], damage: 8, durability: 251 },
        { name: 'Gold Sword', materials: [{ name: 'Gold', count: 2 }, { name: 'Stick', count: 1 }], damage: 6, durability: 33 },
        { name: 'Diamond Sword', materials: [{ name: 'Diamond', count: 2 }, { name: 'Stick', count: 1 }], damage: 10, durability: 1562 },
        { name: 'Netherite Sword', materials: [{ name: 'Netherite', count: 1 }, { name: 'Diamond Sword', count: 1 }], damage: 12, durability: 2032 },
        { name: 'Wooden Claw', materials: [{ name: 'Wood', count: 5 }], damage: 5, durability: 80 },
        { name: 'Stone Claw', materials: [{ name: 'Stone', count: 5 }], damage: 7, durability: 140 },
        { name: 'Iron Claw', materials: [{ name: 'Iron', count: 5 }], damage: 9, durability: 260 },
        { name: 'Gold Claw', materials: [{ name: 'Gold', count: 5 }], damage: 7, durability: 50 },
        { name: 'Diamond Claw', materials: [{ name: 'Diamond', count: 5 }], damage: 11, durability: 1700 },
        { name: 'Netherite Claw', materials: [{ name: 'Netherite', count: 1 }, { name: 'Diamond Claw', count: 1 }], damage: 13, durability: 2100 },
        { name: 'Hypercosmic Requiem Claw', materials: [{ name: 'Void Essence', count: 4 }, { name: 'Tachyon Core', count: 2 }, { name: 'Hypernova Core', count: 1 }, { name: 'Omniversal Alloy', count: 2 }, { name: 'Celestial Catalyst', count: 1 }, { name: 'Cosmic Claw Frame', count: 1 }], damage: 9999, durability: 2147483647 },
        { name: 'Wooden Axe', materials: [{ name: 'Wood', count: 3 }, { name: 'Stick', count: 2 }], damage: 5, durability: 59 },
        { name: 'Stone Axe', materials: [{ name: 'Stone', count: 3 }, { name: 'Stick', count: 2 }], damage: 7, durability: 131 },
        { name: 'Iron Axe', materials: [{ name: 'Iron', count: 3 }, { name: 'Stick', count: 2 }], damage: 9, durability: 250 },
        { name: 'Gold Axe', materials: [{ name: 'Gold', count: 3 }, { name: 'Stick', count: 2 }], damage: 7, durability: 32 },
        { name: 'Diamond Axe', materials: [{ name: 'Diamond', count: 3 }, { name: 'Stick', count: 2 }], damage: 11, durability: 1561 },
        { name: 'Netherite Axe', materials: [{ name: 'Netherite', count: 1 }, { name: 'Diamond Axe', count: 1 }], damage: 13, durability: 2031 },
    ];
    
    const selectedWeapon = weapons.find(w => w.name.toLowerCase() === weaponName.toLowerCase());
    
    if (!selectedWeapon) {
        return '⚠️ Senjata tidak ditemukan!';
    }
    
    for (let material of selectedWeapon.materials) {
        const invItem = inventory.find(item => item.name === material.name);
        if (!invItem || invItem.count < material.count) {
            return `❌️ Anda tidak memiliki cukup ${material.name} untuk membuat ${selectedWeapon.name}.`;
        }
    }
    
    for (let material of selectedWeapon.materials) {
        removeItem(material.name, material.count);
    }
    
    inventory.push({ name: selectedWeapon.name, count: 1, damage: selectedWeapon.damage, durability: selectedWeapon.durability });
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    return `🛠️ Anda telah berhasil membuat ${selectedWeapon.name} dengan ${selectedWeapon.damage} DMG dan ${selectedWeapon.durability} durability!`;
}

function startFight() {
    if (inBattle) return '❌️ Anda sudah dalam pertarungan!';
    
    currentEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    inBattle = true;
    
    return `⚔️ Anda bertarung melawan ${currentEnemy.name}! Gunakan: attack, defend, use potion.`;
}

function attackEnemy() {
    if (!inBattle) return '❌️ Anda tidak sedang dalam pertarungan!';
    
    let weapon = player.weapon;
    let weaponDamage = weapon ? weapon.damage : player.attack;
    
    let damage = Math.max(0, weaponDamage - currentEnemy.defense);
    currentEnemy.hp -= damage;
    if (currentEnemy.hp < 0) currentEnemy.hp = 0;
    
    let attackMessage = `⚔️ Anda menyerang ${currentEnemy.name} dengan ${damage} DMG!\n`;
    attackMessage += `💥 HP ${currentEnemy.name}: ${Math.max(0, currentEnemy.hp)}/${currentEnemy.maxHp}`;
    
    if (weapon) {
        weapon.durability--;
        attackMessage += ` (Durability: ${weapon.durability})`;
        
        if (weapon.durability <= 0) {
            inventory.splice(inventory.indexOf(weapon), 1);
            player.weapon = null;
            attackMessage += `\n💥 Senjata ${weapon.name} hancur!`;
        }
    }
    
    if (currentEnemy.hp <= 0) {
        inBattle = false;
        
        let rewardMessage = `🎉 Anda mengalahkan ${currentEnemy.name}!\n`;
        
        addStackableItem('XP', currentEnemy.xp);
        addStackableItem('Money', currentEnemy.money);
        rewardMessage += `🏆 Reward: ${currentEnemy.xp} XP, ${currentEnemy.money} Money\n`;
        
        currentEnemy.rewards.forEach(item => {
            addStackableItem(item.item, item.count);
            rewardMessage += `📦 ${item.count}x ${item.item}\n`;
        });
        
        currentEnemy.hp = currentEnemy.maxHp;
        
        return attackMessage + '\n' + rewardMessage;
    }
    
    return attackMessage + '\n' + enemyTurn();
}

function defend() {
    if (!inBattle || !inBossfight) return '❌️ Anda tidak sedang dalam pertarungan!';
    
    player.defense += 5;
    let result = `🛡️ Anda bertahan, defense meningkat sementara!`;

    return enemyTurn() + '\n' + result;
}

function usePotion() {
    let potion = inventory.find(item => item.name === 'Potion');
    
    if (!potion) return '❌️ Anda tidak memiliki potion!';
    if (!inBattle || !inBossfight) return '❌️ Anda tidak sedang dalam pertarungan!';
    
    player.hp = Math.min(player.maxHp, player.hp + 20);
    removeItem('Potion', 1);
    
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    return `🧪 Anda menggunakan potion dan memulihkan 20 HP!` + '\n' + enemyTurn();
}

function enemyTurn() {
    let enemyDamage = Math.max(0, currentEnemy.attack - player.defense);
    
    let beforeHp = player.hp;
    player.hp -= enemyDamage;
    if (player.hp < 0) player.hp = 0;
    
    let enemyAttackMessage = `👿 ${currentEnemy.name} menyerang!\n`;
    enemyAttackMessage += `💥 HP ${player.name}: ${player.hp}/${player.maxHp}`;
    
    if (player.hp <= 0) {
        inBattle = false;
        
        currentEnemy.hp = currentEnemy.maxHp;
        
        return enemyAttackMessage + `\n💀 Anda dikalahkan oleh ${currentEnemy.name}!`;
    }
    
    return enemyAttackMessage;
}

function enemyHeal() {
    if (!inBattle || !currentEnemy) return;

    let healAmount = Math.floor(currentEnemy.maxHp * 0.1);
    if (currentEnemy.hp + healAmount > currentEnemy.maxHp) {
        healAmount = currentEnemy.maxHp - currentEnemy.hp;
    }

    if (healAmount > 0) {
        currentEnemy.hp += healAmount;
        displayMessage(`🩹 ${currentEnemy.name} menyembuhkan diri sebanyak ${healAmount} HP!`);
    }
}

function showQuestProgress() {
    if (quests.length === 0) {
        return '⚠️ Anda belum mengambil quest.';
    }

    return quests.map(q => {
        const progressList = q.objectives.map(obj => {
            const progress = q.progress[obj.item || obj.action] || 0;
            return `- ${obj.item || obj.action}: ${progress}/${obj.required}`;
        }).join('\n');

        return `📜 ${q.name}\n${q.description}\n🎯 Progres:\n${progressList}\n`;
    }).join('\n');
}

function displayQuests() {
    const quests = [
        {
            name: 'Gathering Resources',
            description: 'Kumpulkan berbagai sumber daya untuk memenuhi kebutuhan crafting.',
            objectives: [
                { item: 'Wood', required: 10 },
                { item: 'Stone', required: 5 },
                { item: 'Iron', required: 3 }
            ],
            rewards: [
                { item: 'Money', amount: 100 },
                { item: 'Iron Pickaxe', amount: 1 }
            ]
        },
        {
            name: 'Pet Adventure',
            description: 'Biarkan pet-mu membantu dalam petualangan!',
            objectives: [
                { action: 'adoptPet', required: 1 },
                { action: 'petFindItem', required: 3 }
            ],
            rewards: [
                { item: 'Money', amount: 150 },
                { item: 'Emerald', amount: 1 }
            ]
        }
    ];

    return quests;
}

function showQuests() {
    const availableQuests = displayQuests();
    
    const formattedQuests = availableQuests.map(q => 
        `📜--${q.name }-- \n ${q.description }\n Objectives: \n ${q.objectives.map(obj => `- ${obj.item || obj.action}: ${obj.required}`).join('\n')}\n🏆 Rewards:\n${q.rewards.map(reward => `- ${reward.item}: ${reward.amount}`).join('\n')}`
    ).join('\n\n');

    return `${formattedQuests}`;
}

function updateQuestProgress(action, itemName, amount = 1) {
    let progressMessage = '';
    
    quests.forEach(quest => {
        quest.objectives.forEach(obj => {
            if ((obj.item && obj.item === itemName) || (obj.action && obj.action === action)) {
                quest.progress[obj.item || obj.action] = (quest.progress[obj.item || obj.action] || 0) + amount;
            }
        });
        
        if (isQuestComplete(quest)) {
            let completionMessage = completeQuest(quest);
            progressMessage += completionMessage + '\n';
        }
    });
    
    localStorage.setItem('quests', JSON.stringify(quests));
    getQuestProgress();
    
    if (progressMessage) {
        sendMessage(progressMessage);
    }
    
    return progressMessage || 'Tidak ada progres yang diperbarui.';
}

function takeQuest(questName) {
    const availableQuests = displayQuests();
    const quest = availableQuests.find(q => q.name.toLowerCase() === questName.toLowerCase());
    
    if (!quest) return '❌️ Quest tidak ditemukan!';
    
    if (quests.find(q => q.name === quest.name)) return '❌️ Anda sudah mengambil quest ini!';
    
    quests.push({ ...quest, progress: {} });
    localStorage.setItem('quests', JSON.stringify(quests));
    getQuestProgress();
    
    return `📜 Anda telah mengambil quest: ${quest.name}!`;
}

function isQuestComplete(quest) {
    return quest.objectives.every(obj => (quest.progress[obj.item || obj.action] || 0) >= obj.required);
}

function showCompletionMessage(message) {
    if (!questMessage) return;

    questMessage.textContent = message;
    questMessage.style.display = 'block';

    setTimeout(() => {
        questMessage.style.display = 'none';
    }, 3000);
}

function completeQuest(quest) {
    let rewardText = `Selamat! Anda menyelesaikan quest "${quest.name}" dan mendapatkan hadiah:\n`;
    
    if (!quest.rewards || quest.rewards.length === 0) {
        rewardText += '(Tidak ada reward 😢)';
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
        questList.innerHTML = 'Belum ada quest yang diambil.';
        return;
    }

    let questText = quests.map(q => {
        const progressList = q.objectives.map(obj => {
            const progress = q.progress[obj.item || obj.action] || 0;
            return `- ${obj.item || obj.action}: ${progress}/${obj.required}`;
        }).join('\n');

        return `<b>${q.name}</b><br>${q.description}<br>🎯 Progress:<br>${progressList}<br>`;
    }).join('\n');

    questList.innerHTML = questText;
}

function formatItemName(itemName) {
    return itemName.charAt(0).toUpperCase() + itemName.slice(1).toLowerCase();
}

function sellItem(itemName, amount) {
    const sellPrices = {
        'Wood': 25,
        'Stick': 10,
        'Stone': 45,
        'Iron': 140,
        'Gold': 250,
        'Emerald': 1450,
        'Diamond': 2500,
        'Netherite': 25000,
        'Silver': 190,
        'Coal': 60,
        'Copper': 100,
        'Amethyst': 725,
        'Quartz': 340,
        'Potion': 480
    };
    
    itemName = formatItemName(itemName);
    
    const invItem = inventory.find(i => i.name === itemName);
    if (!invItem || invItem.count < amount) {
        return `❌️ Anda tidak memiliki cukup ${itemName} untuk dijual!`;
    }
    
    if (!sellPrices[itemName]) {
        return `❌️ Item ${itemName} tidak bisa dijual!`;
    }
    
    const totalSellPrice = sellPrices[itemName] * amount;
    
    removeItem(itemName, amount);
    
    addStackableItem('Money', totalSellPrice);
    
    return `✅️ Anda menjual ${amount} ${itemName} dan mendapatkan ${totalSellPrice} Money!`;
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
        { name: 'Quartz', price: 375 },
        { name: 'Potion', price: 500 }
    ];
    
    itemName = formatItemName(itemName);
    
    const selectedItem = shopItems.find(i => i.name === itemName);
    if (!selectedItem) return `❌️ Item ${itemName} tidak tersedia untuk dibeli!`;
    
    const totalPrice = selectedItem.price * amount;
    const moneyItem = inventory.find(i => i.name === 'Money');
    
    if (!moneyItem || moneyItem.count < totalPrice) {
        return `❌️ Anda tidak memiliki cukup Money untuk membeli ${amount} ${itemName}!`;
    }
    
    removeItem('Money', totalPrice);
    
    addStackableItem(itemName, amount);
    
    return `✅️ Anda membeli ${amount} ${itemName} seharga ${totalPrice} Money!`;
}

function adoptPet(petName, petType) {
    const validPets = ['dog', 'cat', 'fox'];
    if (!validPets.includes(petType)) {
        return '❌️ Jenis pet tidak valid!';
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
        
        updateQuestProgress('adoptPet', null, 1);
        
        localStorage.setItem('pets', JSON.stringify(pets));
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return `✅️ Anda mengadopsi pet ${petType} bernama ${petName}!`;
    } else {
        return '❌️ Anda tidak memiliki cukup Emerald untuk mengadopsi pet!';
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
            updateQuestProgress('petFindItem', null, 1);
            bonus += `Pet ${pet.name} (🐶 Dog) menemukan ${resource} lainnya! `;
        }

        if (pet.type === 'cat' && Math.random() < petChance) {
            const findChance = Math.random() * 100;
            let foundItem = 'Emerald';
            if (findChance > 70) foundItem = 'Diamond';
            if (findChance > 99) foundItem = 'Netherite';
            addStackableItem(foundItem, 1);
            gainedExp = 1;
            updateQuestProgress('petFindItem', null, 1);
            bonus += `Pet ${pet.name} ( 🐱 Cat) menemukan ${foundItem}! `;
        }

        if (pet.type === 'fox' && Math.random() < petChance) {
            const randomItems = ['Gold', 'Iron', 'Coal'];
            const foundItem = randomItems[Math.floor(Math.random() * randomItems.length)];
            addStackableItem(foundItem, 1);
            gainedExp = 1;
            updateQuestProgress('petFindItem', null, 1);
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
        return '⚠️ Anda belum meliliki pet.'
    }
    return pets.map(pet => `Nama: ${pet.name}, Jenis: ${pet.type}, Level: ${pet.level}, Exp: ${pet.exp}`).join(`\n`);
}

function chopTree() {
    const chance = Math.floor(Math.random() * 2) + 1;
    let item = chance === 1 ? 'Wood' : 'Stick';
    
    addStackableItem(item, 1);
    
    updateQuestProgress('chopTree', item);
    
    return `Anda mendapatkan ${item}!`;
}

function getItem(itemName) {
    return inventory.find(item => item.name === itemName) || null;
}

function mineResources() {
    const pickaxes = ['Netherite Pickaxe', 'Diamond Pickaxe', 'Gold Pickaxe', 'Iron Pickaxe', 'Stone Pickaxe', 'Wooden Pickaxe'];
    const pickaxe = inventory.find(item => pickaxes.includes(item.name));
    
    if (!pickaxe) {
        return '❌️ Anda tidak memiliki Pickaxe! Craft satu terlebih dahulu.';
    }
    
    pickaxe.durability--;
    if (pickaxe.durability <= 0) {
        inventory.splice(inventory.indexOf(pickaxe), 1);
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return '⚠️ Pickaxe Anda telah hancur! Anda perlu membuat yang baru.';
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
            updateQuestProgress('mine', foundResource);
            break;
        }
    }
    
    const petBonus = getPetBonus(foundResource);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    return `⛏️ Anda mendapatkan ${foundResource}! ${petBonus}(Durability Pickaxe: ${pickaxe.durability})`;
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
        return '⚠️ Inventori Anda kosong.';
    }
    return 'Inventori Anda:\n' +
        inventory.map(i => `${i.name} x${i.count}`).join('\n');
}

function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

const questions = [
    { question: 'Apa ibu kota Indonesia?', answer: 'jakarta' },
    { question: '30×34 berapa?', answer: '1020' },
    { question: 'Siapa penemu bola lampu?', answer: 'thomas alva edison' },
    { question: 'Hewan tercepat di dunia?', answer: 'cheetah' },
    { question: 'Apa nama planet terbesar di tata surya?', answer: 'yupiter' },
    { question: 'Berapa jumlah pulau yang ada di Indonesia? A:10.000 B: 13.000 C:17.000 D:20.000', answer: 'c' },
    { question: 'Siapa yang menulis novel "Laskar Pelangi"?', answer: 'andrea hirata' },
    { question: 'Apa simbol kimia untuk air?', answer: 'h2o' },
    { question: 'Siapa presiden pertama Indonesia?', answer: 'soekarno' },
    { question: 'Apa nama gunung tertinggi di dunia?', answer: 'everest' },
    { question: '1 Dekade = berapa tahun?', answer: '10' },
    { question: 'Apa ibukota Jepang?', answer: 'tokyo' },
    { question: 'Tahun berapa perang dunia II berakhir?', answer: '1945' },
    { question: 'Negara terbesar di dunia berdasarkan luas wilayah adalah?', answer: 'rusia' },
    { question: 'Jika sebuah segitiga memiliki sisi 3 cm, 4 cm, dan 5 cm, maka jenis segitiga ini adalah?', answer: 'segitiga siku-siku' },
    { question: 'Apa nama proses tumbuhan membuat makanan sendiri?', answer: 'fotosintesis' },
    { question: 'Hewan apa yang dikenal sebagai mamalia terbesar di dunia?', answer: 'paus biru' },
    { question: 'Apa yang bisa dipatahkan, tapi tak pernah dipegang?', answer: 'janji' },
    { question: 'Apa yang naik, tapi tidak pernah turun?', answer: 'umur' },
    { question: 'Hewan apa yang memiliki tinju terkuat?', answer: 'udang pistol' }
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
            return `✅️ Nama Anda berhasil diubah menjadi ${userName}!`;
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
        return 'Command: rank, weapon list (common/uncommon/rare/legendary/mythic/celestial), rules, admin slot, info server, info bot, changelog, support, quiz, calc, achievement, ganti nama, info achievement, inv, mine, craft (wooden pickaxe/stone pickaxe/iron pickaxe/gold pickaxe/diamond pickaxe/netherite pickaxe), chop a tree, adopt [nama_pet] [jenis_pet], my pets, buy [nama_item] [jumlah], sell [nama_item] [jumlah], quests, take quest [nama_quest], my quests, quest progress, clear chat, fight, attack, defend, use potion, go [place], adventure, places, current place, get celestial catalyst';
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
        return '⚠️ Gunakan weapon list (common/uncommon/rare/legendary/mythic/celestial)!';
    } else if (message === 'admin slot') {
        return 'Slot Admin Sisa 9';
    } else if (message === 'info server') {
        return 'Server: Legendary Elden Craft, Dibuat pada tanggal __/__/____, Pembuat Server: Rizkiwibu9696';
    } else if (message === 'info bot') {
        return `Nama Bot: Legendary Bot, Dibuat Oleh CO-OWNER Legendary Elden Craft (DJMoonZHX72), Versi Bot: ${botVersion}`;
    } else if (message === 'changelog') {
        return '1.0.0: created bot, 1.1.0: added player info, menu, & rank, 1.2.0: added weapon list, rules, admin slot, info server, & info bot, 1.2.1: added changelog, & support, 1.4.0: added calculator, 1.5.0: added achievement, 1.5.1: updated achievement & quiz, 1.6.0: added name, 1.6.1: bugfix, 1.7.0: Updated Weapon List, 1.8.0: Updated Achievement System, 1.9.0: added leaderboard, 1.9.1: Fixed Quiz Bug & added fade animation, 1.10.0: Added Inventory, 1.11.0: added mine, 1.12.0: updated send button design, 1.13.0: bugfix and add crafting tools, 1.13.1: bugfix, 1.14.0: added pets, 1.15.1: shop, style update, & removed leaderboard, 1.16.0: added quest, code efficiency, 1.17.1: added fight, go, adventure, bugfix, more code efficiency';
    } else if (message === 'support') {
        return 'DJMoonZHX72: https://youtube.com/@DJMoonZHX72  https://www.instagram.com/djmoonzhx72/profilecard/?igsh=MXhhczVneWtld3RpdQ==  https://whatsapp.com/channel/0029VarfkCz9mrGkIcsHrW1D https://github.com/DJMoonZHX72 Rizkiwibu9696: https://whatsapp.com/channel/0029Var7OtgGzzKU3Qeq5s09 https://www.instagram.com/ikikidal_03/profilecard/?igsh=dnVnMW5zOXo3dTFo , Legendary Craft: https://whatsapp.com/channel/0029VakZDNU9Gv7TRP0TH53K';
    } else if (message === 'info achievement') {
        return 'info: Beginner: 5 jawaban benar di quiz. Expert: 20 jawaban benar di quiz. Advanced: 40 jawaban benar di quiz. Pro: 60 jawaban benar di quiz. Elite: 80 jawaban benar di quiz. God: 100 jawaban benar di quiz. Find The Secret: Temukan Rahasia. AFK?: diam di chatbot ini tanpa melakukan apapun selama 1 jam 🗿, Diamonds?: Dapatkan diamond';
    } else if (message === 'anothersecret?') {
        return addStackableItem('Secret Coin', 1);
    } else if (message === 'chop a tree') {
        return chopTree()
    } else if (message.startsWith('craft ')) {
        let itemName = message.replace('craft ', '');
        if (itemName.includes('pickaxe')) {
            return craftTools(itemName);
        } else if (itemName.includes('sword') || itemName.includes('axe') || itemName.includes('claw')) {
            return craftWeapon(itemName);
        } else {
            return craftItem(itemName);
        }
    } else if (message === '自動マイニング') {
        return autoMine()
    } else if (message.startsWith('adopt ')) {
        if (args.length === 3) {
            return adoptPet(args[1], args[2]);
        }
        return '⚠️ Format perintah salah! Gunakan: adopt [nama_pet] [jenis_pet]'
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
    } else if (message === 'オートアドベンチャー') {
        return autoAdventure();
    } else if (message.startsWith('buy ')) {
        if (args.length === 3) {
            return buyItem(args[1], args[2]);
        }
        return '⚠️ Format perintah salah! Gunakan: buy [nama_item] [jumlah]'
    } else if (message.startsWith('sell ')) {
        if (args.length === 3) {
            return sellItem(args[1], args[2]);
        }
        return '⚠️ Format perintah salah! Gunakan: sell [nama_item] [jumlah]';
    } else if (message === 'quests') {
        return showQuests();
    } else if (message.startsWith('take quest ')) {
        return takeQuest(message.replace('take quest ', ''));
    } else if (message === 'my quests') {
        return quests.length ? quests.map(q => `${q.name} - ${q.progress ? 'Sedang dikerjakan' : 'Belum dimulai'}`).join('\n') : '❌️ Anda belum mengambil quest.';
    } else if (message === 'quest progress') {
        let progress = showQuestProgress();
        return progress;
    } else if (message === 'clear chat') {
        chatbox.innerHTML = '';
        return '✅️ Chat berhasil dibersihkan!';
    } else if (message === 'fight') {
        return startFight();
    } else if (message === 'attack') {
        if (inBattle) {
            attackEnemy();
        } else if (inBossfight) {
            attackBoss();
        }
    } else if (message === 'defend') {
        return defend();
    } else if (message === 'use potion') {
        return usePotion();
    } else if (message.startsWith('select weapon ')) {
        let weaponName = message.replace('select weapon ', '');
        return selectWeapon(weaponName);
    } else if (message.startsWith('go ')) {
        return setPlace(message.replace('go ', ''));
    } else if (message === 'adventure') {
        return adventure();
    } else if (message === 'current place') {
        return `Tempat saat ini: ${currentPlace.name}.`;
    } else if (message === 'places') {
        return displayPlaces();
    } else if (message === 'get celestial catalyst') {
        return getCelestialCatalyst();
    } else if (message === 'bossfight') {
        return bossfight();
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
        return `✅️ Benar! ${achievementMessage}`;
    } else {
        const correctAnswer = currentQuestion.answer
        quizMode = false;
        currentQuestion = {};
        return `❌️ Salah! Jawabannya adalah: ${correctAnswer}`;
    }
}

function displayAchievements() {
    if (achievements.length === 0) {
        return '⚠️ Anda belum memiliki achievement. Mulai quiz dan dapatkan!';
    }
    return 'Achievements Anda: ' + achievements.join(', ');
}

function calculate(expression) {
    try {
        return `Hasil: ${eval(expression)}`;
    } catch {
        return '❌️ Ekspresi tidak valid. Contoh penggunaan: calc 1+1, calc 2-1, calc 2*2, calc 4/2';
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
    
    const selectedRecipe = recipe.find(r => r.item.toLowerCase() === item);
    
    if (!selectedRecipe) {
        return '⚠️ Resep tidak ditemukan.';
    }
    
    for (let material of selectedRecipe.materials) {
        const invItem = getItem(material.name);
        if (!invItem || invItem.count < material.count) {
            return `❌️ Anda tidak memiliki cukup ${material.name} untuk membuat ${item}.`;
        }
    }
    
    for (let material of selectedRecipe.materials) {
        removeItem(material.name, material.count);
    }
    
    inventory.push({ name: selectedRecipe.item, count: 1, durability: selectedRecipe.durability });
    localStorage.setItem('inventory', JSON.stringify(inventory));

    return `🛠 Anda telah berhasil membuat ${selectedRecipe.item} dengan durability ${selectedRecipe.durability}!`;
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
            return '⚠️ Pet tidak ditemukan!';
        }
    }
}

function makeUnbreakable() {
    if (tag === 'シ') {
        let pickaxe = inventory.find(item => item.name.includes('Pickaxe'));
        if (!pickaxe) return '❌️ Anda tidak memiliki pickaxe!';
        
        pickaxe.durability = Infinity;
        localStorage.setItem('inventory', JSON.stringify(inventory));
        return '[Secret Command] Pickaxe sekarang tidak bisa hancur! シ';
    }
}

function autoChop() {
    if (tag === 'シ') {
        setInterval(chopTree,0);
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
            return '⚠️ Pet tidak ditemukan!';
        }
    }
}

function autoAdventure() {
    if (tag === 'シ') {
        setInterval(adventure, 0);
    }
    return '[Secret command] autoAdventure aktif シ';
}
