import json
from typing import List, Optional, Tuple
from fastapi import Request, UploadFile, HTTPException


async def parse_form_or_json(
    request: Request,
    field_names: List[str],
    file_field: str = "file",
) -> Tuple[dict, Optional[UploadFile]]:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        data = {}
        for field in field_names:
            value = form.get(field)
            if value in (None, "", "null"):
                data[field] = None
            else:
                data[field] = value
        file = form.get(file_field)
        return data, file if isinstance(file, UploadFile) else None

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    return {field: payload.get(field) for field in field_names}, None


def parse_optional_int(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    try:
        return int(value)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Expected an integer value")


def parse_json_field(value: Optional[str], label: str):
    if value is None:
        return None
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid JSON for {label}")
