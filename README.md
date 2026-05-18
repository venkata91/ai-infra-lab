# ai-infra-lab

Lightweight static site for learning AI infrastructure end to end. A 5-phase journey from neural-network basics to production inference.

## Phases

- **Basics** — building blocks (neuron, layer, model, parameters, forward / backward, gradient descent, optimizers, regularization)
- **Phase 1** — pretraining fundamentals (tokens, embeddings, attention, training loop)
- **Phase 2** — pretraining systems + scale (DDP, FSDP, tensor / pipeline parallelism, checkpoints, throughput)
- **Phase 3** — inference fundamentals (KV cache, continuous batching, quantization, autoscaling)
- **Phase 4** — training → inference trade-offs (distillation, MoE, QAT, right-sizing)

Each phase has a tight scope, an LOE estimate, and a concrete deliverable.

## Pages

- `index.html` — landing page; links to every phase
- `basics.html` — building blocks of every neural network
- `phase-1.html` — pretraining fundamentals
- `phase-2.html` — pretraining systems + scale
- `phase-3.html` — inference fundamentals
- `phase-4.html` — training → inference trade-offs
- `content/fundamentals.md` — deep-dive notes with worked example (`y = 3x`)
- `content/phase-1.md` — pretraining-specific concepts and exercises
- `content/lesson-1-batch-to-loss.md` — tracing a single batch through training
- `labs/mnist-mlp.py` — Phase 1 warm-up lab: MLP on MNIST with learning-rate sweep + dropout demo. Runs in Google Colab or any Python.

## Operating docs

- `AGENT.md` — operating manual for anyone (human or AI) extending the site; documents the design system, page template, reusable components, and rules.
- `ACCOUNTABILITY.md` — weekly checkpoint structure.

## Run locally

```bash
cd ai-infra-lab
python3 -m http.server 8000
# open http://localhost:8000/
```

## Sources

- https://github.com/karpathy/nanoGPT
- https://www.youtube.com/watch?v=kCc8FmEb1nY
- https://www.youtube.com/@AndrejKarpathy
- https://openai.com/news/research/
- https://www.anthropic.com/news
- https://ai.meta.com/blog/
- https://deepmind.google/blog/
