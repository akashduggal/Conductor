import numpy as np


def generate_training_metrics(epoch: int, step: int, total_epochs: int) -> dict:
    """
    Generate realistic training metrics for simulation.
    Uses exponential decay for loss and sigmoid growth for accuracy.
    """
    progress = epoch / total_epochs
    
    # Loss: exponential decay with noise
    base_loss = 2.5
    decay_rate = 3.0
    loss = base_loss * np.exp(-decay_rate * progress) + np.random.normal(0, 0.05)
    loss = max(0.01, loss)  # Ensure loss is positive
    
    # Accuracy: sigmoid growth with noise
    base_accuracy = 0.1
    max_accuracy = 0.98
    growth_rate = 5.0
    accuracy = base_accuracy + (max_accuracy - base_accuracy) / (
        1 + np.exp(-growth_rate * (progress - 0.5))
    )
    accuracy += np.random.normal(0, 0.02)
    accuracy = np.clip(accuracy, 0.0, 1.0)
    
    # Learning rate: linear decay
    initial_lr = 0.001
    learning_rate = initial_lr * (1 - progress * 0.5)
    
    # Throughput: slight variation around base
    base_throughput = 320.0
    throughput = base_throughput + np.random.normal(0, 25)
    throughput = max(200, min(400, throughput))  # Clamp between 200-400
    
    return {
        "loss": float(loss),
        "accuracy": float(accuracy),
        "learning_rate": float(learning_rate),
        "throughput": float(throughput),
    }
