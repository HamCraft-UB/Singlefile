const grid = document.getElementById('gameGrid');
const overlay = document.getElementById('viewerOverlay');
const frame = document.getElementById('viewerFrame');
const closeBtn = document.getElementById('closeBtn');
const newTabBtn = document.getElementById('newTabBtn');
const status = document.getElementById('status');
const searchBox = document.getElementById('searchBox');
const gameCountEl = document.getElementById('gameCount');
const viewerTitle = document.getElementById('viewerTitle');

const HTML_BASE_URL = 'https://cdn.jsdelivr.net/gh/freebuisness/html@main';

let games = [];
let filteredGames = [];
let currentGameUrl = '';

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, {
  rootMargin: '200px'
});

function createCardElement(game) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.dataset.src = game.cover.replace('{COVER_URL}', 'https://cdn.jsdelivr.net/gh/freebuisness/covers@main');

  imageObserver.observe(img);

  const title = document.createElement('h3');
  title.textContent = game.name;

  card.appendChild(img);
  card.appendChild(title);

  card.onclick = () => openGame(game.url, game.name);

  return card;
}

async function loadGames() {
  status.style.display = 'block';
  status.textContent = "Loading games...";
  try {
    const res = await fetch('https://cdn.jsdelivr.net/gh/freebuisness/assets/zones.json', { cache: "no-store" });
    const data = await res.json();

    games = data
      .filter(g => g.id >= 0 && !g.name.includes('[!]'))
      .map(g => ({
        ...g,
        url: g.url.replace('{HTML_URL}', HTML_BASE_URL)
      }));

    filteredGames = [...games];

    grid.innerHTML = "";
    filteredGames.forEach(game => {
      grid.appendChild(createCardElement(game));
    });

    gameCountEl.textContent = `Games: ${games.length}`;
    status.style.display = 'none';
  } catch (e) {
    status.textContent = "ERROR loading games.";
  }
}

searchBox.addEventListener('input', () => {
  const q = searchBox.value.toLowerCase().trim();
  filteredGames = games.filter(g => g.name.toLowerCase().includes(q));

  grid.innerHTML = "";
  filteredGames.forEach(game => {
    grid.appendChild(createCardElement(game));
  });
});

async function openGame(url, name) {
  overlay.style.display = 'flex';
  viewerTitle.textContent = name || url;
  currentGameUrl = url;

  try {
    const res = await fetch(url);
    const html = await res.text();
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  } catch (err) {
    console.error(err);
    frame.src = 'about:blank';
  }
}

closeBtn.onclick = () => {
  overlay.style.display = 'none';
  frame.src = 'about:blank';
  currentGameUrl = '';
};

newTabBtn.onclick = async () => {
  if (!currentGameUrl) return;

  try {
    const res = await fetch(currentGameUrl);
    const html = await res.text();

    const win = window.open('about:blank', '_blank');
    if (!win) return;

    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (err) {
    console.error('Failed to open in new tab:', err);
  }
};

loadGames();
