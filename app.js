/**
 * Ocean Connection
 * Honoring the yearning
 */

// Data Management
const STORAGE_KEYS = {
  touches: 'ocean_touches',
  yearnings: 'ocean_yearnings',
  letters: 'ocean_letters'
};

function getData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading data:', e);
    return [];
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLogForm();
  initYearning();
  initPractices();
  initMemories();
  updateHomeScreen();
});

// Navigation
function initNavigation() {
  // Main nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const screenId = btn.dataset.screen;
      showScreen(screenId);
    });
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen('home');
    });
  });

  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close modal on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');

    // Update specific screens when shown
    if (screenId === 'home') {
      updateHomeScreen();
    } else if (screenId === 'memories') {
      renderMemories();
    } else if (screenId === 'yearning') {
      renderYearningHistory();
    }
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.practice-content').forEach(p => p.classList.remove('active'));
  stopBreathing();
  stopOceanAudio();
}

// Home Screen
function updateHomeScreen() {
  const touches = getData(STORAGE_KEYS.touches);
  const daysEl = document.getElementById('days-count');
  const noteEl = document.getElementById('last-touch-note');

  if (touches.length === 0) {
    daysEl.textContent = '?';
    noteEl.textContent = 'No ocean touches logged yet';
    return;
  }

  // Find most recent touch
  const sorted = touches.sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastTouch = sorted[0];
  const lastDate = new Date(lastTouch.date);
  const now = new Date();

  const diffMs = now - lastDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays === 0) {
    if (diffHours === 0) {
      daysEl.textContent = 'now';
    } else {
      daysEl.textContent = diffHours + 'h';
    }
  } else {
    daysEl.textContent = diffDays;
  }

  // Show last touch note
  let note = lastTouch.location || '';
  if (lastTouch.type && lastTouch.type !== 'ocean') {
    note += note ? ` (${lastTouch.type})` : lastTouch.type;
  }
  if (lastTouch.activity) {
    note += note ? ` — ${lastTouch.activity}` : lastTouch.activity;
  }
  noteEl.textContent = note || formatDate(lastTouch.date);
}

// Log Form
function initLogForm() {
  const form = document.getElementById('log-form');
  const dateInput = document.getElementById('touch-date');
  const intensityInput = document.getElementById('touch-intensity');
  const intensityValue = document.getElementById('intensity-value');

  // Set default date to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  dateInput.value = now.toISOString().slice(0, 16);

  // Update intensity display
  intensityInput.addEventListener('input', () => {
    intensityValue.textContent = intensityInput.value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const touch = {
      id: Date.now(),
      date: document.getElementById('touch-date').value,
      location: document.getElementById('touch-location').value,
      type: document.getElementById('touch-type').value,
      activity: document.getElementById('touch-activity').value,
      feeling: document.getElementById('touch-feeling').value,
      intensity: parseInt(document.getElementById('touch-intensity').value)
    };

    const touches = getData(STORAGE_KEYS.touches);
    touches.push(touch);
    saveData(STORAGE_KEYS.touches, touches);

    // Reset form
    form.reset();
    dateInput.value = now.toISOString().slice(0, 16);
    intensityInput.value = 7;
    intensityValue.textContent = '7';

    // Show confirmation and go home
    alert('Ocean touch saved ✨');
    showScreen('home');
  });
}

// Yearning
function initYearning() {
  const levelInput = document.getElementById('yearning-level');
  const levelValue = document.getElementById('yearning-value');
  const saveBtn = document.getElementById('save-yearning');

  levelInput.addEventListener('input', () => {
    levelValue.textContent = levelInput.value;
  });

  saveBtn.addEventListener('click', () => {
    const yearning = {
      id: Date.now(),
      date: new Date().toISOString(),
      level: parseInt(levelInput.value),
      note: document.getElementById('yearning-note').value
    };

    const yearnings = getData(STORAGE_KEYS.yearnings);
    yearnings.push(yearning);
    saveData(STORAGE_KEYS.yearnings, yearnings);

    // Reset
    document.getElementById('yearning-note').value = '';
    levelInput.value = 5;
    levelValue.textContent = '5';

    renderYearningHistory();
    alert('Feeling honored 💙');
  });
}

function renderYearningHistory() {
  const list = document.getElementById('yearning-list');
  const yearnings = getData(STORAGE_KEYS.yearnings);

  if (yearnings.length === 0) {
    list.innerHTML = '<li style="text-align: center; color: var(--sea-foam);">No yearnings recorded yet</li>';
    return;
  }

  const sorted = yearnings.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  list.innerHTML = sorted.map(y => `
    <li>
      <span class="level">${y.level}/10</span> —
      ${y.note ? `"${y.note.substring(0, 50)}${y.note.length > 50 ? '...' : ''}"` : 'no note'}
      <br><span class="date">${formatDate(y.date)}</span>
    </li>
  `).join('');
}

// Practices
let breathingInterval = null;

function initPractices() {
  // Practice card clicks
  document.querySelectorAll('.practice-card').forEach(card => {
    card.addEventListener('click', () => {
      const practice = card.dataset.practice;
      openPractice(practice);
    });
  });

  // Breathing
  document.getElementById('start-breathing').addEventListener('click', startBreathing);

  // Ocean sounds
  document.getElementById('play-ocean').addEventListener('click', toggleOceanAudio);

  // Memory journey
  document.getElementById('start-journey').addEventListener('click', startJourney);

  // Find water
  document.getElementById('find-water-btn').addEventListener('click', findWaterNearby);

  // Save letter
  document.getElementById('save-letter').addEventListener('click', saveLetter);
}

function openPractice(practice) {
  const modal = document.getElementById('practice-modal');
  modal.classList.add('active');

  document.querySelectorAll('.practice-content').forEach(p => p.classList.remove('active'));
  const practiceContent = document.getElementById(`practice-${practice}`);
  if (practiceContent) {
    practiceContent.classList.add('active');
  }
}

// Breathing practice
function startBreathing() {
  const circle = document.querySelector('.breath-circle');
  const instruction = document.getElementById('breath-instruction');
  const btn = document.getElementById('start-breathing');

  if (breathingInterval) {
    stopBreathing();
    return;
  }

  btn.textContent = 'Stop';
  let phase = 'inhale';

  function breathe() {
    if (phase === 'inhale') {
      circle.className = 'breath-circle inhale';
      instruction.textContent = 'Breathe in... like the tide rising';
      phase = 'hold-in';
    } else if (phase === 'hold-in') {
      instruction.textContent = 'Hold... feel the fullness';
      phase = 'exhale';
    } else if (phase === 'exhale') {
      circle.className = 'breath-circle exhale';
      instruction.textContent = 'Release... like waves receding';
      phase = 'hold-out';
    } else {
      instruction.textContent = 'Rest... in the stillness';
      phase = 'inhale';
    }
  }

  breathe();
  breathingInterval = setInterval(breathe, 4000);
}

function stopBreathing() {
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  const circle = document.querySelector('.breath-circle');
  const instruction = document.getElementById('breath-instruction');
  const btn = document.getElementById('start-breathing');

  if (circle) circle.className = 'breath-circle';
  if (instruction) instruction.textContent = 'Tap to begin';
  if (btn) btn.textContent = 'Begin';
}

// Ocean audio
function toggleOceanAudio() {
  const audio = document.getElementById('ocean-audio');
  const btn = document.getElementById('play-ocean');

  if (audio.paused) {
    audio.play().catch(() => {
      alert('Could not play audio. Try again or use headphones.');
    });
    btn.textContent = 'Pause';
  } else {
    audio.pause();
    btn.textContent = 'Play Ocean Waves';
  }
}

function stopOceanAudio() {
  const audio = document.getElementById('ocean-audio');
  const btn = document.getElementById('play-ocean');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  if (btn) btn.textContent = 'Play Ocean Waves';
}

// Memory journey
function startJourney() {
  const prompts = document.querySelectorAll('.journey-prompt');
  const btn = document.getElementById('start-journey');

  btn.style.display = 'none';

  prompts.forEach((p, i) => {
    setTimeout(() => {
      p.classList.add('visible');
    }, i * 3000);
  });

  // Reset after journey
  setTimeout(() => {
    btn.style.display = 'block';
    prompts.forEach(p => p.classList.remove('visible'));
  }, prompts.length * 3000 + 5000);
}

// Find water
function findWaterNearby() {
  const results = document.getElementById('water-results');
  results.innerHTML = '<p style="color: var(--sea-foam);">Searching...</p>';

  if (!navigator.geolocation) {
    results.innerHTML = `
      <p>Geolocation not available.</p>
      <p style="color: var(--sea-foam); margin-top: 1rem;">Try searching manually for water near you - lakes, rivers, pools, or even fountains.</p>
    `;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Create links to map searches
      results.innerHTML = `
        <p style="margin-bottom: 1rem;">Found your location. Try these searches:</p>
        <a href="https://www.google.com/maps/search/beach+near+me/@${lat},${lon},12z"
           target="_blank"
           style="display: block; color: var(--salt-spray); margin-bottom: 0.5rem;">
          🏖 Beaches nearby
        </a>
        <a href="https://www.google.com/maps/search/lake+near+me/@${lat},${lon},12z"
           target="_blank"
           style="display: block; color: var(--salt-spray); margin-bottom: 0.5rem;">
          🌊 Lakes nearby
        </a>
        <a href="https://www.google.com/maps/search/river+near+me/@${lat},${lon},12z"
           target="_blank"
           style="display: block; color: var(--salt-spray); margin-bottom: 0.5rem;">
          🌿 Rivers nearby
        </a>
        <a href="https://www.google.com/maps/search/swimming+pool+near+me/@${lat},${lon},12z"
           target="_blank"
           style="display: block; color: var(--salt-spray); margin-bottom: 0.5rem;">
          🏊 Pools nearby
        </a>
      `;
    },
    (err) => {
      results.innerHTML = `
        <p>Could not get your location.</p>
        <p style="color: var(--sea-foam); margin-top: 1rem;">
          ${err.code === 1 ? 'Location permission denied.' : 'Try again in a moment.'}
        </p>
      `;
    }
  );
}

// Save letter
function saveLetter() {
  const textarea = document.getElementById('ocean-letter');
  const content = textarea.value.trim();

  if (!content) {
    alert('Write something first');
    return;
  }

  const letter = {
    id: Date.now(),
    date: new Date().toISOString(),
    content: content
  };

  const letters = getData(STORAGE_KEYS.letters);
  letters.push(letter);
  saveData(STORAGE_KEYS.letters, letters);

  textarea.value = '';
  alert('Letter saved 💙');
}

// Memories
let currentMemoryId = null;

function initMemories() {
  document.getElementById('delete-memory').addEventListener('click', deleteCurrentMemory);
}

function renderMemories() {
  const container = document.getElementById('memories-list');
  const emptyState = document.getElementById('no-memories');
  const touches = getData(STORAGE_KEYS.touches);

  if (touches.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  const sorted = touches.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted.map(touch => `
    <div class="memory-card" data-id="${touch.id}">
      <div class="memory-date">${formatDate(touch.date)}</div>
      <div class="memory-location">${touch.location || 'Unknown location'}</div>
      <div class="memory-type">${touch.type}${touch.activity ? ' — ' + touch.activity : ''}</div>
    </div>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => {
      openMemory(parseInt(card.dataset.id));
    });
  });
}

function openMemory(id) {
  const touches = getData(STORAGE_KEYS.touches);
  const touch = touches.find(t => t.id === id);

  if (!touch) return;

  currentMemoryId = id;

  const detail = document.getElementById('memory-detail');
  detail.innerHTML = `
    <h3>${touch.location || 'Ocean Touch'}</h3>
    <p class="detail-date">${formatDate(touch.date)}</p>

    <div class="detail-section">
      <p class="detail-label">Type</p>
      <p class="detail-value">${touch.type}</p>
    </div>

    <div class="detail-section">
      <p class="detail-label">Activity</p>
      <p class="detail-value">${touch.activity || 'Not specified'}</p>
    </div>

    ${touch.feeling ? `
    <div class="detail-section">
      <p class="detail-label">How It Felt</p>
      <p class="detail-value" style="font-style: italic;">"${touch.feeling}"</p>
    </div>
    ` : ''}

    <div class="detail-section">
      <p class="detail-label">Intensity of Connection</p>
      <p class="detail-value">${touch.intensity}/10</p>
    </div>
  `;

  document.getElementById('memory-modal').classList.add('active');
}

function deleteCurrentMemory() {
  if (!currentMemoryId) return;

  if (!confirm('Delete this memory?')) return;

  const touches = getData(STORAGE_KEYS.touches);
  const filtered = touches.filter(t => t.id !== currentMemoryId);
  saveData(STORAGE_KEYS.touches, filtered);

  currentMemoryId = null;
  closeAllModals();
  renderMemories();
}

// Utilities
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
