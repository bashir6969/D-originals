import { db } from "./firebase-config.js";
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// 1. DOM ELEMENT DEFINITIONS
// ==========================================
const wall = document.getElementById('wall');
const noteForm = document.getElementById('noteForm');
const awardGrid = document.getElementById('awardGrid');
const addAwardBtn = document.getElementById('addAwardBtn');

// A single reference to store our live yearbook data
const boardDocRef = doc(db, "yearbook", "sectionD_live");

// Helper function to see if the user is typing inside a specific section
function isTypingInside(container) {
  return container.contains(document.activeElement) && document.activeElement.hasAttribute("contenteditable");
}

// ==========================================
// 2. FIREBASE REAL-TIME SYNCING ENGINE
// ==========================================

function saveCurrentStateToFirebase() {
  updateDoc(boardDocRef, {
    awardsHtml: awardGrid.innerHTML,
    wallHtml: wall.innerHTML
  }).catch(err => {
    console.error("Error saving to Firebase: ", err);
  });
}

// Listens to the database. Updates sections independently without hijacking your layout view.
onSnapshot(boardDocRef, (snapshot) => {
  if (!snapshot.exists()) {
    // Seed database if entirely empty
    saveCurrentStateToFirebase();
    return;
  }

  const data = snapshot.data();

  // ONLY sync awards if your cursor isn't actively working inside the awards section
  if (data.awardsHtml && !isTypingInside(awardGrid)) {
    awardGrid.innerHTML = data.awardsHtml;
  }

  // ONLY sync the wall if your cursor isn't actively working inside the wall section
  if (data.wallHtml && !isTypingInside(wall)) {
    wall.innerHTML = data.wallHtml;
  }
});

// Watch for manual text updates inside any contenteditable field
document.body.addEventListener("input", (e) => {
  if (e.target.hasAttribute("contenteditable")) {
    saveCurrentStateToFirebase();
  }
});


// ==========================================
// 3. ORIGINAL UI & NAVIGATION CODE
// ==========================================

const sections = document.querySelectorAll('section[id]');
const tabs = document.querySelectorAll('.tabnav .tab');

function setActiveTab() {
  let current = sections[0].id;
  const scrollPos = window.scrollY + window.innerHeight * 0.35;
  sections.forEach(sec => {
    if (sec.offsetTop <= scrollPos) current = sec.id;
  });
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === current));
}
window.addEventListener('scroll', setActiveTab, { passive: true });
setActiveTab();

const revealEls = document.querySelectorAll('.t-entry, .reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.2 });
revealEls.forEach(el => obs.observe(el));

window.addEventListener('load', () => {
  document.getElementById('doodle1').classList.add('show');
  setTimeout(() => document.getElementById('doodle2').classList.add('show'), 350);
  setTimeout(() => document.getElementById('doodle3').classList.add('show'), 700);
});


// ==========================================
// 4. SHOUTOUT WALL CODE (CLEAN DELEGATION)
// ==========================================

noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('noteText').value.trim();
  const from = document.getElementById('noteFrom').value.trim();
  if (!text) return;
  
  const note = document.createElement('div');
  note.className = 'note';
  const safeText = text.replace(/</g, '&lt;');
  const safeFrom = (from || 'anonymous').replace(/</g, '&lt;');
  
  note.innerHTML =
    '<span class="remove-x note-remove">&times;</span>' +
    '<div class="note-text" contenteditable="true" spellcheck="false">' + safeText + '</div>' +
    '<div class="from" contenteditable="true" spellcheck="false">— ' + safeFrom + '</div>';
    
  wall.appendChild(note);
  
  document.getElementById('noteText').value = '';
  document.getElementById('noteFrom').value = '';
  
  saveCurrentStateToFirebase();
  note.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Click delegation: handles deleting notes dynamically without binding heavy event loops
wall.addEventListener('click', (e) => {
  if (e.target.classList.contains('note-remove') || e.target.classList.contains('remove-x')) {
    const targetNote = e.target.closest('.note');
    if (targetNote) {
      targetNote.remove();
      saveCurrentStateToFirebase();
    }
  }
});


// ==========================================
// 5. SUPERLATIVES CARDS CODE (CLEAN DELEGATION)
// ==========================================

addAwardBtn.addEventListener('click', () => {
  const card = document.createElement('div');
  card.className = 'award-card new-card';
  card.innerHTML =
    '<div class="pin"></div><span class="remove-x">&times;</span>' +
    '<div class="award-title" contenteditable="true" spellcheck="false" data-placeholder="New Category Name"></div>' +
    '<div class="award-name" contenteditable="true" spellcheck="false" data-placeholder="Who?"></div>' +
    '<div class="award-note" contenteditable="true" spellcheck="false" data-placeholder="Why? (optional)"></div>';
    
  awardGrid.appendChild(card);
  
  saveCurrentStateToFirebase();
  
  card.querySelector('.award-title').focus();
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Click delegation: handles deleting cards dynamically without binding heavy event loops
awardGrid.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-x')) {
    const targetCard = e.target.closest('.award-card');
    if (targetCard) {
      targetCard.remove();
      saveCurrentStateToFirebase();
    }
  }
});
