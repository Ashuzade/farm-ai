import numpy as np
from PIL import Image
import io

# More permissive — handles uppercase extensions too
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'}
MAX_FILE_SIZE_MB   = 5

def validate_image(filename: str, file_size: int) -> tuple:
    """Validate image format and size."""

    # Handle files with no extension
    if '.' not in filename:
        return False, "File has no extension"

    ext = '.' + filename.rsplit('.', 1)[-1].lower()

    if ext not in {'.jpg', '.jpeg', '.png', '.webp'}:
        return False, f"Invalid format '{ext}'. Allowed: jpg, jpeg, png, webp"

    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        return False, f"File too large ({file_size // 1024}KB). Max: {MAX_FILE_SIZE_MB}MB"

    if file_size == 0:
        return False, "File is empty"

    return True, "ok"

def preprocess_image(image_bytes: bytes, target_size=(128, 128)) -> np.ndarray:
    """Convert raw image bytes to numpy array ready for model inference."""
    try:
        img = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB — handles PNG with alpha, grayscale etc
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize to model input size
        img = img.resize(target_size, Image.LANCZOS)

        # Convert to numpy array
        img_array = np.array(img, dtype=np.float32)

        return img_array

    except Exception as e:
        raise ValueError(f"Failed to process image: {str(e)}")