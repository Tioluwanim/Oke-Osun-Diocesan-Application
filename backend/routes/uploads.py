from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from middleware.auth import require_authenticated
from utils.gcs import upload_file_to_gcs

router = APIRouter()
ALLOWED_FOLDERS = {"uploads", "sermons", "magazines", "bible-studies", "documents", "profiles"}
ALLOWED_CONTENT_PREFIXES = ("image/", "audio/", "video/", "application/pdf")

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("uploads"),
    current_user: dict = Depends(require_authenticated),
):
    normalized_folder = folder.strip().strip("/") or "uploads"
    if normalized_folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Invalid upload folder")
    if not file.content_type or not file.content_type.startswith(ALLOWED_CONTENT_PREFIXES):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    url = upload_file_to_gcs(file, normalized_folder)
    return {"message": "File uploaded successfully", "url": url}
