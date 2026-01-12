const audio = document.getElementById("audio");
const albumContainer = document.getElementById("album-cards");
const infoEl = document.getElementById("info");
const searchEl = document.getElementById("search");
const countryFilter = document.getElementById("countryFilter");
const genreFilter = document.getElementById("genreFilter");
const canvas = document.getElementById("musicCanvas");
const ctx = canvas.getContext("2d");
const musicPopup = document.getElementById("music-popup");

let allTracks = [];
let albums = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Exemple de pochettes album
const albumCovers = [
  "https://picsum.photos/400?random=1",
  "https://picsum.photos/400?random=2",
  "https://picsum.photos/400?random=3",
  "https://picsum.photos/400?random=4",
  "https://picsum.photos/400?random=5",
  "https://picsum.photos/400?random=6",
  "https://picsum.photos/400?random=7"
];

// INIT
async function init() {
  const res = await fetch("music.json");
  allTracks = await res.json();
  groupAlbums(allTracks);
  renderFilters(allTracks);
  renderAlbumCards();
  setupSearchFilters();
  setupCanvas();
}
init();

// GROUPE LES TITRES PAR ALBUM
function groupAlbums(tracks){
  albums=[];
  let albumIndex=0;
  while(tracks.length){
    const albumTracks = tracks.splice(0,15);
    albums.push({
      title:`Album ${albumIndex+1}`,
      cover: albumCovers[albumIndex % albumCovers.length],
      tracks: albumTracks
    });
    albumIndex++;
  }
}

// RENDER ALBUM CARDS
function renderAlbumCards(){
  albumContainer.innerHTML="";
  albums.forEach((album,i)=>{
    const card=document.createElement("div");
    card.className="album-card";
    card.innerHTML=`<img src="${album.cover}" alt="cover"><div class="album-title">${album.title}</div>`;
    
    const tracksDiv=document.createElement("div");
    tracksDiv.className="album-tracks";
    
    album.tracks.forEach(track=>{
      const trackCard=document.createElement("div");
      trackCard.className="track-card";
      trackCard.innerHTML=`<b>${track.title}</b><span>${track.artist} (${track.country})</span>`;
      trackCard.onclick=()=>playTrack(track);
      tracksDiv.appendChild(trackCard);
    });
    
    card.appendChild(tracksDiv);
    card.onclick=()=>{
      tracksDiv.style.display = tracksDiv.style.display==="flex" ? "none" : "flex";
    };
    
    albumContainer.appendChild(card);
  });
}

// LECTURE MUSIQUE + POPUP
function playTrack(track){
  audio.src=track.url;
  audio.play();
  infoEl.innerHTML=`<b>${track.title}</b> ${track.artist} 🌍 ${track.country} — ${track.genre}`;
  showPopup(track);
}

function showPopup(track){
  musicPopup.innerHTML=`<b>${track.title}</b><span>${track.artist}</span>`;
  musicPopup.style.opacity=1;
  musicPopup.style.transform="translateX(0)";
  setTimeout(()=>{musicPopup.style.opacity=0;musicPopup.style.transform="translateX(100px)";},2500);
}

// FILTRES
function renderFilters(data){
  const countries=[...new Set(data.map(t=>t.country))];
  const genres=[...new Set(data.map(t=>t.genre))];
  countryFilter.innerHTML=`<option value="">Tous les pays</option>`;
  countries.forEach(c=>countryFilter.innerHTML+=`<option>${c}</option>`);
  genreFilter.innerHTML=`<option value="">Tous les genres</option>`;
  genres.forEach(g=>genreFilter.innerHTML+=`<option>${g}</option>`);
}

function applyFilters(){
  const q=searchEl.value.toLowerCase();
  const country=countryFilter.value;
  const genre=genreFilter.value;
  const filteredTracks = allTracks.filter(t=>
    (!country||t.country===country)&&
    (!genre||t.genre===genre)&&
    (t.title.toLowerCase().includes(q)||t.artist.toLowerCase().includes(q))
  );
  groupAlbums([...filteredTracks]);
  renderAlbumCards();
}

function setupSearchFilters(){
  searchEl.oninput=applyFilters;
  countryFilter.onchange=applyFilters;
  genreFilter.onchange=applyFilters;
}

// CANVAS BANNIERE
function setupCanvas(){
  function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=document.getElementById("banner").offsetHeight;}
  window.addEventListener("resize",resizeCanvas);
  resizeCanvas();
  let t=0;
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<6;i++){
      const y=canvas.height/2+Math.sin(t+i)*20*(i+1);
      ctx.beginPath();
      ctx.moveTo(0,y);
      for(let x=0;x<canvas.width;x+=20){
        ctx.lineTo(x,y+Math.sin((x/50)+t+i)*20);
      }
      ctx.strokeStyle=`rgba(30,215,96,${0.15+i*0.1})`;
      ctx.lineWidth=2+i;
      ctx.stroke();
    }
    t+=0.02;
    requestAnimationFrame(animate);
  }
  animate();
}


// SKYROCK POPUP AUDIO
const skyrockPopup = document.getElementById("skyrock-popup");

// Crée un audio pour Skyrock FM
const skyrockAudio = document.createElement("audio");
skyrockAudio.src = "http://icecast.skyrock.net/s/natio_mp3_128k"; // Remplace par le flux Skyrock si disponible
skyrockAudio.controls = true;
skyrockAudio.autoplay = false;
skyrockAudio.loop = true;

// Ajoute un titre et l'élément audio dans le popup
const skyrockTitle = document.createElement("div");
skyrockTitle.className = "title";
skyrockTitle.textContent = "Skyrock FM";

skyrockPopup.appendChild(skyrockTitle);
skyrockPopup.appendChild(skyrockAudio);
