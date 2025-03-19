console.warn('quest.js loaded');

export function getNewQuest() {
    let questIndex = JSON.parse(localStorage.getItem('questIndex')) || 0;
    
    if (questIndex >= quests.length) {
        return "Semua quest telah selesai! 🎉";
    }
    
    const newQuest = quests[questIndex];
    localStorage.setItem('quest', JSON.stringify(newQuest));
    localStorage.setItem('questIndex', JSON.stringify(questIndex));
    
    return `Quest baru: Kumpulkan ${newQuest.get.map(q => `${q.count} ${q.item}`).join(', ')} untuk mendapatkan ${newQuest.reward.map(r => `${r.count} ${r.item}`).join(', ')}.`;
}

export function checkQuestCompletion() {
    const quests = [
        { get: [{ item: 'Iron', count: 15 }], reward: [{ item: 'Emerald', count: 1 }] },
        { get: [{ item: 'Gold', count: 20 }], reward: [{ item: 'Emerald', count: 2 }] },
        { get: [{ item: 'Emerald', count: 5 }], reward: [{ item: 'Iron', count: 3 }, { item: 'Diamond', count: 1 }] }
    ];
    
    const storedQuest = JSON.parse(localStorage.getItem('quest'));
    if (!storedQuest) {
        return 'Tidak ada quest yang sedang berjalan.';
    }
    
    let isComplete = storedQuest.get.every(q => {
        const item = inventory.find(i => i.name === q.item);
        return item && item.count >= q.count;
    });
    
    if (isComplete) {
        storedQuest.get.forEach(q => {
            removeItem(q.item, q.count);
        });
        
        storedQuest.reward.forEach(r => {
            addStackableItem(r.item, r.count);
        });
        
        let questIndex = JSON.parse(localStorage.getItem('questIndex')) || 0;
        questIndex++;
        localStorage.setItem('questIndex', JSON.stringify(questIndex));
        
        localStorage.removeItem('quest');
        return `Quest selesai! Anda mendapatkan ${storedQuest.reward.map(r => `${r.count} ${r.item}`).join(', ')}.\n${getNewQuest()}`;
    } else {
        return `Quest belum selesai! Anda masih perlu mengumpulkan ${storedQuest.get.map(q => `${q.count} ${q.item}`).join(', ')}.`;
    }
}
