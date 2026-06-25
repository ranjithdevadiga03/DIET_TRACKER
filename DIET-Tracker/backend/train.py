import os
import torch
import numpy as np
from torch.utils.data import DataLoader, Dataset
from transformers import (
    DeiTImageProcessor,
    DeiTForImageClassification,
    get_linear_schedule_with_warmup,
)
from datasets import load_dataset
from PIL import Image
import time
import json

# --- Config ---
BASE_MODEL = "facebook/deit-base-distilled-patch16-224"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "models", "deit-food101")
NUM_EPOCHS = 4
BATCH_SIZE = 16
LEARNING_RATE = 3e-4
WARMUP_RATIO = 0.1
MAX_TRAIN_SAMPLES = 5000
MAX_EVAL_SAMPLES = 500
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Using device: {DEVICE}")


class FoodDataset(Dataset):
    def __init__(self, hf_dataset, processor, max_samples=None):
        self.processor = processor
        if max_samples:
            self.data = hf_dataset.select(range(min(max_samples, len(hf_dataset))))
        else:
            self.data = hf_dataset

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        try:
            item = self.data[idx]
            
            # Ensure image is PIL Image and convert to RGB
            image = item["image"]
            if not isinstance(image, Image.Image):
                image = Image.fromarray(np.array(image))
            image = image.convert("RGB")
            
            # Process image with proper tensor handling
            inputs = self.processor(images=image, return_tensors="pt")
            pixel_values = inputs["pixel_values"]
            
            # Ensure correct shape: (C, H, W) not (1, C, H, W)
            if pixel_values.dim() == 4:
                pixel_values = pixel_values.squeeze(0)
            
            label = item["label"]
            
            return {
                "pixel_values": pixel_values,
                "labels": torch.tensor(label, dtype=torch.long),
            }
        except Exception as e:
            print(f"Error processing item at index {idx}: {e}")
            # Return a valid zero tensor as fallback
            return {
                "pixel_values": torch.zeros(3, 224, 224),
                "labels": torch.tensor(0, dtype=torch.long),
            }


def main():
    print("Loading Food-101 dataset...")
    dataset = load_dataset("ethz/food101")
    train_hf = dataset["train"]
    eval_hf = dataset["validation"]

    num_labels = train_hf.features["label"].num_classes
    label_names = train_hf.features["label"].names
    print(f"Classes: {num_labels}")
    print(f"Total training samples: {len(train_hf)}")
    print(f"Total eval samples: {len(eval_hf)}")

    print(f"Loading base model: {BASE_MODEL}")
    processor = DeiTImageProcessor.from_pretrained(BASE_MODEL)
    model = DeiTForImageClassification.from_pretrained(
        BASE_MODEL,
        num_labels=num_labels,
        ignore_mismatched_sizes=True,
    )

    for param in model.parameters():
        param.requires_grad = False
    for param in model.classifier.parameters():
        param.requires_grad = True

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"Trainable params: {trainable:,} / {total:,} ({100 * trainable / total:.1f}%)")

    model.to(DEVICE)

    print(f"Preparing datasets ({MAX_TRAIN_SAMPLES} train, {MAX_EVAL_SAMPLES} eval)...")
    train_dataset = FoodDataset(train_hf, processor, MAX_TRAIN_SAMPLES)
    eval_dataset = FoodDataset(eval_hf, processor, MAX_EVAL_SAMPLES)

    # Validate first few samples to catch processing issues early
    print("Validating dataset samples...")
    for i in range(min(3, len(train_dataset))):
        try:
            sample = train_dataset[i]
            assert sample["pixel_values"].shape == torch.Size([3, 224, 224]), \
                f"Expected shape [3, 224, 224], got {sample['pixel_values'].shape}"
            assert sample["pixel_values"].dtype == torch.float32, \
                f"Expected float32, got {sample['pixel_values'].dtype}"
            print(f"  Sample {i+1}: ✓ Shape {sample['pixel_values'].shape}, Label: {sample['labels'].item()}")
        except Exception as e:
            print(f"  Sample {i+1}: ✗ Error - {e}")

    def collate_fn(batch):
        # Filter out any invalid batches
        valid_batch = [item for item in batch if item["pixel_values"].shape == torch.Size([3, 224, 224])]
        
        if not valid_batch:
            # Return empty batch if none are valid
            return {
                "pixel_values": torch.zeros(1, 3, 224, 224),
                "labels": torch.zeros(1, dtype=torch.long),
            }
        
        pixel_values = torch.stack([item["pixel_values"] for item in valid_batch])
        labels = torch.stack([item["labels"] for item in valid_batch])
        return {"pixel_values": pixel_values, "labels": labels}

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn)
    eval_loader = DataLoader(eval_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn)

    optimizer = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad],
        lr=LEARNING_RATE,
        weight_decay=0.01,
    )
    total_steps = len(train_loader) * NUM_EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps
    )

    best_accuracy = 0.0 
    for epoch in range(NUM_EPOCHS):
        print(f"\n{'='*50}")
        print(f"Epoch {epoch + 1}/{NUM_EPOCHS}")
        print(f"{'='*50}")

        model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        start_time = time.time()

        for step, batch in enumerate(train_loader):
            try:
                pixel_values = batch["pixel_values"].to(DEVICE)
                labels = batch["labels"].to(DEVICE)
                
                # Validate batch shapes
                assert pixel_values.shape[0] > 0, "Empty batch"
                assert pixel_values.shape[1:] == torch.Size([3, 224, 224]), \
                    f"Invalid pixel shape: {pixel_values.shape}"
                
                outputs = model(pixel_values=pixel_values, labels=labels)
                loss = outputs.loss

                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()

                total_loss += loss.item()
                preds = outputs.logits.argmax(dim=-1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)

                if (step + 1) % 25 == 0:
                    elapsed = time.time() - start_time
                    avg_loss = total_loss / (step + 1)
                    acc = 100 * correct / total
                    print(f"  Step {step + 1}/{len(train_loader)} | Loss: {avg_loss:.4f} | Acc: {acc:.1f}% | Time: {elapsed:.0f}s")
            except Exception as e:
                print(f"  Error in step {step + 1}: {e}")
                continue

        avg_train_loss = total_loss / len(train_loader)
        train_acc = 100 * correct / total
        elapsed = time.time() - start_time
        print(f"Train - Loss: {avg_train_loss:.4f} | Acc: {train_acc:.1f}% | Time: {elapsed:.0f}s")

        model.eval()
        eval_correct = 0
        eval_total = 0
        eval_loss = 0.0

        with torch.no_grad():
            for batch in eval_loader:
                try:
                    pixel_values = batch["pixel_values"].to(DEVICE)
                    labels = batch["labels"].to(DEVICE)
                    
                    # Validate batch shapes
                    assert pixel_values.shape[0] > 0, "Empty batch"
                    assert pixel_values.shape[1:] == torch.Size([3, 224, 224]), \
                        f"Invalid pixel shape: {pixel_values.shape}"
                    
                    outputs = model(pixel_values=pixel_values, labels=labels)
                    eval_loss += outputs.loss.item()
                    preds = outputs.logits.argmax(dim=-1)
                    eval_correct += (preds == labels).sum().item()
                    eval_total += labels.size(0)
                except Exception as e:
                    print(f"  Error in eval batch: {e}")
                    continue

        eval_acc = 100 * eval_correct / eval_total
        avg_eval_loss = eval_loss / len(eval_loader)
        print(f"Eval  - Loss: {avg_eval_loss:.4f} | Acc: {eval_acc:.1f}%")

        if eval_acc > best_accuracy:
            best_accuracy = eval_acc
            print(f"New best accuracy: {eval_acc:.1f}% — saving model...")
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            model.save_pretrained(OUTPUT_DIR)
            processor.save_pretrained(OUTPUT_DIR)

            label_map = {i: name for i, name in enumerate(label_names)}
            with open(os.path.join(OUTPUT_DIR, "label_map.json"), "w") as f:
                json.dump(label_map, f, indent=2)

    print(f"\nTraining complete. Best accuracy: {best_accuracy:.1f}%")
    print(f"Model saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
