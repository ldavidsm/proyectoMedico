from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.models.resources import Resource, FAQ, SupportTicket
from app.schemas.resources import (
    ResourceCreate, ResourceUpdate, ResourceResponse,
    FAQCreate, FAQUpdate, FAQResponse,
    SupportTicketCreate, SupportTicketResponse,
)

router = APIRouter()


def _admin_required(current_user: User = Depends(get_current_user)):
    if str(current_user.role) != UserRole.admin.value:
        raise HTTPException(status_code=403, detail="No autorizado")
    return current_user


# ─── Resources (public) ──────────────────────────────────────────────────────

@router.get("/", response_model=List[ResourceResponse])
def list_resources(db: Session = Depends(get_db)):
    return (
        db.query(Resource)
        .filter(Resource.is_active == True)
        .order_by(Resource.order)
        .all()
    )


@router.get("/faqs", response_model=List[FAQResponse])
def list_faqs(db: Session = Depends(get_db)):
    return (
        db.query(FAQ)
        .filter(FAQ.is_active == True)
        .order_by(FAQ.order)
        .all()
    )


# ─── Resources (admin) ───────────────────────────────────────────────────────

@router.post("/", response_model=ResourceResponse)
def create_resource(
    data: ResourceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    resource = Resource(**data.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.patch("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: str,
    data: ResourceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(resource, field, value)
    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    resource.is_active = False
    db.commit()
    return {"ok": True}


# ─── FAQs (admin) ────────────────────────────────────────────────────────────

@router.post("/faqs", response_model=FAQResponse)
def create_faq(
    data: FAQCreate,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    faq = FAQ(**data.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.patch("/faqs/{faq_id}", response_model=FAQResponse)
def update_faq(
    faq_id: str,
    data: FAQUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrada")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(faq, field, value)
    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/faqs/{faq_id}")
def delete_faq(
    faq_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrada")
    faq.is_active = False
    db.commit()
    return {"ok": True}


# ─── Support tickets ─────────────────────────────────────────────────────────

@router.post("/support")
def create_support_ticket(
    data: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = SupportTicket(
        user_id=current_user.id,
        name=current_user.full_name or current_user.email,
        email=current_user.email,
        subject=data.subject,
        message=data.message,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"ok": True, "ticket_id": ticket.id}


@router.get("/support", response_model=List[SupportTicketResponse])
def list_support_tickets(
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    return db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()


@router.patch("/support/{ticket_id}")
def update_ticket_status(
    ticket_id: str,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_required),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    ticket.status = status
    db.commit()
    return {"ok": True}
