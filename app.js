const today = new Date().toLocaleDateString(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

document.title = `AI Infra Lab · ${today}`;

const notes = [
  'Embeddings turn token IDs into useful vectors.',
  'Attention is learned routing across context.',
  'Q/K choose where to look; V carries the payload.',
  'Residuals make deep networks trainable.',
  'The real bottlenecks are memory and throughput.',
];

const lede = document.querySelector('.lede');
let noteIndex = 0;

if (lede) {
  const original = lede.textContent.trim();
  setInterval(() => {
    noteIndex = (noteIndex + 1) % notes.length;
    lede.textContent = `${original} ${notes[noteIndex]}`;
  }, 7000);
}

const loopTracks = Array.from(document.querySelectorAll('[data-loop-track]'));
loopTracks.forEach((track) => {
  const nodes = Array.from(track.querySelectorAll('[data-loop-node]'));
  if (!nodes.length) return;
  const intervalMs = parseInt(track.dataset.cycleMs || '2200', 10);
  let idx = nodes.findIndex((n) => n.classList.contains('is-active'));
  if (idx < 0) idx = 0;
  setInterval(() => {
    idx = (idx + 1) % nodes.length;
    nodes.forEach((n, i) => n.classList.toggle('is-active', i === idx));
  }, intervalMs);
});
