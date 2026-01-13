document.addEventListener("DOMContentLoaded",()=>{

// ================= VARIABLES =================
const audio=document.getElementById("audio");
const albumsEl=document.getElementById("albums");
const tracksList=document.getElementById("tracks-list");
const search=document.getElementById("search");
const countryFilter=document.getElementById("countryFilter");
const genreFilter=document.getElementById("genreFilter");
const nowPlaying=document.getElementById("now-playing");
const progress=document.getElementById("progress");
const volume=document.getElementById("volume");
const eq=document.getElementById("equalizer");
const eqCtx=eq.getContext("2d");
const neonCanvas=document.getElementById("neonCanvas");
const neonCtx=neonCanvas.getContext("2d");

let allTracks=[], albums=[], playlist=[], recTracks=[];

// ================= INIT =================
fetch("music.json")
  .then(r=>r.json())
  .then(data=>{
    allTracks=data;
    recTracks=data.slice(0,10);
    buildFilters(data);
    buildAlbums(data);
    renderRecommendations();
  });

// ================= ALBUMS =================
function buildAlbums(tracks){
  albums=[];
  albumsEl.innerHTML="";
  tracksList.innerHTML="";
  for(let i=0;i<tracks.length;i+=15){
    albums.push(tracks.slice(i,i+15));
  }
  albums.forEach((album,index)=>{
    const d=document.createElement("div");
    d.className="album";
    d.innerHTML=`<div class="album-title">Album ${index+1}</div>`;
    d.onclick=()=>showTracks(album);
    albumsEl.appendChild(d);
  });
}

function showTracks(album){
  tracksList.innerHTML="";
  album.forEach(t=>{
    const d=document.createElement("div");
    d.className="track";
    d.textContent=`${t.title} — ${t.artist}`;
    d.onclick=()=>playTrack(t);
    tracksList.appendChild(d);
  });
}

// ================= PLAYER =================
function playTrack(track){
  audio.src=track.url;
  audio.play();
  nowPlaying.textContent=`${track.title} — ${track.artist}`;
  initAudioCtx();
  addToPlaylist(track);
}

// ================= EQUALIZER =================
let audioCtx, src, analyser;
function initAudioCtx(){
  if(audioCtx) return;
  audioCtx=new AudioContext();
  src=audioCtx.createMediaElementSource(audio);
  analyser=audioCtx.createAnalyser();
  src.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize=128;
  drawEQ();
}

function drawEQ(){
  const data=new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  eqCtx.clearRect(0,0,eq.width,eq.height);
  data.forEach((v,i)=>{
    eqCtx.fillStyle="#1ed760";
    eqCtx.fillRect(i*6,eq.height-v/3,4,v/3);
  });
  requestAnimationFrame(drawEQ);
}

// ================= CONTROLS =================
audio.ontimeupdate=()=>progress.value=audio.duration?audio.currentTime/audio.duration*100:0;
progress.oninput=()=>audio.currentTime=progress.value/100*audio.duration;
volume.oninput=()=>audio.volume=volume.value/100;

document.getElementById("playBtn").onclick=()=>audio.play();
document.getElementById("pauseBtn").onclick=()=>audio.pause();
document.getElementById("fullscreenBtn").onclick=()=>document.getElementById("player").classList.toggle("fullscreen");

// ================= FILTERS =================
function buildFilters(data){
  countryFilter.innerHTML="<option value=''>Pays</option>";
  genreFilter.innerHTML="<option value=''>Genre</option>";
  [...new Set(data.map(t=>t.country))].forEach(c=>countryFilter.innerHTML+=`<option>${c}</option>`);
  [...new Set(data.map(t=>t.genre))].forEach(g=>genreFilter.innerHTML+=`<option>${g}</option>`);
}

search.oninput=applyFilters;
countryFilter.onchange=applyFilters;
genreFilter.onchange=applyFilters;

function applyFilters(){
  const f=allTracks.filter(t=>
    (!countryFilter.value||t.country===countryFilter.value)&&
    (!genreFilter.value||t.genre===genreFilter.value)&&
    (t.title.toLowerCase().includes(search.value.toLowerCase())||
     t.artist.toLowerCase().includes(search.value.toLowerCase()))
  );
  buildAlbums(f);
}

// ================= RECOMMANDATIONS =================
function renderRecommendations(){
  const recList=document.getElementById("rec-list");
  recList.innerHTML="";
  recTracks.forEach(t=>{
    const d=document.createElement("div");
    d.className="rec-item";
    d.textContent=`${t.title} — ${t.artist}`;
    d.onclick=()=>playTrack(t);
    recList.appendChild(d);
  });
}

function addToPlaylist(track){
  if(!playlist.find(t=>t.id===track.id)){
    playlist.push(track);
    renderRecommendations();
  }
}

// ================= RADIO =================
const radioAudio=document.getElementById("radio-audio");
document.querySelectorAll(".radio-item").forEach(i=>{
  i.onclick=()=>{
    radioAudio.src=i.dataset.url;
    radioAudio.play();
  };
});
document.getElementById("radioPlay").onclick=()=>radioAudio.play();
document.getElementById("radioPause").onclick=()=>radioAudio.pause();

// ================= HERO ANIMATION =================
const heroCanvas=document.getElementById("heroCanvas");
const heroCtx=heroCanvas.getContext("2d");
function resizeHero(){
  heroCanvas.width=window.innerWidth;
  heroCanvas.height=document.getElementById("hero").offsetHeight;
}
window.onresize=resizeHero; resizeHero();
let t=0;
function animateHero(){
  heroCtx.clearRect(0,0,heroCanvas.width,heroCanvas.height);
  for(let i=0;i<4;i++){
    heroCtx.strokeStyle=`rgba(30,215,96,${0.15+i*0.1})`;
    heroCtx.beginPath();
    for(let x=0;x<heroCanvas.width;x+=20){
      const y=heroCanvas.height/2+Math.sin(x/60+t+i)*25;
      heroCtx.lineTo(x,y);
    }
    heroCtx.stroke();
  }
  t+=0.02;
  requestAnimationFrame(animateHero);
}
animateHero();

// ================= NEON BACKGROUND =================
const neonCount=30;
let neonDots=[];
function resizeNeon(){ neonCanvas.width=window.innerWidth; neonCanvas.height=window.innerHeight; }
window.onresize=resizeNeon; resizeNeon();

for(let i=0;i<neonCount;i++){
  neonDots.push({
    x:Math.random()*neonCanvas.width,
    y:Math.random()*neonCanvas.height,
    vx:(Math.random()-0.5)*1.2,
    vy:(Math.random()-0.5)*1.2,
    color:`hsl(${Math.random()*360},100%,50%)`,
    radius:Math.random()*3+1
  });
}

function animateNeon(){
  neonCtx.clearRect(0,0,neonCanvas.width,neonCanvas.height);
  neonDots.forEach(d=>{
    d.x+=d.vx; d.y+=d.vy;
    if(d.x<0||d.x>neonCanvas.width)d.vx*=-1;
    if(d.y<0||d.y>neonCanvas.height)d.vy*=-1;
    neonCtx.beginPath();
    neonCtx.arc(d.x,d.y,d.radius,0,Math.PI*2);
    neonCtx.fillStyle=d.color;
    neonCtx.shadowBlur=12;
    neonCtx.shadowColor=d.color;
    neonCtx.fill();
  });
  requestAnimationFrame(animateNeon);
}
animateNeon();
});
