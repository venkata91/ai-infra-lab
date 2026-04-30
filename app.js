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
