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

  // shoutout wall: editable notes + add new
  const wall = document.getElementById('wall');
  const noteForm = document.getElementById('noteForm');

  function wireNoteRemove(note) {
    const x = note.querySelector('.note-remove');
    if (x) x.addEventListener('click', () => note.remove());
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
      '<div class="from" contenteditable="true" spellcheck="false">â ' + safeFrom + '</div>';
    wall.appendChild(note);
    wireNoteRemove(note);
    document.getElementById('noteText').value = '';
    document.getElementById('noteFrom').value = '';
    note.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // superlatives: add new category card
  const awardGrid = document.getElementById('awardGrid');
  const addAwardBtn = document.getElementById('addAwardBtn');

  function wireRemove(card) {
    const x = card.querySelector('.remove-x');
    if (x) x.addEventListener('click', () => card.remove());
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
    card.querySelector('.award-title').focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
