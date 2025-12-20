// --- 1. GAME DATA & CONFIGURATION ---

const INITIAL_TEAMS = [
    { id: 1, name: "Team Moses", color: "bg-red-500", score: 0 },
    { id: 2, name: "Team David", color: "bg-blue-500", score: 0 },
    { id: 3, name: "Team Elijah", color: "bg-yellow-500", score: 0 }
];

// 40+ Items to ensure grid is full
const RAW_QUESTIONS = [
    { q: "Who built the Ark?", a: "Noah", points: 100 },
    { q: "First book of the Bible?", a: "Genesis", points: 100 },
    { q: "Who defeated Goliath?", a: "David", points: 100 },
    { q: "How many disciples did Jesus have?", a: "12", points: 100 },
    { q: "Who created the world?", a: "God", points: 100 },
    { q: "Where was Jesus born?", a: "Bethlehem", points: 100 },
    { q: "Who were the first man and woman?", a: "Adam & Eve", points: 100 },
    { q: "What animal tempted Eve?", a: "Serpent", points: 100 },
    { q: "Who was swallowed by a great fish?", a: "Jonah", points: 200 },
    { q: "Which city's walls fell down?", a: "Jericho", points: 200 },
    { q: "Who betrayed Jesus?", a: "Judas", points: 200 },
    { q: "Longest book in the Bible?", a: "Psalms", points: 200 },
    { q: "Who denied Jesus 3 times?", a: "Peter", points: 200 },
    { q: "Who was the strongest man?", a: "Samson", points: 200 },
    { q: "Wife of Abraham?", a: "Sarah", points: 200 },
    { q: "Who received the 10 Commandments?", a: "Moses", points: 200 },
    { q: "Who led Israel out of Egypt?", a: "Moses", points: 300 },
    { q: "First king of Israel?", a: "Saul", points: 300 },
    { q: "Last book of the New Testament?", a: "Revelation", points: 300 },
    { q: "Who was thrown into the lion's den?", a: "Daniel", points: 300 },
    { q: "River Jesus was baptized in?", a: "Jordan", points: 300 },
    { q: "Brother of Moses?", a: "Aaron", points: 300 },
    { q: "Who climbed a sycamore tree?", a: "Zacchaeus", points: 300 },
    { q: "Who killed Abel?", a: "Cain", points: 300 },
    { q: "Who wrote most NT letters?", a: "Paul", points: 400 },
    { q: "Wood used for the Ark?", a: "Gopher wood", points: 400 },
    { q: "Oldest man in the Bible?", a: "Methuselah", points: 400 },
    { q: "Who had a coat of many colors?", a: "Joseph", points: 400 },
    { q: "Who asked for wisdom?", a: "Solomon", points: 400 },
    { q: "Who was the first martyr?", a: "Stephen", points: 400 },
    { q: "Mother of John the Baptist?", a: "Elizabeth", points: 400 },
    { q: "Shortest verse in the Bible?", a: "Jesus wept", points: 400 },
    { q: "Who interpreted dreams?", a: "Daniel", points: 500 },
    { q: "Queen who saved her people?", a: "Esther", points: 500 },
    { q: "Lot's wife became a pillar of...?", a: "Salt", points: 500 },
    { q: "Food God sent in the wilderness?", a: "Manna", points: 500 },
    { q: "Who walked on water with Jesus?", a: "Peter", points: 500 },
    { q: "Mountain where Noah's Ark landed?", a: "Ararat", points: 500 },
    
    // SPECIALS
    { type: 'blessing', q: "DIVINE FAVOR!", a: "Free Points!", points: 200 },
    { type: 'trial', q: "FLOOD WARNING!", a: "Lose Points", points: -100 },
    { type: 'blessing', q: "MANNA FROM HEAVEN", a: "Bonus Points", points: 300 },
    { type: 'trial', q: "LION'S DEN", a: "Danger!", points: -200 },
    { type: 'blessing', q: "MIRACLE CATCH", a: "Big Bonus!", points: 500 },
    { type: 'trial', q: "WALLS FALL DOWN", a: "Collapse!", points: -300 },
    { type: 'swap', q: "DIVINE INTERVENTION!", a: "Swap Scores?", points: 0 },
    { type: 'swap', q: "THE LAST SHALL BE FIRST", a: "Swap Scores?", points: 0 },
];

// --- 2. STATE MANAGEMENT ---
let state = {
    screen: 'intro', // 'intro' or 'game'
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    gridItems: [],
    activeCard: null,
    showAnswer: false,
    winner: null,
    soundEnabled: true,
    swapInitiatorId: null
};

const app = document.getElementById('app');

// --- 3. SOUND ENGINE ---
function playSound(type) {
    if (!state.soundEnabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    // Re-use context if possible, but for simple implementation create new
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === 'click') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.1);
    } 
    else if (type === 'reveal') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.3);
    }
    else if (type === 'score') {
        // Major Arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.1, now + i * 0.05);
            g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.3);
            o.start(now + i * 0.05);
            o.stop(now + i * 0.05 + 0.4);
        });
    }
    else if (type === 'trial') {
        [100, 145].forEach((freq) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = 'sawtooth';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.2, now);
            g.gain.linearRampToValueAtTime(0.01, now + 0.5);
            o.start(now);
            o.stop(now + 0.5);
        });
    }
    else if (type === 'swap') {
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        o1.type = 'sine'; o2.type = 'triangle';
        o1.frequency.setValueAtTime(400, now); o1.frequency.linearRampToValueAtTime(800, now + 0.6);
        o2.frequency.setValueAtTime(404, now); o2.frequency.linearRampToValueAtTime(808, now + 0.6);
        const g = ctx.createGain();
        g.connect(ctx.destination);
        o1.connect(g); o2.connect(g);
        g.gain.setValueAtTime(0.2, now); g.gain.linearRampToValueAtTime(0, now + 0.6);
        o1.start(now); o2.start(now);
        o1.stop(now + 0.6); o2.stop(now + 0.6);
    }
    else if (type === 'win') {
        const melody = [523, 523, 523, 659, 783, 659, 783, 1046];
        melody.forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = 'square';
            o.frequency.value = freq;
            const t = now + i * 0.15;
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            o.start(t);
            o.stop(t + 0.2);
        });
    }
}

// --- 4. GAME LOGIC ---

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initGame() {
    // 1. Prepare Questions
    let pool = [...RAW_QUESTIONS];
    while (pool.length < 40) { pool = pool.concat(RAW_QUESTIONS.slice(0, 40 - pool.length)); }
    const shuffledQuestions = shuffleArray(pool).slice(0, 40);

    // 2. Rumble Numbers (1-40 shuffled)
    const numbers = Array.from({ length: 40 }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray(numbers);

    // 3. Map to Grid
    state.gridItems = shuffledQuestions.map((item, index) => ({
        id: index,
        ...item,
        displayNumber: shuffledNumbers[index],
        cleared: false
    }));

    // 4. Reset Game State
    state.winner = null;
    state.activeCard = null;
    state.showAnswer = false;
    state.swapInitiatorId = null;
    
    playSound('score');
    state.screen = 'game';
    renderApp();
}

function handleTeamNameChange(id, value) {
    const team = state.teams.find(t => t.id === id);
    if (team) team.name = value;
}

function handleCardClick(id) {
    if (state.winner) return;
    const item = state.gridItems.find(i => i.id === id);
    if (item && !item.cleared) {
        playSound('click');
        state.activeCard = item;
        state.showAnswer = false;
        state.swapInitiatorId = null;
        renderApp();
    }
}

function revealAnswer() {
    if (state.activeCard.type === 'swap') playSound('swap');
    else playSound('reveal');
    state.showAnswer = true;
    renderApp();
}

function closeCard() {
    if (state.activeCard) {
        const id = state.activeCard.id;
        const item = state.gridItems.find(i => i.id === id);
        item.cleared = true;
        state.activeCard = null;
        state.swapInitiatorId = null;
        renderApp();
    }
}

function awardPoints(teamId, points) {
    const team = state.teams.find(t => t.id === teamId);
    team.score += points;
    points > 0 ? playSound('score') : playSound('trial');
    closeCard();
}

function manualAdjustScore(teamId, amount) {
    const team = state.teams.find(t => t.id === teamId);
    team.score += amount;
    renderApp();
}

// SWAP LOGIC
function setSwapInitiator(teamId) {
    state.swapInitiatorId = teamId;
    renderApp();
}

function executeSwap(targetTeamId) {
    const initiator = state.teams.find(t => t.id === state.swapInitiatorId);
    const target = state.teams.find(t => t.id === targetTeamId);
    
    const temp = initiator.score;
    initiator.score = target.score;
    target.score = temp;
    
    playSound('swap');
    closeCard();
}

function declareWinner() {
    playSound('win');
    // Sort teams desc
    const ranked = [...state.teams].sort((a,b) => b.score - a.score);
    state.winner = ranked[0];
    renderApp();
}

function goHome() {
    state.screen = 'intro';
    renderApp();
}

// --- 5. RENDER FUNCTIONS (UI) ---

function renderIcons() {
    // Check if lucide is available before calling
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderApp() {
    app.innerHTML = '';
    
    if (state.screen === 'intro') {
        app.innerHTML = renderIntroScreen();
    } else {
        app.innerHTML = renderGameScreen();
    }
    
    // Attach Events after HTML injection
    attachEvents();
    renderIcons();
}

function renderIntroScreen() {
    return `
    <div class="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
        <!-- BG -->
        <div class="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-90"></div>
        <div class="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>

        <div class="z-10 text-center p-6 max-w-5xl w-full flex flex-col items-center animate-fade-in">
            <div class="mb-8 p-4 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl">
                <i data-lucide="trophy" class="w-16 h-16 text-yellow-400 animate-bounce-gentle"></i>
            </div>

            <h1 class="text-6xl md:text-9xl font-black mb-2 tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">RAINBOW</h1>
            <h1 class="text-6xl md:text-9xl font-black mb-6 tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">RUMBLE</h1>
            <h2 class="text-2xl md:text-4xl font-bold mb-16 text-blue-200 tracking-widest uppercase border-b-2 border-blue-400/30 pb-2">Bible Edition</h2>

            <div class="w-full bg-black/20 backdrop-blur-md rounded-3xl p-8 mb-12 border border-white/10">
                <h3 class="text-xl text-white/60 uppercase tracking-widest font-bold mb-6">Setup Teams</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${state.teams.map(team => `
                        <div class="${team.color} p-4 rounded-xl transform hover:-translate-y-1 transition shadow-lg bg-opacity-90">
                            <div class="flex items-center justify-center mb-2 text-white/80"><i data-lucide="users" class="w-6 h-6"></i></div>
                            <input 
                                type="text" 
                                value="${team.name}" 
                                oninput="handleTeamNameChange(${team.id}, this.value)"
                                class="bg-transparent text-center text-xl font-bold text-white border-b border-white/30 focus:border-white focus:outline-none w-full placeholder-white/50"
                            />
                        </div>
                    `).join('')}
                </div>
            </div>

            <button onclick="initGame()" class="group relative px-16 py-6 bg-white text-slate-900 text-3xl font-black rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 uppercase tracking-widest overflow-hidden">
                <span class="relative z-10 flex items-center">Play Game <i data-lucide="arrow-right-left" class="ml-3"></i></span>
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2 skew-x-12 -translate-x-full group-hover:animate-shine"></div>
            </button>

            <div class="mt-16 text-white/40 font-mono text-sm tracking-widest uppercase">
                Created and Developed by: Archie Abona
            </div>
        </div>
    </div>`;
}

function renderGameScreen() {
    return `
    <div class="flex flex-col h-full">
        <!-- Header -->
        <header class="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-md z-10 shrink-0">
            <div class="flex items-center space-x-3">
                <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                    <i data-lucide="trophy" class="text-white w-6 h-6"></i>
                </div>
                <h1 class="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 hidden sm:block">Rainbow Rumble</h1>
            </div>
            <div class="flex items-center space-x-4">
                <button onclick="state.soundEnabled = !state.soundEnabled; renderApp()" class="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-700">
                    <i data-lucide="${state.soundEnabled ? 'volume-2' : 'volume-x'}" class="w-5 h-5"></i>
                </button>
                <button onclick="declareWinner()" class="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold transition shadow-lg">
                    <i data-lucide="award" class="w-4 h-4"></i> <span class="hidden sm:inline">Winner</span>
                </button>
                <button onclick="initGame()" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition" title="Reset Grid">
                    <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                </button>
                <button onclick="goHome()" class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition" title="Home">
                    <i data-lucide="home" class="w-5 h-5"></i>
                </button>
            </div>
        </header>

        <!-- Grid -->
        <main class="flex-1 overflow-y-auto p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div class="w-full max-w-7xl grid grid-cols-5 md:grid-cols-8 gap-2 md:gap-4 mx-auto pb-20">
                ${state.gridItems.map((item) => `
                    <button 
                        onclick="handleCardClick(${item.id})"
                        ${item.cleared ? 'disabled' : ''}
                        class="relative aspect-square rounded-xl shadow-lg transition-all duration-300 transform flex flex-col items-center justify-center overflow-hidden border-b-4 md:border-b-8 
                        ${item.cleared 
                            ? 'bg-slate-800 border-slate-900 opacity-30 scale-95 cursor-default' 
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-800 hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 cursor-pointer group'}"
                    >
                        ${!item.cleared ? `
                            <div class="absolute top-0 left-0 w-8 h-8 md:w-16 md:h-16 bg-white opacity-5 rounded-full -ml-4 -mt-4"></div>
                            <span class="text-2xl md:text-4xl font-black text-white/90 drop-shadow-md z-10">${item.displayNumber}</span>
                            <span class="absolute bottom-1 md:bottom-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/60">
                                ${item.type ? 'Mystery' : item.points}
                            </span>
                        ` : `<i data-lucide="check" class="text-slate-600 w-8 h-8"></i>`}
                    </button>
                `).join('')}
            </div>
        </main>

        <!-- Footer Scoreboard -->
        <footer class="bg-slate-800 border-t border-slate-700 p-2 md:p-4 shadow-lg z-20 shrink-0">
            <div class="max-w-6xl mx-auto grid grid-cols-3 gap-2 md:gap-8">
                ${state.teams.map(team => {
                    const isLeader = Math.max(...state.teams.map(t => t.score)) === team.score && team.score > 0;
                    return `
                    <div class="relative rounded-xl p-2 md:p-3 flex flex-col items-center justify-between transition-all ${team.score >= 1000 ? 'bg-gradient-to-t from-slate-800 to-slate-700 border border-yellow-500/50' : 'bg-slate-700/50'}">
                        ${isLeader ? `<div class="absolute -top-3 bg-yellow-400 text-yellow-900 text-[10px] md:text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm animate-bounce-gentle z-10"><i data-lucide="star" class="w-3 h-3 mr-1 fill-current"></i> LEADER</div>` : ''}
                        <input value="${team.name}" oninput="handleTeamNameChange(${team.id}, this.value)" class="w-full text-center py-1 px-1 rounded-md mb-1 text-white font-bold text-xs md:text-base shadow-sm ${team.color} border-none focus:ring-2 focus:ring-white outline-none" />
                        <div class="flex items-center space-x-2 md:space-x-4">
                            <button onclick="manualAdjustScore(${team.id}, -100)" class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-600 text-slate-300 hover:bg-red-500 hover:text-white transition text-sm font-bold">-</button>
                            <span class="text-2xl md:text-4xl font-black text-white tabular-nums tracking-tighter min-w-[3ch] text-center">${team.score}</span>
                            <button onclick="manualAdjustScore(${team.id}, 100)" class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-600 text-slate-300 hover:bg-green-500 hover:text-white transition text-sm font-bold">+</button>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </footer>

        <!-- Modals -->
        ${renderModal()}
        ${renderWinnerModal()}
    </div>`;
}

function renderModal() {
    if (!state.activeCard) return '';
    const card = state.activeCard;
    const isSwap = card.type === 'swap';
    
    // Icon Logic
    let iconHTML = `<i data-lucide="trophy" class="w-16 h-16 text-yellow-400 mb-4"></i>`;
    let bgClass = "bg-slate-800";
    let borderClass = "border-white";

    if (card.type === 'blessing') {
        iconHTML = `<i data-lucide="gift" class="w-20 h-20 text-yellow-300 mb-4 animate-bounce-gentle"></i>`;
        bgClass = "bg-gradient-to-b from-yellow-900 to-slate-900";
        borderClass = "border-yellow-400";
    } else if (card.type === 'trial') {
        iconHTML = `<i data-lucide="alert-triangle" class="w-20 h-20 text-red-500 mb-4 animate-pulse"></i>`;
        bgClass = "bg-gradient-to-b from-red-900 to-slate-900";
        borderClass = "border-red-500";
    } else if (isSwap) {
        iconHTML = `<i data-lucide="shuffle" class="w-20 h-20 text-purple-400 mb-4 animate-spin-slow"></i>`;
        bgClass = "bg-gradient-to-b from-purple-900 to-slate-900";
        borderClass = "border-purple-500";
    }

    return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="relative w-full max-w-4xl ${bgClass} border-4 ${borderClass} rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center transform transition-all">
            <button onclick="state.activeCard = null; state.swapInitiatorId = null; renderApp()" class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"><i data-lucide="x" class="w-8 h-8"></i></button>
            
            ${card.type ? iconHTML : `<div class="text-yellow-400 text-2xl font-bold mb-2">FOR ${card.points} POINTS</div>`}
            <h3 class="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">${card.q}</h3>

            ${!state.showAnswer ? `
                <button onclick="revealAnswer()" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xl transition shadow-lg mb-8">Reveal Answer</button>
            ` : `
                <div class="mb-8 w-full animate-slide-up">
                    <div class="text-xl text-gray-400 mb-2">Answer:</div>
                    <div class="text-4xl md:text-6xl font-black text-green-400 drop-shadow-md mb-8">${card.a}</div>
                    
                    <!-- ACTIONS -->
                    ${isSwap ? renderSwapUI() : `
                        <div class="w-full">
                            <div class="text-white/60 text-sm uppercase tracking-widest mb-4">Award Points To:</div>
                            <div class="grid grid-cols-3 gap-4">
                                ${state.teams.map(team => `
                                    <button onclick="awardPoints(${team.id}, ${card.points})" class="${team.color} hover:brightness-110 p-4 rounded-xl flex flex-col items-center justify-center text-white transition transform active:scale-95 shadow-lg border-b-4 border-black/20">
                                        <span class="font-bold text-lg truncate w-full">${team.name}</span>
                                        <span class="text-sm opacity-90">${card.points > 0 ? '+' : ''}${card.points}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `}
                </div>
            `}
            ${!isSwap && state.showAnswer ? `<button onclick="closeCard()" class="mt-4 text-gray-400 hover:text-white underline decoration-dashed underline-offset-4">No one answered correctly (Discard)</button>` : ''}
        </div>
    </div>
    `;
}

function renderSwapUI() {
    if (!state.swapInitiatorId) {
        return `
        <div class="w-full bg-black/30 p-6 rounded-2xl border border-white/10">
            <p class="text-white/80 text-lg mb-4 font-bold uppercase tracking-widest">Who found this card?</p>
            <div class="grid grid-cols-3 gap-4">
                ${state.teams.map(team => `
                    <button onclick="setSwapInitiator(${team.id})" class="${team.color} p-4 rounded-xl text-white font-bold hover:scale-105 transition">${team.name}</button>
                `).join('')}
            </div>
        </div>`;
    } else {
        const initiator = state.teams.find(t => t.id === state.swapInitiatorId);
        return `
        <div class="w-full bg-black/30 p-6 rounded-2xl border border-white/10">
            <p class="text-white/80 text-lg mb-4 font-bold uppercase tracking-widest">${initiator.name}, who do you want to swap with?</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${state.teams.filter(t => t.id !== state.swapInitiatorId).map(team => `
                    <button onclick="executeSwap(${team.id})" class="${team.color} p-4 rounded-xl text-white font-bold hover:scale-105 transition border-2 border-white">
                        Swap with ${team.name} (${team.score})
                    </button>
                `).join('')}
                <button onclick="closeCard()" class="bg-slate-600 p-4 rounded-xl text-white font-bold hover:bg-slate-500 transition">Keep My Score</button>
            </div>
        </div>`;
    }
}

function renderWinnerModal() {
    if (!state.winner) return '';
    const winner = state.winner;
    return `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
        <div class="relative w-full max-w-3xl bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-600 p-1 rounded-3xl shadow-2xl overflow-hidden">
            <div class="absolute inset-0 overflow-hidden opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
            <div class="bg-slate-900 rounded-[22px] p-8 md:p-12 text-center relative z-10">
                <button onclick="state.winner = null; renderApp()" class="absolute top-4 right-4 text-white/50 hover:text-white"><i data-lucide="x" class="w-8 h-8"></i></button>
                <i data-lucide="trophy" class="w-32 h-32 text-yellow-400 mx-auto mb-6 animate-bounce-gentle drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"></i>
                <h2 class="text-4xl md:text-6xl font-black text-white mb-2 uppercase tracking-widest">Champion</h2>
                <div class="text-5xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">${winner.name}</div>
                <div class="text-3xl text-white font-bold mb-12 bg-white/10 inline-block px-8 py-2 rounded-full">${winner.score} Points</div>
                <button onclick="initGame()" class="mt-8 px-8 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition">Play Again</button>
            </div>
        </div>
    </div>`;
}

function attachEvents() {
    // Re-bind input events if necessary, though inline events handle most
}

// Init App
renderApp();