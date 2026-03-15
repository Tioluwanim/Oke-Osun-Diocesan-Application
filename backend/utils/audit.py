from database import db
from utils.helpers import utcnow


async def log_audit(
    admin_email: str,
    admin_name: str,
    action: str,
    target_id: str = None,
    target_email: str = None,
    details: str = None,
):
    await db.audit_logs.insert_one({
        "adminEmail":  admin_email,
        "adminName":   admin_name,
        "action":      action,        # e.g. "APPROVE_USER", "DELETE_USER", "CHANGE_ROLE"
        "targetId":    target_id,
        "targetEmail": target_email,
        "details":     details,
        "timestamp":   utcnow(),
    })