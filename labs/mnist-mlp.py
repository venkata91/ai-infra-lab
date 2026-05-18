"""
labs/mnist-mlp.py
=================

A hands-on companion to the Basics page of the AI Infra Lab. Trains a
3-layer MLP on MNIST, then runs two experiments that map directly to
concept cards on the site:

  - Learning-rate sweep   (Basics -> "Learning rate")
  - Dropout vs no-dropout (Basics -> "Regularization", "Overfitting")

How to run
----------

Option A: Google Colab (recommended for first time)
  1. New notebook -> Runtime -> Change runtime type -> T4 GPU.
  2. Copy each `# %%` section into its own cell and run top to bottom.

Option B: local Python
  pip install torch torchvision matplotlib
  python labs/mnist-mlp.py

Option C: any Jupyter env (Kaggle, Lightning AI Studios, local)
  paste cells as above.

Training time
-------------
  CPU (M2 / modern laptop):  ~6-10 minutes total
  T4 GPU (Colab free tier):  ~1 minute total

You will see ~98% test accuracy after 5 epochs.
"""

# %%
# ===== Cell 1: imports + device =====
import math
import time

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms

import matplotlib.pyplot as plt

device = "cuda" if torch.cuda.is_available() else "cpu"
torch.manual_seed(0)
print(f"Using {device}")


# %%
# ===== Cell 2: data =====
# MNIST: 60k training images, 10k test images, each 28x28 grayscale.
tfm = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,)),  # standard MNIST normalization
])
train_ds = datasets.MNIST(root="./data", train=True,  download=True, transform=tfm)
test_ds  = datasets.MNIST(root="./data", train=False, download=True, transform=tfm)

train_loader = DataLoader(train_ds, batch_size=128, shuffle=True)
test_loader  = DataLoader(test_ds,  batch_size=512)

print(f"train: {len(train_ds):,} examples | test: {len(test_ds):,} examples")


# %%
# ===== Cell 3: the model =====
# A 3-layer MLP: 784 -> 256 -> 64 -> 10. Maps to:
#   - Basics "Layer"        -> each nn.Linear
#   - Basics "Parameters"   -> ~218k trainable weights & biases
#   - Basics "Depth vs width" -> 3 layers deep, 256 wide at most
class MLP(nn.Module):
    def __init__(self, hidden1=256, hidden2=64, dropout=0.0):
        super().__init__()
        self.fc1 = nn.Linear(28 * 28, hidden1)
        self.fc2 = nn.Linear(hidden1, hidden2)
        self.fc3 = nn.Linear(hidden2, 10)
        self.dropout = nn.Dropout(dropout) if dropout > 0 else nn.Identity()

    def forward(self, x):
        x = x.view(x.size(0), -1)        # flatten 28x28 -> 784
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        return self.fc3(x)               # raw logits

def count_params(m):
    return sum(p.numel() for p in m.parameters())


# %%
# ===== Cell 4: one training run (the canonical loop) =====
# This is the exact training loop from the Basics page, applied to MNIST.
def train_one(model, train_loader, test_loader, epochs=5, lr=1e-3, weight_decay=1e-4, verbose=True):
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    history = {"epoch": [], "train_loss": [], "test_acc": []}

    for epoch in range(1, epochs + 1):
        # ---- train ----
        model.train()
        running_loss, n = 0.0, 0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()              # clear old gradients
            pred = model(x)                    # forward
            loss = F.cross_entropy(pred, y)    # how wrong
            loss.backward()                    # autograd: gradients for every param
            optimizer.step()                   # nudge params
            running_loss += loss.item() * x.size(0)
            n += x.size(0)
        train_loss = running_loss / n

        # ---- eval ----
        model.eval()
        correct = 0
        with torch.no_grad():
            for x, y in test_loader:
                x, y = x.to(device), y.to(device)
                correct += (model(x).argmax(1) == y).sum().item()
        test_acc = correct / len(test_loader.dataset)

        history["epoch"].append(epoch)
        history["train_loss"].append(train_loss)
        history["test_acc"].append(test_acc)
        if verbose:
            print(f"  epoch {epoch}: train_loss={train_loss:.4f}  test_acc={test_acc:.4f}")

    return history


print("\n--- Baseline run ---")
model = MLP().to(device)
print(f"params: {count_params(model):,}")
t0 = time.time()
baseline = train_one(model, train_loader, test_loader, epochs=5, lr=1e-3)
print(f"baseline trained in {time.time() - t0:.1f}s, final test_acc={baseline['test_acc'][-1]:.4f}")


# %%
# ===== Cell 5: loss + accuracy plot =====
fig, (ax_loss, ax_acc) = plt.subplots(1, 2, figsize=(10, 3.5))

ax_loss.plot(baseline["epoch"], baseline["train_loss"], marker="o", color="#3a55c4")
ax_loss.set_title("Training loss")
ax_loss.set_xlabel("epoch")
ax_loss.set_ylabel("cross-entropy")
ax_loss.grid(alpha=0.3)

ax_acc.plot(baseline["epoch"], baseline["test_acc"], marker="o", color="#ee8a30")
ax_acc.set_title("Test accuracy")
ax_acc.set_xlabel("epoch")
ax_acc.set_ylabel("accuracy")
ax_acc.set_ylim(0.9, 1.0)
ax_acc.grid(alpha=0.3)

plt.tight_layout()
plt.show()


# %%
# ===== Cell 6: learning-rate sweep =====
# Trains a fresh model at each learning rate. Watch the "too small / just
# right / too large" pattern from the Basics "Learning rate" card come to
# life on a real dataset.

LRS = [1e-5, 1e-3, 1e-1, 1.0]
SWEEP_EPOCHS = 3

sweep_results = {}
print("\n--- Learning rate sweep ---")
for lr in LRS:
    print(f"\nlr = {lr}")
    m = MLP().to(device)
    h = train_one(m, train_loader, test_loader, epochs=SWEEP_EPOCHS, lr=lr, verbose=True)
    final = h["train_loss"][-1]
    if math.isnan(final) or math.isinf(final):
        print(f"  --> diverged to NaN/inf. That IS the lesson: lr={lr} is way too large.")
    sweep_results[lr] = h

# plot all four train-loss curves on one chart; skip diverged runs so the
# chart is readable instead of squashed by an inf
plt.figure(figsize=(8, 4.5))
for lr, h in sweep_results.items():
    losses = h["train_loss"]
    if any(math.isnan(v) or math.isinf(v) for v in losses):
        continue  # diverged; reported above
    plt.plot(h["epoch"], losses, marker="o", label=f"lr={lr}")
plt.xlabel("epoch")
plt.ylabel("training cross-entropy")
plt.title("Learning rate sweep on MNIST MLP (diverged runs omitted)")
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()

# Expected pattern:
#   lr=1e-5:  loss barely moves       (too small)
#   lr=1e-3:  smooth decay            (just right)
#   lr=1e-1:  noisy, may oscillate    (large)
#   lr=1.0 :  diverges / NaN          (way too large)


# %%
# ===== Cell 7: dropout vs no-dropout on a tiny subset =====
# With the full 60k MNIST training set there is enough data that overfitting
# is mild. To make the difference visible we use a small subset (2000 examples)
# and train for many epochs. Watch the no-dropout model's test accuracy peak
# and then drift down, while the dropout model holds its peak longer.

SMALL_N = 1000
SMALL_EPOCHS = 40

small_train = Subset(train_ds, range(SMALL_N))
small_loader = DataLoader(small_train, batch_size=64, shuffle=True)

# weight_decay=0 here: we want to isolate the effect of dropout, not have
# AdamW's built-in L2 regularization muddy the comparison.
print("\n--- Overfitting demo (no-dropout, no weight-decay) ---")
m_plain = MLP(dropout=0.0).to(device)
h_plain = train_one(m_plain, small_loader, test_loader,
                    epochs=SMALL_EPOCHS, lr=1e-3, weight_decay=0.0, verbose=False)

print("--- Overfitting demo (dropout=0.4, no weight-decay) ---")
m_drop = MLP(dropout=0.4).to(device)
h_drop = train_one(m_drop, small_loader, test_loader,
                   epochs=SMALL_EPOCHS, lr=1e-3, weight_decay=0.0, verbose=False)

# plot test accuracy curves side-by-side
plt.figure(figsize=(8, 4.5))
plt.plot(h_plain["epoch"], h_plain["test_acc"], marker="o", color="#ee8a30",
         label="no dropout")
plt.plot(h_drop["epoch"],  h_drop["test_acc"],  marker="o", color="#3a55c4",
         label="dropout=0.4")
plt.xlabel("epoch")
plt.ylabel("test accuracy")
plt.title(f"Overfitting on {SMALL_N}-example MNIST subset")
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()

print(f"\nno-dropout : peak {max(h_plain['test_acc']):.4f}, final {h_plain['test_acc'][-1]:.4f}")
print(f"dropout    : peak {max(h_drop['test_acc']):.4f}, final {h_drop['test_acc'][-1]:.4f}")


# %%
# ===== Cell 8: where to go next =====
# Things to try once everything above works:
#   1. Change batch size (try 8, 32, 512). Watch wall-clock vs final accuracy.
#   2. Replace AdamW with plain SGD + momentum. Tune learning rate.
#   3. Add a LR scheduler: torch.optim.lr_scheduler.CosineAnnealingLR.
#   4. Swap the model: MLP -> small CNN. Compare accuracy and params.
#   5. Move to karpathy/nanoGPT. The training loop is the same; the model
#      and data change.
#
# Reference back to the site:
#   - Basics:        building blocks, forward/backward, gradient descent
#   - Phase 1:       tokens, embeddings, attention, training loop
#   - Phase 2:       distributed training (when one GPU isn't enough)
#   - Phase 3:       serving the trained model
#   - Phase 4:       training -> inference tradeoffs
