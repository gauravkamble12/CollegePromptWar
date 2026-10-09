from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.user import User, RoleEnum
from backend.app.models.report import CivicReport, ReportCategory, ReportStatus, ModerationLog
from backend.app.schemas.report import CivicReportCreate, CivicReportResponse, ModerationActionRequest
from backend.app.security.auth import get_current_user_optional, require_role
from backend.app.security.rate_limit import rate_limit
from backend.app.security.exif import sanitize_and_save_image
from backend.app.services.duplicate_detector import detect_potential_duplicate, analyze_spam_indicators

router = APIRouter(prefix="/reports", tags=["Citizen Reporting & Moderation"])

@router.get("", response_model=List[CivicReportResponse])
def get_reports(
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CivicReport)
    if status_filter:
        query = query.filter(CivicReport.status == status_filter)
    if category:
        query = query.filter(CivicReport.category == category)
    
    reports = query.order_by(CivicReport.created_at.desc()).all()
    return [CivicReportResponse.model_validate(r) for r in reports]

@router.post("", response_model=CivicReportResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(rate_limit(20, 60))])
def submit_report(
    report_in: CivicReportCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Spam check
    if analyze_spam_indicators(report_in.title, report_in.description):
        raise HTTPException(
            status_code=400,
            detail="Report text contains excessive repetitive patterns or insufficient descriptive content."
        )

    # Check for proximity duplicate
    existing = db.query(CivicReport).filter(
        CivicReport.status.in_([ReportStatus.SUBMITTED, ReportStatus.PENDING_REVIEW, ReportStatus.VERIFIED])
    ).all()
    dup = detect_potential_duplicate(
        report_in.category.value,
        report_in.latitude,
        report_in.longitude,
        existing,
        max_distance_meters=150.0
    )

    duplicate_of_id = None
    if dup:
        # Corroborate existing report instead of creating ghost duplicate
        dup.corroboration_count += 1
        duplicate_of_id = dup.id
        db.commit()

    # Create new report
    new_report = CivicReport(
        reporter_id=current_user.id if current_user else None,
        category=report_in.category,
        title=report_in.title,
        description=report_in.description,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        address_reference=report_in.address_reference,
        severity_level=report_in.severity_level or "medium",
        photo_url=report_in.photo_url,
        voice_note_url=report_in.voice_note_url,
        voice_transcript=report_in.voice_transcript,
        status=ReportStatus.PENDING_REVIEW,
        is_duplicate_of_id=duplicate_of_id,
        ai_vision_tags=["citizen_verified" if dup else "new_submission"]
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return CivicReportResponse.model_validate(new_report)

@router.post("/upload-photo", dependencies=[Depends(rate_limit(10, 60))])
async def upload_report_photo(
    file: UploadFile = File(...)
):
    contents = await file.read()
    try:
        sanitized_path = sanitize_and_save_image(contents, file.filename or "upload.jpg", settings.UPLOAD_DIR)
        return {
            "url": sanitized_path,
            "message": "Image uploaded successfully. All EXIF metadata and GPS tags have been securely removed."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{report_id}/moderate", response_model=CivicReportResponse)
def moderate_report(
    report_id: int,
    action: ModerationActionRequest,
    current_moderator: User = Depends(require_role([RoleEnum.MODERATOR, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    report = db.query(CivicReport).filter(CivicReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Civic report not found.")

    prev_status = report.status.value
    report.status = action.new_status
    if action.is_duplicate_of_id:
        report.is_duplicate_of_id = action.is_duplicate_of_id

    # Create audit log
    log = ModerationLog(
        report_id=report.id,
        moderator_id=current_moderator.id,
        previous_status=prev_status,
        new_status=action.new_status.value,
        moderator_note=action.moderator_note or f"Status changed to {action.new_status.value}",
        action_timestamp=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    db.refresh(report)

    return CivicReportResponse.model_validate(report)
