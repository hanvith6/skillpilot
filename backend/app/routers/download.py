from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.services.auth import get_current_user
from app.services.documents import generate_pdf, generate_docx
from app.db import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["download"])


@router.get("/download/{history_id}/{format}")
async def download_document(
    history_id: str,
    format: str,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    result = db.table("generation_history").select("*").eq(
        "id", history_id
    ).eq("user_id", current_user["id"]).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found")

    doc_type = result.data["type"].lower()
    content = result.data["content"]

    if format == "pdf":
        buffer = generate_pdf(content, doc_type)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={doc_type}_{history_id}.pdf"},
        )
    elif format == "docx":
        buffer = generate_docx(content, doc_type)
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={doc_type}_{history_id}.docx"},
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'docx'.")
