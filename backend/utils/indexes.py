from database import db
async def create_indexes():
    try:
        # Users
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        await db.users.create_index("status")
        await db.users.create_index("inviteTokenHash", unique=True, sparse=True)

        # Sermons
        await db.sermons.create_index("createdAt")
        await db.sermons.create_index("type")
        await db.sermons.create_index("series")

        # Events
        await db.events.create_index("date")
        await db.events.create_index("category")

        # Parishes
        await db.parishes.create_index("name", unique=True)

        # Audit Logs
        await db.audit_logs.create_index("timestamp")
        await db.audit_logs.create_index("adminEmail")

        # Magazines
        await db.magazines.create_index("createdAt")
        await db.magazines.create_index("category")

        # Bible Studies
        await db.bible_studies.create_index("createdAt")
        await db.bible_studies.create_index("level")
        await db.bible_studies.create_index("book")

        # Documents
        await db.documents.create_index("createdAt")
        await db.documents.create_index("category")

        # Live Stream
        await db.live_stream.create_index("updatedAt")

        # Payments
        await db.payments.create_index("reference", unique=True)
        await db.payments.create_index("userId")
        await db.payments.create_index("status")
        await db.payments.create_index("type")
        await db.payments.create_index("createdAt")
        await db.payments.create_index("paidAt")
        await db.payments.create_index("parish")

        print("✅ MongoDB indexes created")

    except Exception as e:
        print("⚠️ MongoDB index creation skipped:", e)