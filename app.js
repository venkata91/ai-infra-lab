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
const stagePills = storyboard ? Array.from(storyboard.querySelectorAll('[data-stage-pill]')) : [];
const currentStage = document.querySelector('[data-current-stage]');
const currentTitle = document.querySelector('[data-current-title]');
const currentCopy = document.querySelector('[data-current-copy]');
const currentBadge = document.querySelector('[data-current-badge]');
const currentBullets = document.querySelector('[data-current-bullets]');
const pipelineDiagram = storyboard ? storyboard.querySelector('.pipeline-diagram') : null;
const diagramNodes = storyboard ? Array.from(storyboard.querySelectorAll('.diagram-node')) : [];
const packetMain = storyboard ? storyboard.querySelector('.packet-main') : null;
const packetBackward = storyboard ? storyboard.querySelector('.packet-backward') : null;
const packetResidual = storyboard ? storyboard.querySelector('.packet-residual') : null;

const stageMeta = [
  {
    label: 'Input',
    title: 'Tokens enter the model',
    copy: 'Text becomes token ids, then the forward pass begins.',
    badge: 'forward',
    mode: 'forward',
    nodes: [0],
    mainLeft: 12,
    bullets: [
      'Tokenization turns text into small pieces the model can handle.',
      'The first moving piece is the token stream itself.',
      'Everything after this is a learned transformation.',
    ],
  },
  {
    label: 'Forward pass',
    title: 'Embedding and attention shape the signal',
    copy: 'The model mixes information left to right through embeddings, attention, and MLP layers.',
    badge: 'forward',
    mode: 'forward',
    nodes: [1, 2],
    mainLeft: 38,
    bullets: [
      'Embedding turns token ids into vectors.',
      'Attention lets each token look at useful earlier context.',
      'The MLP reshapes each token independently inside the block.',
    ],
  },
  {
    label: 'Prediction',
    title: 'The model outputs logits',
    copy: 'Logits are the raw next-token scores before softmax turns them into probabilities.',
    badge: 'forward',
    mode: 'forward',
    nodes: [3, 4],
    mainLeft: 82,
    bullets: [
      'Logits are one score per possible next token.',
      'Higher logits mean the model prefers those tokens more.',
      'Softmax converts raw scores into a probability distribution.',
    ],
  },
  {
    label: 'Loss',
    title: 'Compare prediction with the target',
    copy: 'Loss measures how wrong the guess was and tells training how much correction is needed.',
    badge: 'forward',
    mode: 'forward',
    nodes: [3, 4],
    mainLeft: 82,
    bullets: [
      'Loss is the mistake score.',
      'Bigger loss means a bigger correction is needed.',
      'This is the signal that starts learning.',
    ],
  },
  {
    label: 'Backpropagation',
    title: 'Send error backward through the network',
    copy: 'Backprop traces blame backward so each layer sees how it contributed to the mistake.',
    badge: 'backprop',
    mode: 'backward',
    nodes: [2, 1],
    backwardLeft: 58,
    bullets: [
      'The error signal flows in reverse.',
      'Each layer gets a slice of responsibility for the loss.',
      'This is how the model learns which parts to change.',
    ],
  },
  {
    label: 'Gradients',
    title: 'Compute the change for each weight',
    copy: 'Gradients tell us the direction and size of the next correction.',
    badge: 'backprop',
    mode: 'backward',
    nodes: [2, 1],
    backwardLeft: 42,
    bullets: [
      'A gradient is the downhill direction for a parameter.',
      'Its size tells the optimizer how big the step should be.',
      'This is the math that turns error into action.',
    ],
  },
  {
    label: 'Update',
    title: 'Nudge the weights',
    copy: 'The optimizer applies a small step so the next pass should do a little better.',
    badge: 'update',
    mode: 'forward',
    nodes: [1, 2],
    mainLeft: 44,
    bullets: [
      'Learning rate controls how big the step is.',
      'Weights move opposite the gradient.',
      'Training is many tiny corrections, not one big leap.',
    ],
  },
  {
    label: 'Residual',
    title: 'Keep the shortcut path alive',
    copy: 'A residual connection carries the original signal around the block and adds the correction back in.',
    badge: 'residual',
    mode: 'residual',
    nodes: [1, 2],
    residualLeft: 47,
    bullets: [
      'The skip path preserves the original signal.',
      'The block learns a correction instead of everything from scratch.',
      'That makes deep networks easier to train.',
    ],
  },
];

if (storyboard && stagePills.length && currentStage && currentTitle && currentCopy && currentBadge && currentBullets && pipelineDiagram && diagramNodes.length) {
  let stageIndex = 0;

  const renderStage = () => {
    const stage = stageMeta[stageIndex];

    stagePills.forEach((pill, index) => {
      pill.classList.toggle('is-active', index === stageIndex);
    });
    diagramNodes.forEach((node, index) => {
      node.classList.toggle('is-active', stage.nodes.includes(index));
    });

    currentStage.textContent = stage.label;
    currentTitle.textContent = stage.title;
    currentCopy.textContent = stage.copy;
    currentBadge.textContent = stage.badge;
    currentBullets.innerHTML = stage.bullets.map((b) => `<li>${b}</li>`).join('');
    pipelineDiagram.dataset.mode = stage.mode;

    if (packetMain) packetMain.style.left = `${stage.mainLeft ?? 12}%`;
    if (packetBackward) packetBackward.style.left = `${stage.backwardLeft ?? 58}%`;
    if (packetResidual) packetResidual.style.left = `${stage.residualLeft ?? 47}%`;
  };

  stagePills.forEach((pill, index) => {
    pill.addEventListener('click', () => {
      stageIndex = index;
      renderStage();
    });
  });

  renderStage();
  setInterval(() => {
    stageIndex = (stageIndex + 1) % stageMeta.length;
    renderStage();
  }, 4200);
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
