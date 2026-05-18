const today = new Date().toLocaleDateString(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

document.title = `AI Infra Lab · ${today}`;

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
