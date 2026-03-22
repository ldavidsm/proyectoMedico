from fastapi import APIRouter

router = APIRouter(prefix="/catalogs", tags=["Catalogs"])

CATEGORIES = [
    "Cardiología", "Neurología", "Pediatría", "Cirugía General",
    "Medicina Interna", "Oncología", "Psiquiatría", "Dermatología",
    "Oftalmología", "Ginecología y Obstetricia", 
    "Medicina de Urgencias", "Radiología", "Anestesiología"
]

TOPICS = [
    "Diagnóstico clínico", "Tratamiento y terapéutica",
    "Prevención y salud pública", "Procedimientos y técnicas",
    "Farmacología clínica", "Interpretación de estudios",
    "Casos clínicos complejos"
]

AUDIENCES = [
    "Médicos generales", "Especialistas", "Residentes (MIR)",
    "Enfermería", "Otros profesionales sanitarios"
]

COUNTRIES = [
    {"code": "ES", "name": "España", "currency": "EUR", 
     "symbol": "€", "flag": "🇪🇸", "rateFromEUR": 1, 
     "taxRate": 0.21, "taxName": "IVA"},
    {"code": "MX", "name": "México", "currency": "MXN", 
     "symbol": "$", "flag": "🇲🇽", "rateFromEUR": 18.5,
     "taxRate": 0.16, "taxName": "IVA"},
    {"code": "CO", "name": "Colombia", "currency": "COP",
     "symbol": "$", "flag": "🇨🇴", "rateFromEUR": 4200,
     "taxRate": 0.19, "taxName": "IVA"},
    {"code": "AR", "name": "Argentina", "currency": "ARS",
     "symbol": "$", "flag": "🇦🇷", "rateFromEUR": 900,
     "taxRate": 0.21, "taxName": "IVA"},
    {"code": "CL", "name": "Chile", "currency": "CLP",
     "symbol": "$", "flag": "🇨🇱", "rateFromEUR": 950,
     "taxRate": 0.19, "taxName": "IVA"},
    {"code": "PE", "name": "Perú", "currency": "PEN",
     "symbol": "S/", "flag": "🇵🇪", "rateFromEUR": 3.8,
     "taxRate": 0.18, "taxName": "IGV"},
    {"code": "US", "name": "Estados Unidos", "currency": "USD",
     "symbol": "$", "flag": "🇺🇸", "rateFromEUR": 1.08,
     "taxRate": 0, "taxName": ""},
    {"code": "BR", "name": "Brasil", "currency": "BRL",
     "symbol": "R$", "flag": "🇧🇷", "rateFromEUR": 5.4,
     "taxRate": 0.12, "taxName": "ISS"},
    {"code": "VE", "name": "Venezuela", "currency": "USD",
     "symbol": "$", "flag": "🇻🇪", "rateFromEUR": 1.08,
     "taxRate": 0, "taxName": ""},
    {"code": "UY", "name": "Uruguay", "currency": "UYU",
     "symbol": "$", "flag": "🇺🇾", "rateFromEUR": 42.0,
     "taxRate": 0.22, "taxName": "IVA"},
    {"code": "PT", "name": "Portugal", "currency": "EUR",
     "symbol": "€", "flag": "🇵🇹", "rateFromEUR": 1,
     "taxRate": 0.23, "taxName": "IVA"},
    {"code": "IT", "name": "Italia", "currency": "EUR",
     "symbol": "€", "flag": "🇮🇹", "rateFromEUR": 1,
     "taxRate": 0.22, "taxName": "IVA"}
]

@router.get("/categories")
def get_categories():
    return {"data": [{"id": c.lower().replace(" ", "_").replace("í","i").replace("ó","o"), "label": c} for c in CATEGORIES]}

@router.get("/topics")
def get_topics():
    return {"data": [{"id": t.lower().replace(" ", "_"), "label": t} for t in TOPICS]}

@router.get("/audiences")
def get_audiences():
    return {"data": [{"id": a.lower().replace(" ", "_"), "label": a} for a in AUDIENCES]}

@router.get("/countries")
def get_countries():
    return {"data": COUNTRIES}
