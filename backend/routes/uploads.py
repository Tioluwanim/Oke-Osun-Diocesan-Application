from fastapi import APIRouter, UploadFile, File, Form, Depends
from middleware.auth import require_clergy
from utils.gcs import upload_file_to_gcs

router = APIRouter()

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("uploads"),
    current_user: dict = Depends(require_clergy),
):
    url = upload_file_to_gcs(file, folder)
    return {"message": "File uploaded successfully", "url": url}
