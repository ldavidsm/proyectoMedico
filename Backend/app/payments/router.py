from fastapi import APIRouter

router = APIRouter(prefix="/payments", tags=["Payments"])

# The mock-confirm endpoint has been removed.
# Real payment flow uses POST /orders/{order_id}/pay in orders/router.py
