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

const storyboard = document.querySelector('[data-storyboard]');
const storyCards = storyboard ? Array.from(storyboard.querySelectorAll('[data-stage]')) : [];
const currentStage = document.querySelector('[data-current-stage]');
const currentCopy = document.querySelector('[data-current-copy]');
const signalRoad = storyboard ? storyboard.querySelector('.signal-road') : null;
const signalBead = storyboard ? storyboard.querySelector('.signal-bead') : null;

const stageMeta = [
  ['Input', 'Tokens enter the model and begin the forward pass.'],
  ['Forward pass', 'Layers transform the signal as it moves left to right.'],
  ['Prediction', 'The model produces a guess for the next token.'],
  ['Loss', 'Compare the guess with the target and measure the mistake.'],
  ['Backpropagation', 'Error flows backward to show where the model went wrong.'],
  ['Gradients', 'Gradients tell us the direction and size of change for each weight.'],
  ['Update', 'The optimizer nudges weights in the direction that lowers loss.'],
  ['Residual connection', 'A shortcut path carries the original signal and adds the correction.'],
];

if (storyCards.length && currentStage && currentCopy && signalRoad && signalBead) {
  let stageIndex = 0;

  const renderStage = () => {
    storyCards.forEach((card, index) => {
      card.classList.toggle('is-active', index === stageIndex);
    });

    const [title, copy] = stageMeta[stageIndex];
    currentStage.textContent = title;
    currentCopy.textContent = copy;

    const progress = 6 + (stageIndex / Math.max(storyCards.length - 1, 1)) * 88;
    signalBead.style.left = `${progress}%`;
    signalRoad.dataset.mode = stageIndex >= 4 ? 'backward' : 'forward';
  };

  renderStage();
  setInterval(() => {
    stageIndex = (stageIndex + 1) % storyCards.length;
    renderStage();
  }, 3600);
}

const loopNodes = Array.from(document.querySelectorAll('[data-loop-node]'));
if (loopNodes.length) {
  let loopIndex = 0;
  setInterval(() => {
    loopIndex = (loopIndex + 1) % loopNodes.length;
    loopNodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === loopIndex);
    });
  }, 2200);
}
