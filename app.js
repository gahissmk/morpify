// ================= ELEMENTS =================
const audio = document.getElementById("audio");
const albumsEl = document.getElementById("albums");
const infoEl = document.getElementById("info");
const searchEl = document.getElementById("search");
const countryFilter = document.getElementById("countryFilter");
const genreFilter = document.getElementById("genreFilter");
const canvas = document.getElementById("musicCanvas");
const ctx = canvas.getContext("2d");
const musicPopup = document.getElementById("music-popup");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

// ================= DATA =================
let allTracks = [];
let albums = [];

// ================= INIT =================
async function init() {
  const res = await fetch("music.json");
  allTracks = await res.json();

  renderFilters(allTracks);
  groupAlbums(allTracks);
  renderAlbums();
  setupSearchFilters();
  setupCanvas();
  setupAudioControls();
}
init();

// ================= ALBUMS (15 TITRES) =================
function groupAlbums(tracks) {
  albums = [];
  for (let i = 0; i < tracks.length; i += 15) {
    albums.push({
      title: `Album ${Math.floor(i / 15) + 1}`,
      tracks: tracks.slice(i, i + 15)
    });
  }
}

function renderAlbums() {
  albumsEl.innerHTML = "";

  albums.forEach(album => {
    const albumDiv = document.createElement("div");
    albumDiv.className = "album";

    const title = document.createElement("div");
    title.className = "album-title";
    title.textContent = album.title;

    const tracksDiv = document.createElement("div");
    tracksDiv.className = "album-tracks";

    album.tracks.forEach(track => {
      const card = document.createElement("div");
      card.className = "track-card";
      card.innerHTML = `
        <b>${track.title}</b>
        <span>${track.artist} • ${track.country}</span>
      `;
      card.onclick = () => playTrack(track);
      tracksDiv.appendChild(card);
    });

    albumDiv.appendChild(title);
    albumDiv.appendChild(tracksDiv);
    albumsEl.appendChild(albumDiv);
  });
}

// ================= PLAYER =================
function playTrack(track) {
  audio.src = track.url;
  audio.play();
  infoEl.innerHTML = `<b>${track.title}</b> — ${track.artist} 🌍 ${track.country}`;
  showPopup(track);
}

function setupAudioControls() {
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
    }
  });

  progress.oninput = () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
  };

  volume.oninput = () => {
    audio.volume = volume.value / 100;
  };
}

// ================= POPUP MUSIQUE =================
function showPopup(track) {
  musicPopup.innerHTML = `<b>${track.title}</b><span>${track.artist}</span>`;
  musicPopup.style.opacity = 1;
  musicPopup.style.transform = "translateX(0)";
  setTimeout(() => {
    musicPopup.style.opacity = 0;
    musicPopup.style.transform = "translateX(100px)";
  }, 2500);
}

// ================= FILTRES =================
function renderFilters(data) {
  const countries = [...new Set(data.map(t => t.country))];
  const genres = [...new Set(data.map(t => t.genre))];

  countryFilter.innerHTML = `<option value="">Tous les pays</option>`;
  countries.forEach(c => countryFilter.innerHTML += `<option>${c}</option>`);

  genreFilter.innerHTML = `<option value="">Tous les genres</option>`;
  genres.forEach(g => genreFilter.innerHTML += `<option>${g}</option>`);
}

function applyFilters() {
  const q = searchEl.value.toLowerCase();
  const country = countryFilter.value;
  const genre = genreFilter.value;

  const filtered = allTracks.filter(t =>
    (!country || t.country === country) &&
    (!genre || t.genre === genre) &&
    (t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
  );

  groupAlbums(filtered);
  renderAlbums();
}

function setupSearchFilters() {
  searchEl.oninput = applyFilters;
  countryFilter.onchange = applyFilters;
  genreFilter.onchange = applyFilters;
}

// ================= BANNIERE CANVAS =================
function setupCanvas() {
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.getElementById("banner").offsetHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  let t = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 6; i++) {
      const y = canvas.height / 2 + Math.sin(t + i) * 20 * (i + 1);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.lineTo(x, y + Math.sin(x / 50 + t + i) * 20);
      }
      ctx.strokeStyle = `rgba(30,215,96,${0.15 + i * 0.1})`;
      ctx.lineWidth = 2 + i;
      ctx.stroke();
    }
    t += 0.02;
    requestAnimationFrame(animate);
  }
  animate();
}

// ===================================================
// 🔥 RADIO POPUP — NE PAS TOUCHER (OK)
// ===================================================
const radioAudio = document.getElementById("radio-audio");
const radioButtons = document.querySelectorAll(".radio-btn");
const radioNow = document.getElementById("radio-now");
const radioToggle = document.getElementById("radio-toggle");

let currentRadio = null;
let radioPlaying = false;

radioButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const url = btn.dataset.url;

    radioButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (currentRadio !== url) {
      radioAudio.src = url;
      radioAudio.play();
      currentRadio = url;
      radioPlaying = true;
      radioToggle.textContent = "⏸";
      radioNow.textContent = btn.textContent;
    }
  });
});

radioToggle.addEventListener("click", () => {
  if (!currentRadio) return;

  if (radioPlaying) {
    radioAudio.pause();
    radioToggle.textContent = "▶";
  } else {
    radioAudio.play();
    radioToggle.textContent = "⏸";
  }
  radioPlaying = !radioPlaying;
});
