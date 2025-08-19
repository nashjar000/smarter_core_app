
// ===== Persistent state & history =====
const STORAGE_KEY = "smarter5_pro_state_v3_5";
const UNDO_KEY = STORAGE_KEY + "_undo";
const REDO_KEY = STORAGE_KEY + "_redo";
let state = { teams: [], currentTeamIndex: null, globalUsed:{} };
let undoStack = [];
let redoStack = [];
const clone = o => JSON.parse(JSON.stringify(o));

function persistStacks(){ localStorage.setItem(UNDO_KEY, JSON.stringify(undoStack)); localStorage.setItem(REDO_KEY, JSON.stringify(redoStack)); }
function loadStacks(){ try{ undoStack = JSON.parse(localStorage.getItem(UNDO_KEY)||"[]"); redoStack = JSON.parse(localStorage.getItem(REDO_KEY)||"[]"); }catch(e){ undoStack=[]; redoStack=[]; } }

function saveState(push=true){
  if(push){ undoStack.push(clone(state)); redoStack.length=0; persistStacks(); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState(){
  try{ const raw=localStorage.getItem(STORAGE_KEY); if(raw) state=JSON.parse(raw);}catch(e){}
  loadStacks();
}
function undo(){ if(!undoStack.length) return; redoStack.push(clone(state)); state=undoStack.pop(); persistStacks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }
function redo(){ if(!redoStack.length) return; undoStack.push(clone(state)); state=redoStack.pop(); persistStacks(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }
loadState();

// ===== Money ladder & safe zones =====
const MONEY = [0,1000,2000,5000,10000,25000,50000,100000,175000,300000,500000,1000000];
const SAFE_INDEXES = [1,5];
const fmtMoney = idx => '$'+MONEY[idx].toLocaleString();

// ===== Expanded question bank (sample) =====
let questionBank = {
  Math:[
    {grade:1,q:"What is 2+3?",a:"5"}, {grade:1,q:"What is 10−7?",a:"3"}, {grade:1,q:"How many sides does a triangle have?",a:"3"},
    {grade:2,q:"What is 25÷5?",a:"5"}, {grade:2,q:"What is 9×6?",a:"54"}, {grade:2,q:"How many inches in a foot?",a:"12"},
    {grade:3,q:"What is 144÷12?",a:"12"}, {grade:3,q:"Perimeter of a square with side 5?",a:"20"}, {grade:3,q:"What is 3/6 simplified?",a:"1/2"},
    {grade:4,q:"What is 15% of 200?",a:"30"}, {grade:4,q:"What is 0.25 as a fraction?",a:"1/4"}, {grade:4,q:"Angles in a triangle add up to?",a:"180 degrees"},
    {grade:5,q:"What is 12 squared?",a:"144"}, {grade:5,q:"Solve: 2x+5=15",a:"x=5"}, {grade:5,q:"Pi rounded to two decimals?",a:"3.14"}
  ],
  Science:[
    {grade:1,q:"Closest star to Earth?",a:"The Sun"}, {grade:1,q:"What do bees make?",a:"Honey"}, {grade:1,q:"Baby frogs are called?",a:"Tadpoles"},
    {grade:2,q:"What organ pumps blood?",a:"Heart"}, {grade:2,q:"What gas do plants take in?",a:"Carbon dioxide"},
    {grade:3,q:"What force pulls objects down?",a:"Gravity"}, {grade:3,q:"Red Planet?",a:"Mars"},
    {grade:4,q:"Humans breathe mostly which gas?",a:"Oxygen"}, {grade:4,q:"Part of a cell that contains DNA?",a:"Nucleus"},
    {grade:5,q:"H2O is what?",a:"Water"}, {grade:5,q:"Who developed the theory of relativity?",a:"Albert Einstein"}
  ],
  Geography:[
    {grade:1,q:"Country north of the U.S.?",a:"Canada"}, {grade:1,q:"Ocean on U.S. east coast?",a:"Atlantic Ocean"},
    {grade:2,q:"State with the Grand Canyon?",a:"Arizona"}, {grade:2,q:"Capital of Texas?",a:"Austin"},
    {grade:3,q:"Capital of California?",a:"Sacramento"}, {grade:3,q:"Which river runs through Egypt?",a:"Nile"},
    {grade:4,q:"Longest river in the U.S.?",a:"Missouri River"}, {grade:4,q:"Eastern U.S. mountain range?",a:"Appalachians"},
    {grade:5,q:"Capital of France?",a:"Paris"}, {grade:5,q:"Mount Everest is on which continent?",a:"Asia"}
  ],
  History:[
    {grade:1,q:"First U.S. President?",a:"George Washington"}, {grade:1,q:"What ship carried the Pilgrims?",a:"Mayflower"},
    {grade:2,q:"Who wrote the Declaration of Independence?",a:"Thomas Jefferson"}, {grade:2,q:"16th U.S. President?",a:"Abraham Lincoln"},
    {grade:3,q:"War fought between North and South U.S.?",a:"Civil War"}, {grade:3,q:"Who reached America in 1492?",a:"Christopher Columbus"},
    {grade:4,q:"Who invented the light bulb?",a:"Thomas Edison"}, {grade:4,q:"President during the Great Depression & WWII?",a:"Franklin D. Roosevelt"},
    {grade:5,q:"Year U.S. declared independence?",a:"1776"}, {grade:5,q:"Primary author of the U.S. Constitution?",a:"James Madison"}
  ],
  English:[
    {grade:1,q:"Plural of 'mouse'?",a:"Mice"}, {grade:1,q:"Letter after C?",a:"D"},
    {grade:2,q:"Opposite of hot?",a:"Cold"}, {grade:2,q:"A noun is a…",a:"Person, place, or thing"},
    {grade:3,q:"Past tense of 'run'?",a:"Ran"}, {grade:3,q:"Punctuation that ends a question?",a:"Question mark"},
    {grade:4,q:"Synonym for 'happy'?",a:"Joyful"}, {grade:4,q:"Antonym of 'big'?",a:"Small"},
    {grade:5,q:"What is a haiku?",a:"A poem with 5-7-5 syllables"}, {grade:5,q:"Define metaphor.",a:"A comparison without using like or as"}
  ]
};

// ===== Teams =====
function makeTeam(name){
  return { name, scoreIndex:0, questionIndex:0, cheats:{copy:false,peek:false,save:false},
    used:{}, tiles:generateTiles(), currentQ:null, finished:false, walked:false, bonusDone:false, won:false };
}
function addTeam(name){ if(!name?.trim()) return; if(!state.teams) state.teams=[]; state.teams.push(makeTeam(name.trim())); state.currentTeamIndex=state.teams.length-1; saveState(); renderTeams(); }
function editTeam(i){ const t=state.teams[i]; if(!t) return; const nv=prompt("Rename team:",t.name); if(nv?.trim()){ t.name=nv.trim(); saveState(); renderTeams(); } }
function clearTeam(i){ if(!confirm("Reset this team's progress?"))return; const t=state.teams[i]; if(!t)return; state.teams[i]=makeTeam(t.name); saveState(); renderTeams(); }
function deleteTeam(i){ if(!confirm("Delete this team?"))return; state.teams.splice(i,1); if(state.currentTeamIndex>=state.teams.length){ state.currentTeamIndex=state.teams.length-1; } saveState(); renderTeams(); }
function resetAll(){ if(!confirm("Restart the entire game? This will remove all teams and progress.")) return; state={teams:[],currentTeamIndex:null,globalUsed:{}}; undoStack=[]; redoStack=[]; persistStacks(); saveState(false); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); location.reload(); }

const gradeClass = g => g===1?'g1':g===2?'g2':g===3?'g3':g===4?'g4':'g5';
function currentTeam(){ return state.teams?.[state.currentTeamIndex] || null; }
function nextTeam(){ if(!state.teams?.length) return; let start = state.currentTeamIndex==null ? -1 : state.currentTeamIndex; for(let i=1;i<=state.teams.length;i++){ const idx=(start+i)%state.teams.length; const t=state.teams[idx]; if(!t.finished){ state.currentTeamIndex=idx; saveState(false); return goTo('board.html'); } } alert("All teams are finished."); }

// ===== Tiles (G5→G1 so grade 1 appears at bottom) =====
function generateTiles(){
  const subjects = Object.keys(questionBank);
  const tiles = [];
  for(let g=5; g>=1; g--){
    let pair=[]; while(pair.length<2){ const s=subjects[Math.floor(Math.random()*subjects.length)]; if(!pair.includes(s)) pair.push(s); }
    pair.forEach(s=> tiles.push({subject:s, grade:g, used:false}));
  }
  return tiles;
}

// ===== Unique picker (global & per-team) =====
function pickQuestion(team, subject, grade){
  const pool=(questionBank[subject]||[]).filter(q=>q.grade===grade);
  if(!pool.length) return {q:'(No question found)', a:'(n/a)'};
  const key=subject+'|'+grade;
  if(!team.used[key]) team.used[key]=[];
  if(!state.globalUsed[key]) state.globalUsed[key]=[];
  let idx=-1, guard=0;
  while(guard<200){
    const cand=Math.floor(Math.random()*pool.length);
    if(!team.used[key].includes(cand) && !state.globalUsed[key].includes(cand)){ idx=cand; break; }
    guard++;
  }
  if(idx===-1) idx=0;
  team.used[key].push(idx);
  state.globalUsed[key].push(idx);
  saveState(false);
  return pool[idx];
}

// ===== Navigation =====
function goTo(page, index){ if(typeof index==='number'){ state.currentTeamIndex=index; saveState(false); } window.location.href=page; }

// ===== Renderers =====
function renderTeams(){
  const list=document.getElementById('teams'); if(!list) return; list.innerHTML='';
  (state.teams||[]).forEach((t,i)=>{
    const row=document.createElement('div');
    row.className='team-row'+(t.won?' winner':'');
    const status = t.finished ? (t.walked?'(Walked)':'(Finished)') : '';
    row.innerHTML = `
      <div class="title">${t.name} ${t.won?'🏆':''} ${status}</div>
      <div class="meta">Bank: ${fmtMoney(t.scoreIndex)} &nbsp;|&nbsp; Cheats: 
        <span class="badge ${t.cheats.copy?'off':''}">copy</span>
        <span class="badge ${t.cheats.peek?'off':''}">peek</span>
        <span class="badge ${t.cheats.save?'off':''}">save</span>
      </div>
      <div style="margin-top:.4rem;">
        <button class="btn btn-primary" onclick="goTo('scoreboard.html', ${i})">Open</button>
        <button class="btn btn-secondary" onclick="editTeam(${i})">Rename</button>
        <button class="btn btn-secondary" onclick="clearTeam(${i})">Reset</button>
        <button class="btn btn-danger" onclick="deleteTeam(${i})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
}

function renderScoreboard(){
  const wrap=document.getElementById('scoreboard'); if(!wrap) return; wrap.innerHTML='';
  (state.teams||[]).forEach((t,i)=>{
    const cheats=['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join('');
    const disabled=t.finished?'disabled':'';
    const moneyLis = MONEY.map((amt,idx)=>{
      const filled = (idx<=t.scoreIndex) ? 'filled' : '';
      const safe = SAFE_INDEXES.includes(idx) ? 'safe' : '';
      return `<li class="${filled} ${safe}"><span class="money-step"></span><span>$${amt.toLocaleString()}</span></li>`;
    }).join('');
    const card=document.createElement('div');
    card.style.background='#0f8a50'; card.style.margin='12px auto'; card.style.padding='12px'; card.style.borderRadius='12px'; card.style.maxWidth='1000px';
    if(t.won) card.classList.add('winner');
    card.innerHTML = `
      <div class="team-title">${t.name} ${t.won?'<span class="trophy">🏆</span>':''} ${t.finished ? (t.walked?'(Walked)':'(Finished)') : ''}</div>
      <div class="money-vert"><ul>${moneyLis}</ul></div>
      <div style="margin-top:.4rem;">${cheats}</div>
      <div style="margin-top:8px;">
        <button class="btn btn-primary" onclick="goTo('board.html', ${i})" ${disabled}>Play / Resume</button>
      </div>`;
    wrap.appendChild(card);
  });
}

function renderBoard(){
  const t=currentTeam(); if(!t) return;
  document.getElementById('teamNameHeader').innerText = t.name + (t.finished ? (t.walked?' (Walked)':' (Finished)') : '');
  const grid=document.getElementById('grid'); grid.innerHTML='';
  t.tiles.forEach((tile,idx)=>{
    const el=document.createElement('div');
    el.className='tile '+gradeClass(tile.grade)+(tile.used?' used':'');
    el.innerHTML = `Grade ${tile.grade}<br>${tile.subject}`;
    if(!tile.used && !t.finished){ el.onclick=()=>openQuestion(idx); }
    grid.appendChild(el);
  });
  const moneyEl=document.getElementById('ladder'); moneyEl.innerHTML='';
  MONEY.forEach((amt,idx)=>{
    const li=document.createElement('li');
    li.className = (idx<=t.scoreIndex?'filled ':'') + (SAFE_INDEXES.includes(idx)?'safe':'');
    li.innerHTML = `<span class="money-step"></span><span>$${amt.toLocaleString()}</span>`;
    moneyEl.appendChild(li);
  });
  ['copy','peek','save'].forEach(k=>{
    const btn=document.getElementById('cheat-'+k);
    if(btn){ btn.disabled=!!t.cheats[k] || t.finished; btn.classList.toggle('btn-secondary', !!t.cheats[k] || t.finished); }
  });
  const bonusBtn=document.getElementById('btn-bonus');
  if(bonusBtn){
    const allUsed = t.tiles.every(x=>x.used);
    bonusBtn.disabled = !(allUsed && !t.bonusDone && !t.finished);
  }
  const wa=document.getElementById('btn-walk'); if(wa) wa.disabled=!!t.finished;
}

// ===== Question & Bonus flow =====
let answerRevealed=false;
function openQuestion(tileIndex){
  const t=currentTeam(); if(!t || t.finished) return;
  const tile=t.tiles[tileIndex];
  const qa=pickQuestion(t,tile.subject,tile.grade);
  t.currentQ={ tileIndex, subject:tile.subject, grade:tile.grade, q:qa.q, a:qa.a, revealed:false, bonus:false };
  saveState(); goTo('question.html');
}
function startBonus(){
  const t=currentTeam(); if(!t || t.finished) return;
  const subs=Object.keys(questionBank).filter(s=>(questionBank[s]||[]).some(q=>q.grade===5));
  const subject=subs[Math.floor(Math.random()*subs.length)] || 'Science';
  const qa=pickQuestion(t,subject,5);
  t.currentQ={ tileIndex:null, subject, grade:5, q:qa.q, a:qa.a, revealed:false, bonus:true };
  saveState(); goTo('question.html');
}
function renderQuestion(){
  const t=currentTeam(); if(!t) return;
  const subj=document.getElementById('q-subject'); const txt=document.getElementById('q-text'); const ans=document.getElementById('q-answer');
  const walkBtn=document.getElementById('walk-here');
  subj.textContent = `${t.currentQ.bonus?'BONUS — ':''}${t.currentQ.subject} — Grade ${t.currentQ.grade}`;
  txt.textContent = t.currentQ.q;
  ans.textContent = 'Answer: ' + t.currentQ.a;
  answerRevealed = !!t.currentQ.revealed;
  ans.style.display = answerRevealed ? 'block' : 'none';
  if(walkBtn){ walkBtn.disabled = answerRevealed; }

  // Cheats badges on question
  const badgeRow=document.getElementById('q-cheat-badges');
  if(badgeRow){
    badgeRow.innerHTML = ['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join('');
  }
  ['copy','peek','save'].forEach(k=>{ const b=document.getElementById('qcheat-'+k); if(b){ b.disabled=!!t.cheats[k]; } });

  document.onkeydown=(e)=>{
    if(e.key==='r'||e.key==='R') revealAnswer();
    if(e.key==='y'||e.key==='Y') markAnswer(true);
    if(e.key==='n'||e.key==='N') markAnswer(false);
    if(e.key==='c'||e.key==='C') useCheatFromQ('copy');
    if(e.key==='p'||e.key==='P') useCheatFromQ('peek');
    if(e.key==='s'||e.key==='S') useCheatFromQ('save');
    if(e.key==='Escape') goTo('board.html');
    if((e.ctrlKey||e.metaKey)&&e.key==='z'){ e.preventDefault(); undo(); }
    if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){ e.preventDefault(); redo(); }
  };
}
function revealAnswer(){ const t=currentTeam(); if(!t) return; t.currentQ.revealed=true; answerRevealed=true; document.getElementById('q-answer').style.display='block'; playSound('reveal'); saveState(); }
function markAnswer(correct){
  const t=currentTeam(); if(!t) return;
  playSound(correct?'correct':'wrong');

  if(!t.currentQ.bonus && t.currentQ.tileIndex!=null){ t.tiles[t.currentQ.tileIndex].used=true; }

  if(correct){
    if(t.currentQ.bonus){
      t.scoreIndex = MONEY.length-1; t.bonusDone = true; t.finished = true; t.won = true;
      saveState(); sessionStorage.setItem('endStatus','win'); return goTo('end.html');
    } else {
      t.scoreIndex = Math.min(t.scoreIndex+1, MONEY.length-2);
      t.questionIndex += 1;
      showToast(`${t.name} advanced to ${fmtMoney(t.scoreIndex)}`);
    }
  } else {
    let safeIndex = 0; SAFE_INDEXES.forEach(si=>{ if(t.scoreIndex>=si) safeIndex=si; });
    t.scoreIndex = safeIndex; t.finished = true;
    saveState(); sessionStorage.setItem('endStatus','lose'); return goTo('end.html');
  }
  saveState(); goTo('board.html');
}
function walkAwayHere(){ if(answerRevealed) return; const t=currentTeam(); if(!t) return; t.finished=true; t.walked=true; playSound('walk'); saveState(); sessionStorage.setItem('endStatus','walk'); goTo('end.html'); }
function walkAwayBoard(){ const t=currentTeam(); if(!t) return; t.finished=true; t.walked=true; playSound('walk'); saveState(); sessionStorage.setItem('endStatus','walk'); goTo('end.html'); }

// ===== Cheats =====
function useCheat(type){ const t=currentTeam(); if(!t||t.finished) return; if(t.cheats[type]){ showToast('Already used.'); return; } t.cheats[type]=true; saveState(); if(type==='peek'){ showToast("Peek used (host reveals teammate's answer)."); } if(type==='copy'){ showToast("Copy used (host takes teammate's answer)."); } if(type==='save'){ showToast("Save used by teammate."); } playSound('cheat'); }
function useCheatFromQ(type){ useCheat(type); const b=document.getElementById('qcheat-'+type); if(b){ b.disabled=true; } const badgeRow=document.getElementById('q-cheat-badges'); if(badgeRow){ const t=currentTeam(); badgeRow.innerHTML=['copy','peek','save'].map(k=>`<span class="badge ${t.cheats[k]?'off':''}">${k}</span>`).join(''); } }

// ===== Host controls =====
document.addEventListener('mousemove', e=>{ if(window.innerHeight-e.clientY<50){ document.body.classList.add('show-controls'); } else { document.body.classList.remove('show-controls'); } });

// Highlight active page
(function(){
  function pageName(){ const p=(location.pathname.split('/').pop()||'index.html').toLowerCase(); return p||'index.html'; }
  function markActive(){ const current=pageName(); document.querySelectorAll('.host-controls [data-page]').forEach(btn=>{ const target=(btn.getAttribute('data-page')||'').toLowerCase(); if(target===current){ btn.classList.add('btn-active'); } else { btn.classList.remove('btn-active'); } }); }
  window.addEventListener('DOMContentLoaded', markActive);
})();

// ===== Sounds & Toast =====
let ac; function tone(f=440,d=0.2,t='sine',v=0.2){ try{ ac=ac||new (window.AudioContext||window.webkitAudioContext)(); const o=ac.createOscillator(); const g=ac.createGain(); o.type=t; o.frequency.value=f; g.gain.value=v; o.connect(g); g.connect(ac.destination); o.start(); setTimeout(()=>o.stop(), d*1000);}catch(e){} }
function playSound(k){ if(k==='correct'){ tone(660,0.12,'sine',0.2); setTimeout(()=>tone(880,0.15,'sine',0.2),120); } if(k==='wrong'){ tone(220,0.25,'square',0.25); setTimeout(()=>tone(180,0.25,'square',0.25),250); } if(k==='reveal'){ tone(520,0.18,'triangle',0.2); } if(k==='cheat'){ tone(400,0.12,'sine',0.2); } if(k==='walk'){ tone(300,0.15,'sine',0.2); } }
function showToast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }

// ===== Global keyboard shortcuts for Undo/Redo =====
(function(){
  function isEditable(el){ if(!el) return false; const tag=(el.tagName||'').toLowerCase(); if(tag==='input'||tag==='textarea') return true; if(el.isContentEditable) return true; return false; }
  document.addEventListener('keydown',(e)=>{
    if(isEditable(document.activeElement)) return;
    const ctrl=e.ctrlKey||e.metaKey; if(!ctrl) return;
    if(e.key.toLowerCase()==='z' && !e.shiftKey){ e.preventDefault(); try{ undo(); }catch(_){}};
    if(e.key.toLowerCase()==='y' || (e.key.toLowerCase()==='z' && e.shiftKey)){ e.preventDefault(); try{ redo(); }catch(_){}};
  }, {capture:true});
})();

// ===== Enter to add team on Home =====
window.addEventListener('DOMContentLoaded', ()=>{
  const inp=document.getElementById('teamName');
  if(inp){ inp.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTeam(inp.value); inp.value=''; } }); }
});
