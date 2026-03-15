'use strict';

document.addEventListener('DOMContentLoaded', ()=>UI.createFloaties());

function goTo(id){ UI.goTo(id); }

function confirmBack(){
  clearInterval(Game.getState().timerInterval);
  PizzaCutter.destroy();
  UI.showToast('🏠 ¡Volviendo al menú!',false);
  setTimeout(()=>UI.goTo('level'),600);
}

function selectChar(card,emoji,name,desc){
  document.querySelectorAll('.char-card').forEach(c=>c.classList.remove('selected'));
  card.classList.add('selected');
  const char=CHARACTERS.find(c=>c.emoji===emoji)||{emoji,name,desc,role:''};
  Game.setCharacter(char);
  document.getElementById('btn-choose-char').style.display='block';
}

function startGame(levelIdx){
  Game.startGame(levelIdx);
  UI.goTo('game');
  UI.renderRound();
}

function replayLevel(){ startGame(Game.getState().levelIdx); }

function handleIngredientClick(id){
  const result=Game.addIngredient(id);
  if(result==='already-added'){ UI.showToast(FEEDBACK.alreadyAdded,true); return; }
  if(result==='wrong'){
    UI.highlightBtn(id,'wrong');
    UI.showToast(randomFrom(FEEDBACK.wrongIng),true);
    UI.updateHUD(); return;
  }
  if(result==='correct'||result==='all-done'){
    const added=Game.getState().addedIngredients.at(-1);
    UI.highlightBtn(id,'correct');
    UI.markOrderDone(added.id);
    UI.renderPizza(); UI.renderSteps();
    if(result==='all-done'){
      Game.getState().step = 1;
      UI.showActionButtons();
      UI.showToast('🍕 ¡Todos los ingredientes! ¡A hornear!',false);
    } else {
      UI.showToast(formatPhrase(randomFrom(FEEDBACK.correctIng),{emoji:added.emoji,name:added.name}),false);
    }
  }
}

function startBaking(){
  const state = Game.getState();
  if(state.step!==1){
    UI.showToast('🛑 Primero agrega todos los ingredientes antes de hornear.',true);
    return;
  }

  const bakeBtn = document.querySelector('.btn-bake');
  if(bakeBtn){
    bakeBtn.disabled = true;
    bakeBtn.style.opacity = '0.4';
    bakeBtn.style.cursor = 'not-allowed';
  }

  Game.bake(()=>{
    UI.renderSteps();
    UI.showChefBadge(true);
    UI.renderPizza();
    UI.showToast('🔥 ¡Pizza horneada! ¡Ahora córtala!',false);
    UI.showCuttingPanel();

    if(bakeBtn){
      bakeBtn.disabled = false;
      bakeBtn.style.opacity = '1';
      bakeBtn.style.cursor = 'pointer';
    }
  });
}

function serveCutPizza(){
  const ok=Game.finalizeCut();
  if(!ok){ UI.showToast('✂️ ¡Haz al menos 2 cortes primero!',true); return; }
  PizzaCutter.destroy();
  UI.renderPizza(); UI.renderSteps();
  UI.updateActionTitle('¡Sírvela al cliente! 🍽️');
  document.getElementById('cut-controls').style.display='none';
  document.getElementById('final-serve').style.display='flex';
}

function finalServe(){
  const result=Game.serve();
  if(!result) return;
  document.getElementById('final-serve').style.display='none';
  UI.updateHUD();
  UI.showToast('+'+result.pts+' puntos! 🌟',false);
  if(result.finished){
    setTimeout(()=>UI.showResults(),1400);
  } else {
    setTimeout(()=>{
      UI.showToast(randomFrom(FEEDBACK.roundComplete),false);
      setTimeout(()=>{ Game.beginRound(); UI.renderRound(); },900);
    },1000);
  }
}

function resetCuts(){
  PizzaCutter.destroy();
  const s=Game.getState();
  s.cutLines=[]; s.cuttingReady=false; s.sliceCount=0;
  document.getElementById('slice-count').textContent='0 porciones';
  UI.renderPizza();
  UI.showCuttingPanel();
  UI.showToast('🔄 ¡Inténtalo de nuevo!',false);
}