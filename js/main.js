'use strict';

document.addEventListener('DOMContentLoaded', () => UI.createFloaties());

function goTo(id) { UI.goTo(id); }

function confirmBack() {
    clearInterval(Game.getState().timerInterval);
    UI.showToast('🏠 ¡Volviendo al menú!', false);
    setTimeout(() => UI.goTo('level'), 600);
}

function selectChar(card, emoji, name, desc) {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    const char = CHARACTERS.find(c => c.emoji === emoji) || { emoji, name, desc, role: '' };
    Game.setCharacter(char);
    document.getElementById('btn-choose-char').style.display = 'block';
}

function startGame(levelIdx) {
    Game.startGame(levelIdx);
    UI.goTo('game');
    UI.renderRound();
}

function replayLevel() { startGame(Game.getState().levelIdx); }

function handleIngredientClick(id) {
    const result = Game.addIngredient(id);
    if (result === 'already-added') { UI.showToast(FEEDBACK.alreadyAdded, true); return; }
    if (result === 'wrong') {
        UI.highlightBtn(id, 'wrong');
        UI.showToast(randomFrom(FEEDBACK.wrongIng), true);
        UI.updateHUD(); return;
    }
    if (result === 'correct' || result === 'all-done') {
        const added = Game.getState().addedIngredients.at(-1);
        UI.highlightBtn(id, 'correct');
        UI.markOrderDone(added.id);
        UI.renderPizza(); UI.renderSteps();
        if (result === 'all-done') {
            UI.showActionButtons();
            UI.showToast('🍕 ¡Todos los ingredientes! ¡A hornear!', false);
        } else {
            UI.showToast(formatPhrase(randomFrom(FEEDBACK.correctIng), { emoji: added.emoji, name: added.name }), false);
        }
    }
}

function startBaking() {
    Game.bake(() => {
        UI.renderSteps(); UI.updateActionTitle('¡Córtala en porciones! 🔪');
        UI.showChefBadge(true); UI.renderPizza();
        UI.showToast('🔥 ¡Pizza perfectamente horneada!', false);
    });
}

function cutPizza() {
    if (!Game.cut()) return;
    UI.renderPizza(); UI.renderSteps();
    UI.updateActionTitle('¡Sírvela al cliente! 🍽️');
    UI.showToast('🔪 ¡Cortada perfectamente!', false);
}

function servePizza() {
    const result = Game.serve();
    if (!result) return;
    UI.updateHUD();
    UI.showToast('+' + result.pts + ' puntos! 🌟', false);
    if (result.finished) {
        setTimeout(() => UI.showResults(), 1400);
    } else {
        setTimeout(() => {
            UI.showToast(randomFrom(FEEDBACK.roundComplete), false);
            setTimeout(() => { Game.beginRound(); UI.renderRound(); }, 900);
        }, 1000);
    }
}