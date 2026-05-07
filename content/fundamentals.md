# Fundamentals — the building blocks of every neural network

Before you can read transformer code or reason about AI infrastructure, you need a clean mental model of what a neural network actually *is* and how it learns. This page is that grounding.

## Goal
Be able to answer, without notes:
- What is a neuron, layer, model, parameter?
- What does the forward pass do? The backward pass?
- Why does gradient descent work, and what does the optimizer actually update?
- When should you stop training, and what is overfitting?

---

## 1. Neuron

The smallest unit of a neural network. It is a tiny math function:

```
output = f(w1*x1 + w2*x2 + ... + wn*xn + b)
```

- `x1..xn` are inputs.
- `w1..wn` are **weights** — how much each input matters.
- `b` is a **bias** — a baseline offset.
- `f` is a **nonlinear activation** like ReLU, GELU, or sigmoid.

Without `f`, a stack of neurons would collapse into a single linear function. The nonlinearity is what gives neural networks their expressive power.

## 2. Layer

A **layer** is a row of neurons that all receive the same input vector. Each neuron has its own weights and bias, so each produces a different output. A fully connected layer with 3 inputs and 4 neurons:

- has a weight matrix of shape `(4, 3)` — 12 weights
- has a bias vector of length 4
- computes `y = W*x + b`, then applies an activation

```python
import torch.nn as nn
layer = nn.Linear(in_features=3, out_features=4)
y = torch.relu(layer(x))
```

Other layer types encode different structure: `nn.Conv2d` for images, `nn.LSTM` for sequences, `nn.MultiheadAttention` for transformers. The mental model is the same: tensor in, tensor out, learnable parameters inside.

## 3. Model

A **model** is layers stacked together. It is a function of inputs and parameters:

```
output = model(input, parameters)
```

```python
class SimpleModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 64)
        self.fc3 = nn.Linear(64, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)
```

`nn.Module` automatically tracks every learnable parameter. `model.parameters()` is what you hand to the optimizer.

## 4. Parameters / weights

- **Parameter** = any value the optimizer updates. Includes weights and biases.
- **Weight** = the multiplicative parameters connecting inputs to a neuron.
- **Bias** = the additive offset.

The model above has 218,058 parameters total. A modern frontier LLM has 100B-1T+. Scale of parameters is what people mean by "model size."

## 5. Depth vs width

Two ways to make a model bigger:

- **Depth** — more layers stacked sequentially. Deeper networks compose progressively more abstract features. Vision: edges, then shapes, then objects.
- **Width** — more neurons per layer. Wider layers represent more parallel features at each level.

Both increase **capacity** (the range of functions the model can represent). Real architectures balance both. ResNet-50: 50 layers deep, hundreds of channels wide. GPT-3: 96 layers deep, hidden size 12,288.

---

## 6. Forward pass

The forward pass is just running the model. Inputs flow through layers, producing predictions and a loss. Same as evaluating any math function.

```python
pred = model(x)
loss = loss_fn(pred, y_true)
```

While this runs, PyTorch's **autograd** is silently doing extra work: every operation with a parameter is recorded as a node in a computation graph. Each node remembers what tensors it needs to compute the gradient later.

## 7. Backward pass

After the forward pass we have a single scalar `loss`. We want to know, for each parameter `p`:

> If I nudge `p` slightly, does loss go up or down, and by how much?

That is the **gradient** `dloss/dp`. Computing every gradient at once is what `loss.backward()` does. It walks the recorded graph in reverse, applying the **chain rule** layer by layer, accumulating gradients into `p.grad` on every leaf parameter.

This is **backpropagation**. It is just the chain rule from calculus, executed efficiently on a graph.

Why "backward"? Because the chain rule naturally factors gradient computation from the output side. To know how `p` in an early layer affects the loss, you first need to know how every layer between `p` and the loss reacts. So the algorithm starts at the loss and propagates errors backward.

## 8. Gradient descent

Once we have gradients, we update parameters in the **opposite** direction (which lowers the loss):

```
p <- p - learning_rate * p.grad
```

Repeat for many batches and many epochs. This is **gradient descent**. The whole training cycle is:

```
forward  ->  loss  ->  backward  ->  optimizer.step()
```

repeated millions of times.

## 9. Learning rate

The single most important hyperparameter. It controls **step size**.

- Too small: training crawls; you may run out of compute before convergence.
- Too large: updates overshoot minima; loss oscillates or diverges to NaN.
- Just right: smooth, fast convergence.

Typical defaults: `1e-4` to `1e-2`. Always tune this first.

### Schedules

The best learning rate often changes during training. Common patterns: warmup followed by cosine decay (LLM standard), step decay, or cosine annealing.

### Adaptive learning rates

Different parameters often need different effective step sizes. **Adam** and **AdamW** maintain a running average of recent gradient magnitudes per parameter, then scale the step size accordingly. This makes them robust to hyperparameter choices and is why they are the default for most modern work.

## 10. SGD and optimizers

**SGD = Stochastic Gradient Descent**. The "stochastic" part means we estimate the gradient on a small random batch instead of the full dataset. Three flavors:

| Flavor | Gradient over | Note |
|---|---|---|
| Batch GD | the entire dataset | Too expensive to be practical |
| Pure SGD | one example | Very noisy, but escapes bad minima |
| Mini-batch SGD | a random batch (32, 64, 256, ...) | What everyone actually uses |

Mini-batch SGD is what people mean when they say "SGD" today. It maps perfectly to GPU parallelism.

Common optimizer choices:

| Optimizer | When to use |
|---|---|
| SGD with momentum | Vision (CNNs), often best final accuracy if tuned |
| Adam | Good default for new projects |
| AdamW | LLMs, transformers — current standard |

All of them are descendants of SGD. The differences are how they smooth, accumulate, and adapt the per-parameter step.

---

## 11. The training loop

Putting it together:

```python
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)

for epoch in range(num_epochs):
    model.train()
    for x, y in train_loader:
        optimizer.zero_grad()       # clear old gradients
        pred = model(x)             # forward
        loss = loss_fn(pred, y)     # compare to target
        loss.backward()             # autograd computes p.grad for every parameter
        optimizer.step()            # apply update rule

    # validation
    model.eval()
    with torch.no_grad():
        for x, y in val_loader:
            ...
```

Key gotchas:
- `optimizer.zero_grad()` is required because PyTorch **accumulates** gradients in `p.grad`. Forgetting it produces silently wrong gradients.
- `model.train()` / `model.eval()` toggles dropout and batch norm between training and inference behavior.
- `torch.no_grad()` during validation skips graph construction, saving memory.

---

## 12. Overfitting and validation

Driving training loss to zero is almost always wrong. The goal is **generalization** to new data, not memorization of the training set.

```
loss
  | training loss keeps falling forever
  |\
  | \____
  |      \________________
  |
  | validation loss bottoms out, then rises
  |\
  | \
  |  \____
  |       \______
  |              \____  <-- stop here ("early stopping")
  |                   \________________
  +---------------------------------> epoch
```

Three-way split: train (~80%) / validation (~10%) / test (~10%). Train on training data, monitor validation loss, evaluate the final model on test data.

### Fighting overfitting

- More data (the most effective fix)
- Data augmentation
- **Weight decay** — penalize the L2 norm of weights so the optimizer prefers small weights and smoother functions. Set on the optimizer: `AdamW(..., weight_decay=1e-4)`.
- **Dropout** — randomly zero a fraction of activations during training. Forces redundancy; the model cannot rely on any single neuron. Off during `model.eval()`. `nn.Dropout(p=0.5)`.
- Smaller model, or early stopping
- Batch normalization / LayerNorm

## 13. Double descent

Classical theory says: as you increase model capacity, test error first decreases (underfitting) then increases (overfitting). U-shape.

Modern overparameterized models break this. As you keep growing capacity past the point where the model can perfectly fit the training data, test error often **decreases again**:

```
test error
  |\
  | \____
  |      \  <-- peak at the "interpolation threshold"
  |     /\        (parameters ~= data points)
  |    /  \
  |   /    \_
  | _/       \__
  |             \____  <-- second descent: bigger is better
  +-----------------------------> model size
```

Why? At very high capacity there are infinitely many parameter settings that fit the training data perfectly. SGD's noise plus weight decay biases the optimizer toward **flat, low-magnitude** solutions, which generalize well. Scale itself acts like a regularizer.

This is part of why "make it bigger and train on more data" has been the dominant recipe for LLMs. It overturns part of the classical bias-variance story.

---

## 14. Worked example: learning y = 3x

To see all of this in one place, train a model with a single parameter `w` to learn the relationship `y = 3x` from one data point.

```python
import torch

x = torch.tensor(2.0)
y_true = torch.tensor(6.0)               # 3 * 2
w = torch.tensor(1.0, requires_grad=True) # start with a wrong guess

learning_rate = 0.1
for step in range(20):
    # forward
    y_pred = w * x
    loss = (y_pred - y_true) ** 2

    # backward
    loss.backward()

    # update
    with torch.no_grad():
        w -= learning_rate * w.grad
    w.grad.zero_()

    print(f"step {step}: w={w.item():.4f}, loss={loss.item():.4f}")
```

What happens at step 0:

```
forward:
  y_pred = 1.0 * 2.0 = 2.0
  loss   = (2.0 - 6.0)^2 = 16.0

autograd graph (built during forward):
  w --+
       \
        MulBackward (saves x=2)
       /
  x --+
        |
        v
        SubBackward
        |
        v
        PowBackward (saves diff=-4)
        |
        v
       loss

backward (chain rule, walking the graph in reverse):
  dloss/ddiff   = 2 * diff = -8
  dloss/dy_pred = -8 * 1   = -8
  dloss/dw      = -8 * x   = -16

  -> w.grad = -16

update:
  w = 1.0 - 0.1 * (-16) = 2.6
```

Convergence:

```
step 0: w=2.6000, loss=16.0000
step 1: w=2.9200, loss=0.6400
step 2: w=2.9840, loss=0.0256
...
step 10: w=3.0000, loss=0.0000
```

`w` converges to 3.0, the true answer. The same mechanics scale up unchanged to 175B-parameter models — just with more parameters, more layers, more data, and more compute.

---

## Exit criteria
You are done with this page when you can:
- Define neuron, layer, model, parameter, weight, bias, depth, width.
- Explain what the forward pass and backward pass do, in plain English.
- Write the training loop from memory: `zero_grad -> forward -> loss -> backward -> step`.
- Explain why mini-batch SGD is preferred over full-batch or single-example.
- Describe one regularization technique and what it protects against.
- Describe what overfitting looks like in a loss curve, and how to detect it.

## Reading
- 3Blue1Brown: But what is a neural network? https://www.youtube.com/watch?v=aircAruvnKk
- Karpathy: The spelled-out intro to neural networks and backprop https://www.youtube.com/watch?v=VMj-3S1tku0
- PyTorch autograd tutorial https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html
- Belkin et al., Reconciling modern machine-learning practice and the classical bias-variance trade-off (double descent) https://arxiv.org/abs/1812.11118
