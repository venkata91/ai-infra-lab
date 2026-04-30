# Lesson 1 — From batch to loss

## Objective
Trace a single batch through a tiny GPT training step.

## Flow
- tokens in
- embeddings lookup
- transformer blocks
- next-token logits out
- cross-entropy loss
- backward pass
- optimizer step

## Questions to answer
- What shape is the tensor at each step?
- Where is the GPU memory going?
- Which step is compute-bound vs memory-bound?
- What changes if batch size doubles?

## Mini exercise
Change one variable in a tiny training run:
- batch size
- sequence length
- model width
- learning rate

Then record what breaks first.

## Reference
- https://www.youtube.com/watch?v=kCc8FmEb1nY
- https://github.com/karpathy/nanoGPT
