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
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if not creds_path:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_APPLICATION_CREDENTIALS is not configured"
        )

    try:
        return storage.Client.from_service_account_json(creds_path)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize GCS client: {exc}"
        )


def upload_file_to_gcs(file: UploadFile, folder: str = "uploads") -> str:
    bucket_name = _get_bucket_name()
    client = _get_storage_client()

    bucket = client.bucket(bucket_name)

    extension = os.path.splitext(file.filename)[1] if file.filename else ""
    filename = f"{uuid4().hex}{extension}"
    blob_name = f"{folder.strip('/')}/{filename}"

    blob = bucket.blob(blob_name)

    try:
        blob.upload_from_file(
            file.file,
            content_type=file.content_type or "application/octet-stream"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file to GCS: {exc}"
        )

    # Optional public access (only if bucket allows it)
    try:
        blob.make_public()
        return blob.public_url
    except Exception:
        return f"gs://{bucket_name}/{blob_name}"