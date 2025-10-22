// ゲーム状態管理
const gameState = {
    points: 0,
    totalEarned: 0,
    celestialPoints: 0,
    currentDiceSides: 6,
    clickPower: 1,
    dps: 0,
    criticalChance: 0,

    upgrades: {
        // 基礎アップグレード
        autoRoller: { level: 0, cost: 10, costMultiplier: 1.15 },
        diceMaster: { level: 0, cost: 50, costMultiplier: 1.2 },
        luckyHand: { level: 0, cost: 100, costMultiplier: 1.25 },

        // 進化アップグレード
        dice8: { owned: false, cost: 1000 },
        dice10: { owned: false, cost: 10000 },
        dice12: { owned: false, cost: 100000 },
        dice20: { owned: false, cost: 1000000 },
        dice100: { owned: false, cost: 100000000 },

        // マルチプライヤー
        doubleRoll: { level: 0, cost: 5000, costMultiplier: 1.3 },
        tripleRoll: { level: 0, cost: 50000, costMultiplier: 1.35 },
        megaRoll: { level: 0, cost: 100000, costMultiplier: 1.4 },
        ultraRoll: { level: 0, cost: 1000000, costMultiplier: 1.45 },

        // 特殊効果
        lucky7: { owned: false, cost: 25000 },
        goldenDice: { owned: false, cost: 500000 },
        comboSystem: { owned: false, cost: 5000000 },
        feverMode: { owned: false, cost: 50000000 },

        // プレステージ
        blessing: { level: 0, cost: 1 }, // 1CP消費
        divine: { level: 0, cost: 1 },
        timeFlow: { level: 0, cost: 2 },
        infinity: { level: 0, cost: 3 }
    },

    // 特殊状態
    combo: 0,
    feverActive: false,
    lastRollValues: []
};

// ユーティリティ関数
function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(2) + 'B';
    return (num / 1000000000000).toFixed(2) + 'T';
}

function calculateUpgradeCost(baseCost, level, multiplier) {
    return Math.floor(baseCost * Math.pow(multiplier, level));
}

function getNextDiceSides() {
    const evolution = [6, 8, 10, 12, 20, 100];
    const currentIndex = evolution.indexOf(gameState.currentDiceSides);
    return evolution[currentIndex + 1] || 100;
}

// ゲーム計算
function calculateDPS() {
    let dps = 0;

    // オートローラー
    if (gameState.upgrades.autoRoller.level > 0) {
        const avgRoll = (gameState.currentDiceSides + 1) / 2;
        dps += avgRoll * gameState.upgrades.autoRoller.level;
    }

    // ダイスマスター効果
    dps += gameState.upgrades.diceMaster.level * 0.5;

    // マルチプライヤー効果
    let multiplier = 1;
    if (gameState.upgrades.doubleRoll.level > 0) multiplier += gameState.upgrades.doubleRoll.level;
    if (gameState.upgrades.tripleRoll.level > 0) multiplier += gameState.upgrades.tripleRoll.level * 2;
    if (gameState.upgrades.megaRoll.level > 0) multiplier *= (1 + gameState.upgrades.megaRoll.level * 0.5);
    if (gameState.upgrades.ultraRoll.level > 0) multiplier *= (1 + gameState.upgrades.ultraRoll.level);

    dps *= multiplier;

    // 天命ポイントボーナス
    if (gameState.upgrades.blessing.level > 0) {
        dps *= (1 + gameState.upgrades.blessing.level * 0.1);
    }

    // 時の流れ効果
    if (gameState.upgrades.timeFlow.level > 0) {
        dps *= (1 + gameState.upgrades.timeFlow.level * 0.5);
    }

    gameState.dps = dps;
    return dps;
}

function calculateClickPower() {
    let power = 0; // 0からスタート（additive bonus）

    // ダイスマスター効果
    power += gameState.upgrades.diceMaster.level;

    // 神の加護効果（追加ボーナス）
    if (gameState.upgrades.divine.level > 0) {
        power += gameState.upgrades.divine.level;
    }

    gameState.clickPower = power;
    return power;
}

function calculateCriticalChance() {
    let chance = 0;

    // ラッキーハンド効果
    chance += gameState.upgrades.luckyHand.level * 0.05;

    // 神の加護効果
    if (gameState.upgrades.divine.level > 0) {
        chance += gameState.upgrades.divine.level * 0.1;
    }

    gameState.criticalChance = Math.min(chance, 1); // 最大100%
    return gameState.criticalChance;
}

// サイコロを振る
function rollDice() {
    const diceElement = document.getElementById('mainDice');
    const lastRollElement = document.getElementById('lastRoll');

    // アニメーション開始
    diceElement.classList.add('dice-rolling');

    setTimeout(() => {
        diceElement.classList.remove('dice-rolling');

        let totalPoints = 0;
        const rollCount = 1 +
            (gameState.upgrades.doubleRoll.level > 0 ? gameState.upgrades.doubleRoll.level : 0) +
            (gameState.upgrades.tripleRoll.level > 0 ? gameState.upgrades.tripleRoll.level * 2 : 0);

        let rollText = '';
        let isCritical = Math.random() < gameState.criticalChance;

        for (let i = 0; i < rollCount; i++) {
            let roll = Math.floor(Math.random() * gameState.currentDiceSides) + 1;
            roll += gameState.clickPower;

            // クリティカル判定
            if (isCritical) {
                roll *= 2;
            }

            // ラッキー7効果
            if (gameState.upgrades.lucky7.owned && roll === 7) {
                roll *= 7;
                rollText += '🍀7x7! ';
            }

            // ゴールデンダイス効果
            if (gameState.upgrades.goldenDice.owned && Math.random() < 0.01) {
                roll *= 100;
                rollText += '💰GOLDEN! ';
            }

            totalPoints += roll;
        }

        // マルチプライヤー適用
        if (gameState.upgrades.megaRoll.level > 0) {
            totalPoints *= (1 + gameState.upgrades.megaRoll.level * 0.5);
        }
        if (gameState.upgrades.ultraRoll.level > 0) {
            totalPoints *= (1 + gameState.upgrades.ultraRoll.level);
        }

        // 無限の可能性効果
        if (gameState.upgrades.infinity.level > 0) {
            totalPoints *= (1 + gameState.upgrades.infinity.level * 0.05);
        }

        totalPoints = Math.floor(totalPoints);

        // ポイント加算
        addPoints(totalPoints);

        // 表示更新
        if (isCritical) {
            lastRollElement.textContent = `⚡ CRITICAL! +${formatNumber(totalPoints)} ${rollText}`;
            lastRollElement.className = 'text-3xl font-bold mb-2 text-red-400 critical-hit';
            document.body.classList.add('critical-hit');
            setTimeout(() => document.body.classList.remove('critical-hit'), 500);
        } else {
            lastRollElement.textContent = `+${formatNumber(totalPoints)} ${rollText}`;
            lastRollElement.className = 'text-2xl md:text-3xl font-bold mb-2 text-green-400';
        }

        // フローティングテキスト
        createFloatingText(`+${formatNumber(totalPoints)}`, isCritical);

        // ポイント表示アニメーション
        document.getElementById('currentPoints').classList.add('point-gained');
        setTimeout(() => {
            document.getElementById('currentPoints').classList.remove('point-gained');
        }, 600);

    }, 500);
}

// フローティングテキスト作成
function createFloatingText(text, isCritical = false) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    floatingText.style.color = isCritical ? '#ef4444' : '#4ade80';

    const diceRect = document.getElementById('mainDice').getBoundingClientRect();
    floatingText.style.left = diceRect.left + diceRect.width / 2 + 'px';
    floatingText.style.top = diceRect.top + 'px';

    document.body.appendChild(floatingText);

    setTimeout(() => {
        floatingText.remove();
    }, 1000);
}

// ポイント追加
function addPoints(amount, skipChecks = false) {
    gameState.points += amount;
    gameState.totalEarned += amount;
    updateDisplay();
    if (!skipChecks) {
        checkUpgradeAffordability();
        checkPrestigeAvailability();
    }
}

// 表示更新
function updateDisplay() {
    document.getElementById('currentPoints').textContent = formatNumber(gameState.points);
    document.getElementById('totalEarned').textContent = formatNumber(gameState.totalEarned);
    document.getElementById('dps').textContent = formatNumber(gameState.dps);
    document.getElementById('celestialPoints').textContent = gameState.celestialPoints;
    document.getElementById('currentDiceType').textContent = `D${gameState.currentDiceSides}`;

    // 天命ポイント表示
    if (gameState.celestialPoints > 0) {
        document.getElementById('cpDisplay').classList.remove('hidden');
    }
}

// アップグレード購入可能チェック
function checkUpgradeAffordability() {
    document.querySelectorAll('.upgrade-card').forEach(card => {
        const cost = parseFloat(card.dataset.cost);
        const upgradeKey = card.dataset.upgrade;

        // コスト判定
        if (gameState.points >= cost) {
            card.classList.add('affordable');
        } else {
            card.classList.remove('affordable');
        }

        // ロック解除判定
        const category = card.closest('.upgrade-tab-content').id.replace('tab-', '');
        const config = upgradeDefinitions[category]?.[upgradeKey];

        if (config && config.requirement) {
            const isLocked = !config.requirement();
            if (isLocked) {
                card.classList.add('locked');
                const button = card.querySelector('button');
                if (button) button.disabled = true;
            } else {
                card.classList.remove('locked');
                const button = card.querySelector('button');
                const upgrade = gameState.upgrades[upgradeKey];
                if (button && !(upgrade.owned && config.type !== 'repeatable' && config.type !== 'prestige')) {
                    button.disabled = gameState.points < cost;
                }

                // ロック表示テキストを削除
                const lockText = card.querySelector('.text-red-400');
                if (lockText && lockText.textContent.includes('🔒')) {
                    lockText.remove();
                }
            }
        }
    });
}

// プレステージ可能チェック
function checkPrestigeAvailability() {
    const prestigeBtn = document.getElementById('prestigeBtn');
    const prestigeAlert = document.getElementById('prestigeAlert');
    const prestigeReward = document.getElementById('prestigeReward');

    if (gameState.totalEarned >= 1000000) {
        const cpReward = Math.floor(Math.sqrt(gameState.totalEarned / 1000000));
        prestigeReward.textContent = `${cpReward} CP`;
        prestigeBtn.disabled = false;
        prestigeAlert.classList.remove('hidden');
    } else {
        prestigeBtn.disabled = true;
        prestigeAlert.classList.add('hidden');
        prestigeReward.textContent = '0 CP (Need 1M points)';
    }
}

// アップグレード購入
function buyUpgrade(upgradeKey, upgrades) {
    const upgrade = gameState.upgrades[upgradeKey];
    const config = upgrades[upgradeKey];

    let cost;
    if (config.type === 'repeatable') {
        cost = calculateUpgradeCost(upgrade.cost, upgrade.level, upgrade.costMultiplier);
    } else if (config.type === 'prestige') {
        cost = upgrade.cost;
        if (gameState.celestialPoints < cost) return;
    } else {
        cost = upgrade.cost;
    }

    if (config.type === 'prestige') {
        if (gameState.celestialPoints >= cost && (!config.requirement || config.requirement())) {
            gameState.celestialPoints -= cost;
            upgrade.level++;
            updateUpgradeCard(upgradeKey, config);
            calculateDPS();
            calculateClickPower();
            calculateCriticalChance();
            updateDisplay();
        }
    } else if (gameState.points >= cost && (!config.requirement || config.requirement())) {
        gameState.points -= cost;

        if (config.type === 'repeatable') {
            upgrade.level++;
        } else {
            upgrade.owned = true;

            // 進化アップグレードの場合、サイコロの面数を変更
            if (upgradeKey.startsWith('dice')) {
                const sides = parseInt(upgradeKey.replace('dice', ''));
                gameState.currentDiceSides = sides;
            }
        }

        updateUpgradeCard(upgradeKey, config);
        calculateDPS();
        calculateClickPower();
        calculateCriticalChance();
        updateDisplay();
        checkUpgradeAffordability();
    }
}

// アップグレードカード更新
function updateUpgradeCard(upgradeKey, config) {
    const card = document.querySelector(`[data-upgrade="${upgradeKey}"]`);
    if (!card) return;

    const upgrade = gameState.upgrades[upgradeKey];

    if (config.type === 'repeatable') {
        const cost = calculateUpgradeCost(upgrade.cost, upgrade.level, upgrade.costMultiplier);
        card.dataset.cost = cost;
        card.querySelector('.upgrade-level').textContent = `Level: ${upgrade.level}`;
        card.querySelector('.upgrade-cost').textContent = formatNumber(cost);
        card.querySelector('button').disabled = gameState.points < cost;
    } else if (config.type === 'prestige') {
        const cost = upgrade.cost * (upgrade.level + 1);
        card.dataset.cost = cost;
        card.querySelector('.upgrade-level').textContent = `Level: ${upgrade.level}`;
        card.querySelector('.upgrade-cost').textContent = `${cost} CP`;
        card.querySelector('button').disabled = gameState.celestialPoints < cost;
    } else {
        if (upgrade.owned) {
            card.querySelector('button').textContent = 'Owned';
            card.querySelector('button').disabled = true;
        }
    }
}

// アップグレード定義
const upgradeDefinitions = {
    basic: {
        autoRoller: {
            name: 'Auto Roller',
            description: 'Automatically rolls dice every second',
            effect: 'DPS +AvgRoll per level',
            emoji: '⚙️',
            type: 'repeatable'
        },
        diceMaster: {
            name: 'Dice Master',
            description: 'Increases dice roll results',
            effect: '+1 to all rolls per level',
            emoji: '🎯',
            type: 'repeatable'
        },
        luckyHand: {
            name: 'Lucky Hand',
            description: 'Increases critical hit chance',
            effect: '+5% crit chance per level',
            emoji: '🍀',
            type: 'repeatable'
        }
    },
    evolution: {
        dice8: {
            name: '8-Sided Dice',
            description: 'Upgrade to D8',
            effect: 'Max roll: 8',
            emoji: '🎲',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 1000
        },
        dice10: {
            name: '10-Sided Dice',
            description: 'Upgrade to D10',
            effect: 'Max roll: 10',
            emoji: '🎲',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 10000
        },
        dice12: {
            name: '12-Sided Dice',
            description: 'Upgrade to D12',
            effect: 'Max roll: 12',
            emoji: '🎲',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 100000
        },
        dice20: {
            name: '20-Sided Dice',
            description: 'Upgrade to D20',
            effect: 'Max roll: 20',
            emoji: '🎲',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 1000000
        },
        dice100: {
            name: '100-Sided Dice',
            description: 'Upgrade to D100',
            effect: 'Max roll: 100',
            emoji: '🎲',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 100000000
        }
    },
    multiplier: {
        doubleRoll: {
            name: 'Double Roll',
            description: 'Roll additional dice',
            effect: '+1 dice per level',
            emoji: '🎲🎲',
            type: 'repeatable'
        },
        tripleRoll: {
            name: 'Triple Roll',
            description: 'Roll even more dice',
            effect: '+2 dice per level',
            emoji: '🎲🎲🎲',
            type: 'repeatable'
        },
        megaRoll: {
            name: 'Mega Roll',
            description: 'Multiplies all gains',
            effect: 'x1.5 per level',
            emoji: '⭐',
            type: 'repeatable'
        },
        ultraRoll: {
            name: 'Ultra Roll',
            description: 'Massive multiplier',
            effect: 'x2 per level',
            emoji: '💫',
            type: 'repeatable'
        }
    },
    special: {
        lucky7: {
            name: 'Lucky 7',
            description: 'When you roll 7, gain x7 points',
            effect: '7 = x7 points',
            emoji: '🍀',
            type: 'one-time',
            requirement: () => gameState.upgrades.dice8.owned
        },
        goldenDice: {
            name: 'Golden Dice',
            description: '1% chance for x100 points',
            effect: '1% for x100',
            emoji: '💰',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 1000000
        },
        comboSystem: {
            name: 'Combo System',
            description: 'Consecutive high rolls increase multiplier',
            effect: 'Combo bonuses',
            emoji: '🔥',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 10000000
        },
        feverMode: {
            name: 'Fever Mode',
            description: '10 seconds of x10 points',
            effect: 'Activatable',
            emoji: '🌟',
            type: 'one-time',
            requirement: () => gameState.totalEarned >= 100000000
        }
    },
    prestige: {
        blessing: {
            name: "Blessing of Beginning",
            description: "Permanent bonus to all point gains",
            effect: "+10% all points per level",
            emoji: '✨',
            type: 'prestige'
        },
        divine: {
            name: "Divine Protection",
            description: "Increases crit chance and click power",
            effect: "+10% crit & click per level",
            emoji: '🛡️',
            type: 'prestige'
        },
        timeFlow: {
            name: "Flow of Time",
            description: "Increases auto roll speed",
            effect: "+50% DPS per level",
            emoji: '⏰',
            type: 'prestige'
        },
        infinity: {
            name: "Infinite Possibility",
            description: "Reduces all upgrade costs",
            effect: "+5% all gains per level",
            emoji: '♾️',
            type: 'prestige'
        }
    }
};

// アップグレードカード生成
function createUpgradeCard(upgradeKey, config, category) {
    const upgrade = gameState.upgrades[upgradeKey];
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.dataset.upgrade = upgradeKey;

    let cost;
    if (config.type === 'repeatable') {
        cost = calculateUpgradeCost(upgrade.cost, upgrade.level, upgrade.costMultiplier);
    } else if (config.type === 'prestige') {
        cost = upgrade.cost * (upgrade.level + 1);
    } else {
        cost = upgrade.cost;
    }

    card.dataset.cost = cost;

    // ロック判定
    const isLocked = config.requirement && !config.requirement();
    if (isLocked) {
        card.classList.add('locked');
    }

    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <div class="text-xl font-bold text-yellow-400">${config.emoji} ${config.name}</div>
                ${config.type === 'repeatable' || config.type === 'prestige' ?
                    `<div class="upgrade-level text-sm text-gray-400">Level: ${upgrade.level}</div>` : ''}
            </div>
        </div>
        <p class="text-sm text-gray-300 mb-2">${config.description}</p>
        <p class="text-xs text-green-400 mb-3">📈 ${config.effect}</p>
        ${isLocked ? '<p class="text-xs text-red-400 mb-2">🔒 Locked</p>' : ''}
        <div class="flex justify-between items-center">
            <div class="upgrade-cost text-lg font-bold text-yellow-300">
                ${config.type === 'prestige' ? `${cost} CP` : formatNumber(cost) + ' P'}
            </div>
            <button
                class="px-4 py-2 ${upgrade.owned && config.type !== 'repeatable' ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} rounded-lg transition-colors font-semibold"
                ${isLocked || (upgrade.owned && config.type !== 'repeatable' && config.type !== 'prestige') ? 'disabled' : ''}
                onclick="buyUpgrade('${upgradeKey}', upgradeDefinitions.${category})"
            >
                ${upgrade.owned && config.type !== 'repeatable' && config.type !== 'prestige' ? 'Owned' : 'Buy'}
            </button>
        </div>
    `;

    return card;
}

// すべてのアップグレードカードを生成
function initializeUpgrades() {
    const categories = ['basic', 'evolution', 'multiplier', 'special', 'prestige'];

    categories.forEach(category => {
        const container = document.getElementById(`${category}Upgrades`);
        Object.keys(upgradeDefinitions[category]).forEach(key => {
            const card = createUpgradeCard(key, upgradeDefinitions[category][key], category);
            container.appendChild(card);
        });
    });
}

// プレステージ実行
function performPrestige() {
    if (gameState.totalEarned < 1000000) return;

    const cpReward = Math.floor(Math.sqrt(gameState.totalEarned / 1000000));

    if (confirm(`Prestige and gain ${cpReward} Celestial Points?\n\nYou will lose all points and upgrades, but keep Celestial Points and Prestige upgrades.`)) {
        gameState.celestialPoints += cpReward;

        // リセット
        gameState.points = 0;
        gameState.totalEarned = 0;
        gameState.currentDiceSides = 6;
        gameState.clickPower = 1;
        gameState.dps = 0;
        gameState.criticalChance = 0;

        // 通常アップグレードをリセット
        Object.keys(gameState.upgrades).forEach(key => {
            if (!['blessing', 'divine', 'timeFlow', 'infinity'].includes(key)) {
                if (gameState.upgrades[key].level !== undefined) {
                    gameState.upgrades[key].level = 0;
                }
                if (gameState.upgrades[key].owned !== undefined) {
                    gameState.upgrades[key].owned = false;
                }
            }
        });

        // UI再構築
        document.getElementById('basicUpgrades').innerHTML = '';
        document.getElementById('evolutionUpgrades').innerHTML = '';
        document.getElementById('multiplierUpgrades').innerHTML = '';
        document.getElementById('specialUpgrades').innerHTML = '';
        document.getElementById('prestigeUpgrades').innerHTML = '';

        initializeUpgrades();
        calculateDPS();
        calculateClickPower();
        calculateCriticalChance();
        updateDisplay();
        checkUpgradeAffordability();
        checkPrestigeAvailability();

        saveGame();
    }
}

// セーブ機能
function saveGame() {
    const saveData = JSON.stringify(gameState);
    localStorage.setItem('diceInfinitySave', saveData);
    console.log('Game saved!');
}

// ロード機能
function loadGame() {
    const saveData = localStorage.getItem('diceInfinitySave');
    if (saveData) {
        try {
            const loaded = JSON.parse(saveData);
            Object.assign(gameState, loaded);
            console.log('Game loaded!');
            return true;
        } catch (e) {
            console.error('Failed to load save data:', e);
            return false;
        }
    }
    return false;
}

// リセット機能
function resetGame() {
    if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
        localStorage.removeItem('diceInfinitySave');
        location.reload();
    }
}

// タブ切り替え
function setupTabs() {
    const tabs = document.querySelectorAll('.upgrade-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // すべてのタブを非アクティブ化
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.upgrade-tab-content').forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });

            // クリックされたタブをアクティブ化
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            const content = document.getElementById(`tab-${tabName}`);
            content.classList.remove('hidden');
            content.classList.add('active');
        });
    });
}

// 自動セーブ
function startAutoSave() {
    setInterval(() => {
        saveGame();
    }, 30000); // 30秒ごとに自動セーブ
}

// DPS処理
function startDPSLoop() {
    let tickCount = 0;

    setInterval(() => {
        if (gameState.dps > 0) {
            const pointsPerTick = gameState.dps / 10; // 0.1秒ごとに10分の1
            addPoints(pointsPerTick, true); // チェックをスキップ

            tickCount++;
            // 1秒ごと（10ティックごと）にチェック実行
            if (tickCount >= 10) {
                checkUpgradeAffordability();
                checkPrestigeAvailability();
                tickCount = 0;
            }
        }
    }, 100); // 100ms = 0.1秒ごと
}

// 初期化
function init() {
    // セーブデータをロード
    const loaded = loadGame();

    // アップグレードカード生成
    initializeUpgrades();

    // タブ設定
    setupTabs();

    // イベントリスナー設定
    document.getElementById('mainDice').addEventListener('click', rollDice);
    document.getElementById('saveBtn').addEventListener('click', saveGame);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('prestigeBtn').addEventListener('click', performPrestige);

    // 計算を実行
    calculateDPS();
    calculateClickPower();
    calculateCriticalChance();
    updateDisplay();
    checkUpgradeAffordability();
    checkPrestigeAvailability();

    // 自動セーブ開始
    startAutoSave();

    // DPS処理開始
    startDPSLoop();

    console.log('Dice Infinity initialized!');
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', init);
