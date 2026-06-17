import { db } from "./firebase-config.js";
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// A single reference to store our live yearbook data
const boardDocRef = doc(db, "yearbook", "sectionD_live");

// ==========================================
// 1. FIREBASE REAL-TIME SYNCING ENGINE
// ==========================================

// This function scans your lists and pushes the updated HTML to Firebase
function saveCurrentStateToFirebase() {
  updateDoc(boardDocRef, {
    awardsHtml: awardGrid.innerHTML,
    wallHtml: wall.innerHTML
  }).catch(err => {
    console.error("Error saving to Firebase: ", err);
  });
}

// Listens to the database. If anyone changes anything anywhere, your screen updates instantly
onSnapshot(boardDocRef, (snapshot) => {
  if (!snapshot.exists()) {
    // If the database is completely empty (first run), seed it with your current HTML layout
    saveCurrentStateToFirebase();
    return;
  }

  const data = snapshot.data();

  // Prevent UI rewrites from hijacking your cursor while actively typing
  if (!document.activeElement || !document.activeElement.hasAttribute("contenteditable")) {
    if (data.awardsHtml) {
      awardGrid.innerHTML = data.awardsHtml;
      // Re-hook the delete buttons for the synced elements
      document.querySelectorAll('.award-card').forEach(wireRemove);
    }
    if (data.wallHtml) {
      wall.innerHTML = data.wallHtml;
      // Re-hook the delete buttons for the synced notes
      document.querySelectorAll('.note').forEach(wireNoteRemove);
    }
  }
});

// Watch for manual text updates inside any contenteditable field
document.body.addEventListener("input", (e) => {
  if (e.target.hasAttribute("contenteditable")) {
    saveCurrentStateToFirebase();
  }
});


// ==========================================
// 2. YOUR ORIGINAL UI & NAVIGATION CODE
// ==========================================

// tab nav active state
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

// generic reveal on scroll
const revealEls = document.querySelectorAll('.t-entry, .reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.2 });
revealEls.forEach(el => obs.observe(el));

// hero doodles fade in staggered
window.addEventListener('load', () => {
  document.getElementById('doodle1').classList.add('show');
  setTimeout(() => document.getElementById('doodle2').classList.add('show'), 350);
  setTimeout(() => document.getElementById('doodle3').classList.add('show'), 700);
});


// ==========================================
// 3. SHOUTOUT WALL CODE (WITH FIREBASE INTEGRATION)
// ==========================================
const wall = document.getElementById('wall');
const noteForm = document.getElementById('noteForm');

function wireNoteRemove(note) {
  const x = note.querySelector('.note-remove');
  if (x) {
    // Replaced the simple .remove() with one that saves the missing element state to Firebase
    x.replaceWith(x.cloneNode(true)); // Prevents attaching duplicate click event listeners
    const newX = note.querySelector('.note-remove');
    newX.addEventListener('click', () => {
      note.remove();
      saveCurrentStateToFirebase();
    });
  }
}
document.querySelectorAll('.note').forEach(wireNoteRemove);

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
  wireNoteRemove(note);
  
  document.getElementById('noteText').value = '';
  document.getElementById('noteFrom').value = '';
  
  // Save to cloud immediately
  saveCurrentStateToFirebase();
  
  note.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


// ==========================================
// 4. SUPERLATIVES CARDS CODE (WITH FIREBASE INTEGRATION)
// ==========================================
const awardGrid = document.getElementById('awardGrid');
const addAwardBtn = document.getElementById('addAwardBtn');

function wireRemove(card) {
  const x = card.querySelector('.remove-x');
  if (x) {
    x.replaceWith(x.cloneNode(true)); // Prevents attaching duplicate click event listeners
    const newX = card.querySelector('.remove-x');
    newX.addEventListener('click', () => {
      card.remove();
      saveCurrentStateToFirebase();
    });
  }
}
document.querySelectorAll('.award-card').forEach(wireRemove);

addAwardBtn.addEventListener('click', () => {
  const card = document.createElement('div');
  card.className = 'award-card new-card';
  card.innerHTML =
    '<div class="pin"></div><span class="remove-x">&times;</span>' +
    '<div class="award-title" contenteditable="true" spellcheck="false" data-placeholder="New Category Name"></div>' +
    '<div class="award-name" contenteditable="true" spellcheck="false" data-placeholder="Who?"></div>' +
    '<div class="award-note" contenteditable="true" spellcheck="false" data-placeholder="Why? (optional)"></div>';
    
  awardGrid.appendChild(card);
  wireRemove(card);
  
  // Save new card shell to cloud immediately
  saveCurrentStateToFirebase();
  
  card.querySelector('.award-title').focus();
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
