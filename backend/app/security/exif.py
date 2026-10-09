import io
import os
import uuid
from PIL import Image

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit

def sanitize_and_save_image(file_bytes: bytes, filename: str, upload_dir: str) -> str:
    """
    Validates image, strips all metadata/EXIF (including GPS tags), 
    and saves a clean sanitized JPEG version.
    Returns relative path of saved image.
    """
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError("Image file exceeds maximum allowable size (5 MB).")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError(f"Unsupported image format: {ext}. Allowed: {ALLOWED_IMAGE_EXTENSIONS}")

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # Verify file is not corrupt
    except Exception as e:
        raise ValueError(f"Corrupt or invalid image format: {str(e)}")

    # Re-open for actual processing (verify closes stream)
    image = Image.open(io.BytesIO(file_bytes))

    # Convert to RGB to ensure compatibility and remove alpha or palette
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Create clean image by raw buffer copy to strip all metadata/EXIF dictionaries completely
    clean_image = Image.frombytes(image.mode, image.size, image.tobytes())

    unique_filename = f"{uuid.uuid4().hex}.jpg"
    dest_path = os.path.join(upload_dir, unique_filename)
    clean_image.save(dest_path, "JPEG", quality=85, optimize=True)

    return f"/uploads/{unique_filename}"
