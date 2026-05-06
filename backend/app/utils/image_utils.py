import numpy as np
from PIL import Image
import io

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_FILE_SIZE_MB   = 5

def validate_image(filename: str, file_size: int) -> tuple[bool, str]:
    """Validate image format and size."""
    ext = '.' + filename.rsplit('.', 1)[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid format. Allowed: {ALLOWED_EXTENSIONS}"

    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        return False, f"File too large. Max size: {MAX_FILE_SIZE_MB}MB"

    return True, "ok"

def preprocess_image(image_bytes: bytes, target_size=(128, 128)) -> np.ndarray:
    """
    Convert raw image bytes to numpy array ready for model inference.
    """
    img = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB (handles PNG with alpha channel)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize to model input size
    img = img.resize(target_size, Image.LANCZOS)

    # Convert to numpy array
    img_array = np.array(img, dtype=np.float32)

    return img_array