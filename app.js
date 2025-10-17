/* global JOBS */
const listEl   = document.getElementById('jobList');
const detailEl = document.getElementById('jobDetail');
const detTitle = document.getElementById('detTitle');
const detAddr  = document.getElementById('detAddr');
const detDesc  = document.getElementById('detDesc');
const backBtn  = document.getElementById('backBtn');
const syncBtn  = document.getElementById('syncBtn');
const notesIn  = document.getElementById('notes');
const partsIn  = document.getElementById('parts');
const completeBtn = document.getElementById('completeBtn');
const signBtn     = document.getElementById('signatureBtn');
const canvas      = document.getElementById('signaturePad');
const saveSignBtn = document.getElementById('saveSignBtn');
const ctx         = canvas.getContext('2d');

let jobs = JSON.parse(localStorage.getItem('jobs')) || JOBS;
let activeJobId = null;
let drawing = false;

function saveJobs(){ localStorage.setItem('jobs', JSON.stringify(jobs)); }

function renderList(){
  listEl.innerHTML = '';
  jobs.forEach(j=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <h3>${j.customer}</h3>
      <p>${j.description}</p>
      <span class="status ${j.status}">${j.status}</span>`;
    card.onclick = ()=> openJob(j.id);
    listEl.appendChild(card);
  });
}

function openJob(id){
  activeJobId = id;
  const j = jobs.find(x=>x.id===id);
  detTitle.textContent = j.customer;
  detAddr.textContent  = j.address;
  detDesc.textContent  = j.description;
  notesIn.value = j.notes;
  partsIn.value = j.parts;
  buildChecklist(j);
  listEl.classList.add('hidden');
  detailEl.classList.remove('hidden');
}

function buildChecklist(job){
  const ul = document.getElementById('checklist');
  ul.innerHTML='';
  job.checklist.forEach((item,i)=>{
    const li = document.createElement('li');
    li.innerHTML=`<label><input type="checkbox" ${item.done?'checked':''} data-i="${i}"> ${item.text||item}</label>`;
    ul.appendChild(li);
  });
}

backBtn.onclick = ()=>{
  detailEl.classList.add('hidden');
  listEl.classList.remove('hidden');
};

completeBtn.onclick = ()=>{
  const j = jobs.find(x=>x.id===activeJobId);
  j.notes = notesIn.value;
  j.parts = partsIn.value;
  j.status = 'done';
  saveJobs();
  renderList();
  backBtn.click();
};

signBtn.onclick = ()=>{
  canvas.classList.remove('hidden');
  saveSignBtn.classList.remove('hidden');
  canvas.width = canvas.offsetWidth;
  ctx.clearRect(0,0,canvas.width,canvas.height);
};

function drawLine(x,y){
  ctx.lineWidth=2; ctx.strokeStyle='#000';
  ctx.lineCap='round';
  ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
}
canvas.onmousedown = e=>{drawing=true; drawLine(e.offsetX,e.offsetY);};
canvas.onmousemove = e=>{if(drawing) drawLine(e.offsetX,e.offsetY);};
canvas.onmouseup   = ()=>{drawing=false; ctx.beginPath();};
canvas.ontouchstart= e=>{drawing=true; const t=e.touches[0]; drawLine(t.clientX-canvas.offsetLeft, t.clientY-canvas.offsetTop);};
canvas.ontouchmove = e=>{if(!drawing)return; const t=e.touches[0]; drawLine(t.clientX-canvas.offsetLeft, t.clientY-canvas.offsetTop);};
canvas.ontouchend  = ()=>{drawing=false; ctx.beginPath();};

saveSignBtn.onclick = ()=>{
  const j = jobs.find(x=>x.id===activeJobId);
  j.signature = canvas.toDataURL();
  canvas.classList.add('hidden');
  saveSignBtn.classList.add('hidden');
  alert('Signature saved locally');
};

syncBtn.onclick = ()=> alert('Sync logic goes here (POST to your endpoint)');

renderList();
