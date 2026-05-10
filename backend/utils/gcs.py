import os
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from google.cloud import storage


def _get_bucket_name() -> str:
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="GCS_BUCKET_NAME is not configured")
    return bucket_name


def _get_storage_client() -> storage.Client:
    try:
        return storage.Client()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Google Cloud Storage client: {exc}")


def upload_file_to_gcs(file: UploadFile, folder: str = "uploads") -> str:
    bucket_name = _get_bucket_name()
    try:
        client = _get_storage_client()
    except HTTPException:
        raise
    bucket = client.bucket(bucket_name)
    extension = "" if not file.filename else os.path.splitext(file.filename)[1]
    filename = f"{uuid4().hex}{extension}"
    blob_name = f"{folder.strip('/')}/{filename}"
    blob = bucket.blob(blob_name)
    try:
        blob.upload_from_file(file.file, content_type=file.content_type or "application/octet-stream")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to upload file to GCS: {exc}")
    try:
        blob.make_public()
    except Exception:
        pass
    return blob.public_url
