# Phase 1 — Pretraining fundamentals

## Goal
Get comfortable with the building blocks of GPT-style pretraining without getting lost in model hype.

## Big idea
A pretrained language model is just a next-token prediction machine.
It learns statistical structure from lots of text, then uses that structure to predict the next token in a sequence.

## What to learn
- tokenization and vocab size
- embeddings and learned vector spaces
- attention and causal masking
- Query / Key / Value mechanics
- transformer blocks, residuals, MLPs
- loss, optimizer, learning rate, checkpoints
- GPU memory, sequence length, and throughput bottlenecks
- how to use nanoGPT as a hands-on lab

## Key concepts

### Tokens
Text is split into smaller pieces called tokens. The model never sees raw strings directly.

### Embeddings
Each token id maps to a learned vector. This is like a lookup table with trainable features.

### Attention
Attention lets each token gather context from earlier tokens. It is the model’s routing mechanism.

### Q / K / V
- **Query**: what this token wants
- **Key**: how other tokens identify themselves
- **Value**: the information to pass along

### Transformer block
A repeating unit made of attention, residual connections, layer norm, and an MLP.
Attention mixes context across tokens; the MLP transforms each token locally.

### Training
The model predicts the next token, compares that guess to the real token, computes loss, and updates weights with backprop + optimizer.

## Today’s output
Be able to trace one batch through a tiny GPT-style training step and explain where the main bottlenecks are.

## Simple mental model
1. raw text becomes tokens
2. tokens become embeddings
3. embeddings flow through transformer blocks
4. attention mixes context
5. the model predicts the next token
6. loss drives backprop
7. optimizer updates weights
8. checkpoints save progress

## Hands-on path
- Read nanoGPT README
- Watch Karpathy’s GPT-from-scratch video
- Find the tokenizer, embedding layer, and attention block in code
- Run a tiny training job
- Inspect memory, speed, and checkpoints
- Change one knob at a time

## Exercises
- Explain Q / K / V in one sentence each
- Draw the data flow for one token through one transformer block
- Run a tiny config and note loss after a few steps
- Increase sequence length and predict what breaks first
- Reduce batch size and note what changes in memory use

## Exit criteria
You pass phase 1 when you can:
- define token, embedding, attention, Q/K/V, residual, MLP
- trace a batch through GPT-style training from input to checkpoint
- predict which knob affects memory vs throughput
- point to the relevant code in nanoGPT without getting lost

## Citations
- Karpathy repo: https://github.com/karpathy/nanoGPT
- Karpathy video: https://www.youtube.com/watch?v=kCc8FmEb1nY
- Karpathy channel: https://www.youtube.com/@AndrejKarpathy
- OpenAI research/news: https://openai.com/news/research/
- Anthropic newsroom: https://www.anthropic.com/news
- Meta AI blog: https://ai.meta.com/blog/
- Google DeepMind blog: https://deepmind.google/blog/
