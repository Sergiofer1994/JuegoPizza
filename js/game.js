'use strict';

const Game = (() => {
  const state = {
    char:CHARACTERS[0], levelIdx:0, score:0, round:0,
    timerInterval:null, timeLeft:0,
    currentOrder:[], addedIngredients:[], toppingPositions:[],
    panelIngredients:[], step:0, errors:0,
    showCuts:false, cutLines:[], sliceCount:0, cuttingReady:false,
  };

  const getState = ()=>state;
  const getLevel  = ()=>LEVELS[state.levelIdx];

  function setCharacter(c){ state.char=c; }

  function startGame(idx){
    state.levelIdx=idx; state.score=0; state.round=0; state.errors=0;
    clearInterval(state.timerInterval);
    beginRound();
  }

  function beginRound(){
    const lvl=getLevel();
    state.addedIngredients=[]; state.toppingPositions=[];
    state.step=0; state.errors=0; state.showCuts=false;
    state.cutLines=[]; state.sliceCount=0; state.cuttingReady=false;

    const shuffled=shuffleArray(INGREDIENTS);
    state.currentOrder=shuffled.slice(0,lvl.ingCount);

    const required=[...state.currentOrder];
    const others=shuffleArray(INGREDIENTS.filter(i=>!required.find(r=>r.id===i.id))).slice(0,lvl.extraWrong);
    state.panelIngredients=shuffleArray([...required,...others]);

    clearInterval(state.timerInterval);
    if(lvl.time){
      state.timeLeft=lvl.time;
      state.timerInterval=setInterval(()=>{
        state.timeLeft--;
        UI.updateTimer(state.timeLeft);
        if(state.timeLeft<=0){ clearInterval(state.timerInterval); onTimeUp(); }
      },1000);
    }
  }

  function addIngredient(id){
    if(state.step!==0) return 'not-your-turn';
    const ing        =INGREDIENTS.find(i=>i.id===id);
    const isRequired =state.currentOrder.find(i=>i.id===id);
    const alreadyDone=state.addedIngredients.find(i=>i.id===id);
    if(alreadyDone)  return 'already-added';
    if(!isRequired){ state.errors++; state.score=Math.max(0,state.score-10); return 'wrong'; }

    state.addedIngredients.push(ing);
    const ws =document.getElementById('pizza-workspace');
    const pos=PizzaRenderer.randomToppingPos(ws.offsetWidth||220);
    const noEmoji=['tomato','cheese','tomato_slice','cheese_grated'];
    if(!noEmoji.includes(ing.id)){
      state.toppingPositions.push({emoji:ing.emoji,...pos});
    }
    return state.addedIngredients.length===state.currentOrder.length?'all-done':'correct';
  }

  function bake(onComplete){
    if(state.step!==1){
      UI.showToast('🛑 No puedes hornear todavía. Completa los ingredientes primero.', true);
      return;
    }
    const duration=3000,interval=80;
    let elapsed=0,msgIdx=0;
    const ovenBar =document.getElementById('oven-bar');
    const ovenText=document.getElementById('oven-text');
    const msgs    =FEEDBACK.ovenMessages;
    document.getElementById('oven-overlay').style.display='flex';
    ovenBar.style.width='0%';
    const iv=setInterval(()=>{
      elapsed+=interval;
      const pct=Math.min(100,Math.round(elapsed/duration*100));
      ovenBar.style.width=pct+'%';
      const step=Math.floor(pct/25);
      if(step>msgIdx&&step<msgs.length){msgIdx=step;ovenText.textContent=msgs[msgIdx];}
      if(elapsed>=duration){
        clearInterval(iv);
        setTimeout(()=>{
          document.getElementById('oven-overlay').style.display='none';
          state.step=2; onComplete();
        },400);
      }
    },interval);
  }

  function registerCut(slices,ready){
    state.sliceCount=slices; state.cuttingReady=ready;
    state.showCuts=true; state.cutLines=PizzaCutter.getCuts();
  }

  function autoCut(){
    if(state.step!==2) return false;
    const size = 220;
    const s = Math.min(16, 4 * 2);
    const lines = [
      {x1:size/2, y1:5, x2:size/2, y2:size-5},
      {x1:5, y1:size/2, x2:size-5, y2:size/2},
      {x1:10, y1:10, x2:size-10, y2:size-10},
      {x1:10, y1:size-10, x2:size-10, y2:10}
    ];
    state.cutLines = lines;
    state.sliceCount = s;
    state.cuttingReady = true;
    state.showCuts = true;
    return true;
  }

  function finalizeCut(){
    if(state.step!==2||!state.cuttingReady) return false;
    state.step=3; state.cutLines=PizzaCutter.getCuts(); return true;
  }

  function serve(){
    if(state.step!==3) return false;
    clearInterval(state.timerInterval);
    const lvl=getLevel();
    let pts=lvl.scorePerPizza;
    if(lvl.time&&state.timeLeft>0) pts+=state.timeLeft*2;
    pts-=state.errors*15; pts=Math.max(10,pts);
    state.score+=pts; state.round++;
    return {pts,finished:state.round>=lvl.rounds};
  }

  function onTimeUp(){
    UI.showToast(FEEDBACK.timeUp,true);
    PizzaCutter.destroy();
    state.round++;
    const lvl=getLevel();
    setTimeout(()=>{
      if(state.round>=lvl.rounds){UI.showResults();}
      else{
        UI.showToast('🍕 ¡Siguiente pizza!',false);
        setTimeout(()=>{beginRound();UI.renderRound();},900);
      }
    },1200);
  }

  return {getState,getLevel,setCharacter,startGame,beginRound,addIngredient,bake,registerCut,autoCut,finalizeCut,serve};
})();