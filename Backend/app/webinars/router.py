from datetime import timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from jose import jwt

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.models.webinars import Webinar, WebinarRegistration, SellerGoogleToken
from app.models.orders import Order, OrderStatus
from app.schemas.webinars import (
    WebinarCreate, WebinarUpdate, WebinarResponse,
    RegistrationResponse, GoogleAuthStatus,
)
from app.core.security import SECRET_KEY, ALGORITHM
from app.config import (
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FRONTEND_URL,
)

router = APIRouter()

SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _require_seller(current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.seller, UserRole.admin):
        raise HTTPException(403, "Solo sellers o admins")
    return current_user


def _get_optional_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Returns authenticated user or None without raising."""
    try:
        token = request.cookies.get("access_token")
        if not token:
            return None
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def _get_google_flow():
    try:
        from google_auth_oauthlib.flow import Flow
        return Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI],
                }
            },
            scopes=SCOPES,
            redirect_uri=GOOGLE_REDIRECT_URI,
        )
    except ImportError:
        raise HTTPException(500, "google-auth-oauthlib no está instalado")


def _get_calendar_service(token_record: SellerGoogleToken):
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        creds = Credentials(
            token=token_record.access_token,
            refresh_token=token_record.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
        )
        return build("calendar", "v3", credentials=creds)
    except ImportError:
        return None


def _create_meet_event(service, webinar: Webinar) -> dict:
    start = webinar.scheduled_at.astimezone(timezone.utc)
    end_dt = start + timedelta(minutes=webinar.duration_minutes)
    event = {
        "summary": webinar.title,
        "description": webinar.description or "",
        "start": {"dateTime": start.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "UTC"},
        "conferenceData": {
            "createRequest": {
                "requestId": webinar.id,
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }
    result = service.events().insert(
        calendarId="primary",
        body=event,
        conferenceDataVersion=1,
    ).execute()
    return {
        "meet_link": result.get("hangoutLink", ""),
        "google_event_id": result.get("id", ""),
    }


def _build_webinar_response(
    webinar: Webinar,
    db: Session,
    current_user: Optional[User] = None,
) -> dict:
    reg_count = len(webinar.registrations)
    is_registered = False
    if current_user:
        is_registered = any(
            r.student_id == current_user.id for r in webinar.registrations
        )
    return {
        "id": webinar.id,
        "seller_id": webinar.seller_id,
        "course_id": webinar.course_id,
        "title": webinar.title,
        "description": webinar.description,
        "scheduled_at": webinar.scheduled_at,
        "duration_minutes": webinar.duration_minutes,
        "meet_link": webinar.meet_link,
        "status": webinar.status,
        "max_attendees": webinar.max_attendees,
        "is_public": webinar.is_public,
        "recording_url": webinar.recording_url,
        "created_at": webinar.created_at,
        "seller_name": webinar.seller.full_name if webinar.seller else None,
        "course_title": webinar.course.title if webinar.course else None,
        "registration_count": reg_count,
        "is_registered": is_registered,
    }


# ─── Google OAuth endpoints ───────────────────────────────────────────────────

@router.get("/auth/google")
def google_auth_start(
    current_user: User = Depends(_require_seller),
):
    """Returns the Google OAuth authorization URL."""
    flow = _get_google_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=current_user.id,  # encode seller_id in state
    )
    return {"auth_url": auth_url}


@router.get("/auth/callback")
async def google_auth_callback(
    code: str,
    state: str,  # seller_id encoded in state
    db: Session = Depends(get_db),
):
    """Handles Google OAuth callback, saves tokens, redirects to frontend."""
    seller_id = state
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        raise HTTPException(400, "Seller no encontrado")

    flow = _get_google_flow()
    try:
        flow.fetch_token(code=code)
    except Exception as e:
        raise HTTPException(400, f"Error al intercambiar código: {e}")

    credentials = flow.credentials

    # Get Google account email
    google_email = None
    try:
        from googleapiclient.discovery import build
        oauth2_service = build("oauth2", "v2", credentials=credentials)
        user_info = oauth2_service.userinfo().get().execute()
        google_email = user_info.get("email")
    except Exception:
        pass

    # Save or update token record
    token_record = (
        db.query(SellerGoogleToken)
        .filter(SellerGoogleToken.seller_id == seller_id)
        .first()
    )
    if token_record:
        token_record.access_token = credentials.token
        if credentials.refresh_token:
            token_record.refresh_token = credentials.refresh_token
        token_record.google_email = google_email
    else:
        token_record = SellerGoogleToken(
            seller_id=seller_id,
            access_token=credentials.token,
            refresh_token=credentials.refresh_token or "",
            google_email=google_email,
        )
        db.add(token_record)

    db.commit()

    redirect_url = (
        f"{FRONTEND_URL}/?section=creators-resources&google_connected=true"
    )
    return RedirectResponse(url=redirect_url)


@router.get("/auth/status", response_model=GoogleAuthStatus)
def google_auth_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_seller),
):
    token_record = (
        db.query(SellerGoogleToken)
        .filter(SellerGoogleToken.seller_id == current_user.id)
        .first()
    )
    if token_record:
        return GoogleAuthStatus(connected=True, google_email=token_record.google_email)
    return GoogleAuthStatus(connected=False)


@router.delete("/auth/disconnect")
def google_auth_disconnect(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_seller),
):
    token_record = (
        db.query(SellerGoogleToken)
        .filter(SellerGoogleToken.seller_id == current_user.id)
        .first()
    )
    if token_record:
        db.delete(token_record)
        db.commit()
    return {"ok": True}


# ─── Webinar endpoints ────────────────────────────────────────────────────────

@router.get("/")
def list_public_webinars(
    request: Request,
    course_id: Optional[str] = Query(None),
    seller_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Public list of webinars (is_public=True). Includes is_registered if authenticated."""
    current_user = _get_optional_user(request, db)

    query = db.query(Webinar).filter(Webinar.is_public == True)
    if course_id:
        query = query.filter(Webinar.course_id == course_id)
    if seller_id:
        query = query.filter(Webinar.seller_id == seller_id)
    if status:
        query = query.filter(Webinar.status == status)

    webinars = query.order_by(Webinar.scheduled_at).all()
    return [_build_webinar_response(w, db, current_user) for w in webinars]


@router.get("/my-webinars")
def list_my_webinars(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_seller),
):
    """Returns all webinars for the authenticated seller."""
    webinars = (
        db.query(Webinar)
        .filter(Webinar.seller_id == current_user.id)
        .order_by(Webinar.scheduled_at.desc())
        .all()
    )
    return [_build_webinar_response(w, db, current_user) for w in webinars]


@router.post("/")
async def create_webinar(
    data: WebinarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_seller),
):
    webinar = Webinar(
        seller_id=current_user.id,
        title=data.title,
        description=data.description,
        scheduled_at=data.scheduled_at,
        duration_minutes=data.duration_minutes,
        course_id=data.course_id,
        max_attendees=data.max_attendees,
        is_public=data.is_public,
        meet_link=data.meet_link,
    )
    db.add(webinar)
    db.commit()
    db.refresh(webinar)

    # Try to create Google Meet event if seller has token
    token_record = (
        db.query(SellerGoogleToken)
        .filter(SellerGoogleToken.seller_id == current_user.id)
        .first()
    )
    if token_record:
        try:
            service = _get_calendar_service(token_record)
            if service:
                meet_data = _create_meet_event(service, webinar)
                webinar.meet_link = meet_data["meet_link"]
                webinar.google_event_id = meet_data["google_event_id"]
                db.commit()
                db.refresh(webinar)
        except Exception:
            pass  # Don't fail if Google Meet creation fails

    # Notify enrolled students if course is associated
    if data.course_id:
        try:
            from app.core.mail_config import send_webinar_notification
            enrolled_orders = (
                db.query(Order)
                .filter(
                    Order.course_id == data.course_id,
                    Order.status == OrderStatus.paid,
                )
                .all()
            )
            scheduled_str = webinar.scheduled_at.strftime("%d/%m/%Y %H:%M UTC")
            seller_name = current_user.full_name or current_user.email
            for order in enrolled_orders:
                student = db.query(User).filter(User.id == order.user_id).first()
                if student:
                    await send_webinar_notification(
                        email=student.email,
                        student_name=student.full_name or student.email,
                        webinar_title=webinar.title,
                        scheduled_at=scheduled_str,
                        meet_link=webinar.meet_link or "",
                        seller_name=seller_name,
                    )
        except Exception:
            pass  # Don't fail if email sending fails

    return _build_webinar_response(webinar, db, current_user)


@router.patch("/{webinar_id}")
def update_webinar(
    webinar_id: str,
    data: WebinarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    webinar = db.query(Webinar).filter(Webinar.id == webinar_id).first()
    if not webinar:
        raise HTTPException(404, "Webinar no encontrado")
    if webinar.seller_id != current_user.id and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(403, "No autorizado")

    old_scheduled_at = webinar.scheduled_at
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(webinar, field, value)
    db.commit()
    db.refresh(webinar)

    # Update Google Calendar event if time changed and seller has token
    if data.scheduled_at and data.scheduled_at != old_scheduled_at:
        token_record = (
            db.query(SellerGoogleToken)
            .filter(SellerGoogleToken.seller_id == webinar.seller_id)
            .first()
        )
        if token_record and webinar.google_event_id:
            try:
                service = _get_calendar_service(token_record)
                if service:
                    start = webinar.scheduled_at.astimezone(timezone.utc)
                    end_dt = start + timedelta(minutes=webinar.duration_minutes)
                    service.events().patch(
                        calendarId="primary",
                        eventId=webinar.google_event_id,
                        body={
                            "start": {"dateTime": start.isoformat(), "timeZone": "UTC"},
                            "end": {"dateTime": end_dt.isoformat(), "timeZone": "UTC"},
                        },
                    ).execute()
            except Exception:
                pass

    return _build_webinar_response(webinar, db, current_user)


@router.delete("/{webinar_id}", status_code=204)
def delete_webinar(
    webinar_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    webinar = db.query(Webinar).filter(Webinar.id == webinar_id).first()
    if not webinar:
        raise HTTPException(404, "Webinar no encontrado")
    if webinar.seller_id != current_user.id and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(403, "No autorizado")

    # Cancel Google Calendar event if exists
    if webinar.google_event_id:
        token_record = (
            db.query(SellerGoogleToken)
            .filter(SellerGoogleToken.seller_id == webinar.seller_id)
            .first()
        )
        if token_record:
            try:
                service = _get_calendar_service(token_record)
                if service:
                    service.events().delete(
                        calendarId="primary",
                        eventId=webinar.google_event_id,
                    ).execute()
            except Exception:
                pass

    db.delete(webinar)
    db.commit()


@router.post("/{webinar_id}/register")
async def register_for_webinar(
    webinar_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    webinar = db.query(Webinar).filter(Webinar.id == webinar_id).first()
    if not webinar:
        raise HTTPException(404, "Webinar no encontrado")

    existing = (
        db.query(WebinarRegistration)
        .filter(
            WebinarRegistration.webinar_id == webinar_id,
            WebinarRegistration.student_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(400, "Ya estás registrado en este webinar")

    if webinar.max_attendees:
        count = len(webinar.registrations)
        if count >= webinar.max_attendees:
            raise HTTPException(400, "El webinar ha alcanzado el máximo de asistentes")

    reg = WebinarRegistration(webinar_id=webinar_id, student_id=current_user.id)
    db.add(reg)
    db.commit()
    db.refresh(reg)

    # Send confirmation email
    if webinar.meet_link:
        try:
            from app.core.mail_config import send_webinar_confirmation
            scheduled_str = webinar.scheduled_at.strftime("%d/%m/%Y %H:%M UTC")
            await send_webinar_confirmation(
                email=current_user.email,
                student_name=current_user.full_name or current_user.email,
                webinar_title=webinar.title,
                scheduled_at=scheduled_str,
                meet_link=webinar.meet_link,
            )
        except Exception:
            pass

    return {
        "id": reg.id,
        "webinar_id": reg.webinar_id,
        "student_id": reg.student_id,
        "registered_at": reg.registered_at,
        "attended": reg.attended,
    }


@router.delete("/{webinar_id}/register")
def unregister_from_webinar(
    webinar_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reg = (
        db.query(WebinarRegistration)
        .filter(
            WebinarRegistration.webinar_id == webinar_id,
            WebinarRegistration.student_id == current_user.id,
        )
        .first()
    )
    if not reg:
        raise HTTPException(404, "No estás registrado en este webinar")
    db.delete(reg)
    db.commit()
    return {"ok": True}


@router.get("/{webinar_id}/registrations")
def list_registrations(
    webinar_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    webinar = db.query(Webinar).filter(Webinar.id == webinar_id).first()
    if not webinar:
        raise HTTPException(404, "Webinar no encontrado")
    if webinar.seller_id != current_user.id and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(403, "No autorizado")

    return [
        {
            "id": r.id,
            "webinar_id": r.webinar_id,
            "student_id": r.student_id,
            "registered_at": r.registered_at,
            "attended": r.attended,
            "student_name": r.student.full_name if r.student else None,
            "student_email": r.student.email if r.student else None,
        }
        for r in webinar.registrations
    ]
