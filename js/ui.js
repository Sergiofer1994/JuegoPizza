'use strict';

const UI = (() => {
    let toastTimeout = null;

    function goTo(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-' + id)?.classList.add('active');
        window.scrollTo(0, 0);
    }

    function showToast(msg, bad = false) {
        const t = document.getElementById('toast');
        t.textContent = msg; t.className = 'toast ' + (bad ? 'bad' : 'good'); t.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => t.classList.remove('show'), 2000);
    }

    function updateHUD() {
        const { char, score } = Game.getState(), lvl = Game.getLevel();
        document.getElementById('hud-char').textContent = char.emoji;
        document.getElementById('hud-level').textContent = lvl.icon + ' ' + lvl.name;
        document.getElementById('hud-score').textContent = '⭐ ' + score;
        if (!lvl.time) { document.getElementById('hud-timer').textContent = '∞'; document.getElementById('hud-timer').className = 'hud-timer'; }
    }

    function updateTimer(t) {
        const el = document.getElementById('hud-timer');
        el.textContent = '⏱ ' + t + 's';
        el.className = 'hud-timer' + (t <= 10 ? ' urgent' : '');
        document.getElementById('hud-score').textContent = '⭐ ' + Game.getState().score;
    }

    function updateRoundIndicator() {
        const { round } = Game.getState(), lvl = Game.getLevel();
        document.getElementById('round-indicator').textContent = 'Pizza ' + (round + 1) + ' de ' + lvl.rounds;
    }

    function renderOrderCard() {
        const { currentOrder, addedIngredients } = Game.getState();
        document.getElementById('order-ingredients').innerHTML = currentOrder.map(ing => {
            const done = addedIngredients.some(a => a.id === ing.id);
            return `<span class="order-ing ${done ? 'done' : ''}" id="ord-${ing.id}">${ing.emoji} ${ing.name}</span>`;
        }).join('');
    }

    function markOrderDone(id) {
        document.getElementById('ord-' + id)?.classList.add('done');
    }

    function renderPizza() {
        const ws = document.getElementById('pizza-workspace');
        const { addedIngredients, toppingPositions, showCuts } = Game.getState();
        PizzaRenderer.render(ws, addedIngredients, toppingPositions, showCuts);
    }

    function renderSteps() {
        const { step } = Game.getState();
        const steps = ['🥫', '🔥', '🔪', '🍽️'];
        document.getElementById('steps-bar').innerHTML = steps.map((icon, i) => {
            const cls = i < step ? 'done' : i === step ? 'active' : '';
            return `<div class="step-dot ${cls}">${icon}</div>`;
        }).join('');
    }

    function renderIngredientButtons() {
        const { panelIngredients } = Game.getState();
        document.getElementById('ingredients-grid').innerHTML = panelIngredients.map(ing =>
            `<button class="ing-btn" id="ibtn-${ing.id}" onclick="handleIngredientClick('${ing.id}')">
         <span class="ing-emoji">${ing.emoji}</span>
         <span class="ing-name">${ing.name}</span>
       </button>`
        ).join('');
    }

    function highlightBtn(id, type) {
        const btn = document.getElementById('ibtn-' + id);
        if (!btn) return;
        btn.classList.add(type);
        if (type === 'wrong') setTimeout(() => btn.classList.remove('wrong'), 500);
    }

    function showIngredientPanel() {
        document.getElementById('action-title').textContent = 'Elige un ingrediente:';
        document.getElementById('ingredients-grid').style.display = 'grid';
        document.getElementById('action-btns').style.display = 'none';
    }

    function showActionButtons() {
        document.getElementById('action-title').textContent = '¡Ahora hornea tu pizza! 🔥';
        document.getElementById('ingredients-grid').style.display = 'none';
        document.getElementById('action-btns').style.display = 'flex';
    }

    function updateActionTitle(text) {
        document.getElementById('action-title').textContent = text;
    }

    function showChefBadge(show) {
        const b = document.getElementById('chef-badge');
        if (b) b.style.display = show ? 'block' : 'none';
    }

    function renderRound() {
        updateHUD(); updateRoundIndicator(); renderOrderCard();
        renderIngredientButtons(); renderSteps();
        showIngredientPanel(); showChefBadge(false); renderPizza();
    }

    function showResults() {
        const { score, char } = Game.getState(), lvl = Game.getLevel();
        const pct = score / (lvl.rounds * (lvl.scorePerPizza + (lvl.time || 0) * 2));
        const result = RESULTS.find(r => pct >= r.min) || RESULTS[RESULTS.length - 1];
        document.getElementById('result-emoji').textContent = result.emoji;
        document.getElementById('result-title').textContent = result.title;
        document.getElementById('result-score').textContent = score + ' pts';
        document.getElementById('result-stars').textContent = result.stars;
        document.getElementById('result-details').innerHTML =
            `${char.emoji} ${char.name} · Nivel: ${lvl.icon} ${lvl.name}<br>🍕 ${lvl.rounds} pizzas · ❌ ${Game.getState().errors} errores`;
        goTo('results'); launchConfetti();
    }

    function launchConfetti() {
        for (let i = 0; i < 70; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'confetti-piece';
                el.style.cssText = `background:${randomFrom(CONFETTI_COLORS)};left:${Math.random() * 100}vw;top:-14px;transform:rotate(${Math.random() * 360}deg);animation-duration:${1.4 + Math.random() * 0.8}s;border-radius:${Math.random() > 0.5 ? '50%' : '2px'};width:${8 + Math.random() * 8}px;height:${8 + Math.random() * 8}px;`;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2600);
            }, i * 28);
        }
    }

    function createFloaties() {
        const cont = document.getElementById('floaties');
        const emojis = ['🍕', '🧀', '🍅', '🌶️', '🍄', '🫒', '🧅', '🌽'];
        for (let i = 0; i < 18; i++) {
            const el = document.createElement('div');
            el.className = 'floatie'; el.textContent = randomFrom(emojis);
            el.style.cssText = `left:${Math.random() * 100}%;font-size:${1 + Math.random() * 1.8}rem;animation-duration:${8 + Math.random() * 10}s;animation-delay:${-Math.random() * 12}s;`;
            cont.appendChild(el);
        }
    }

    return { goTo, showToast, updateHUD, updateTimer, updateRoundIndicator, renderOrderCard, markOrderDone, renderPizza, renderSteps, renderIngredientButtons, highlightBtn, showIngredientPanel, showActionButtons, updateActionTitle, showChefBadge, renderRound, showResults, createFloaties };
})();