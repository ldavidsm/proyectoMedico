import os
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr

load_dotenv()

# --- Resend integration ---
import resend
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
resend.api_key = RESEND_API_KEY

MAIL_FROM = os.getenv("MAIL_FROM", "noreply@healthlearn.com")

# --- SMTP fallback config ---
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = MAIL_FROM,
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

fastmail = FastMail(conf)


async def send_verification_email(email: str, code: str):
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #0d9488;">Código de Verificación</h2>
                <p>Has solicitado un código para tu cuenta. Úsalo para completar el proceso:</p>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                    {code}
                </div>
                <p>Este código expirará en 10 minutos.</p>
                <p style="font-size: 12px; color: #888;">Si no solicitaste esto, puedes ignorar este correo.</p>
            </div>
        </body>
    </html>
    """

    if RESEND_API_KEY:
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": [email],
            "subject": "Código de verificación",
            "html": html
        })
    else:
        message = MessageSchema(
            subject="Activa tu cuenta",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        await fastmail.send_message(message)


async def send_webinar_notification(
    email: str,
    student_name: str,
    webinar_title: str,
    scheduled_at: str,
    meet_link: str,
    seller_name: str,
):
    """Email que se envía a estudiantes cuando el seller crea un webinar."""
    meet_button = (
        f'<a href="{meet_link}" style="display:inline-block;background:#22c55e;color:white;'
        f'padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0;">'
        f'Unirse al webinar</a>'
    ) if meet_link else (
        '<p style="color:#888;font-style:italic;">El enlace estará disponible próximamente.</p>'
    )

    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #0d9488;">Nuevo webinar: {webinar_title}</h2>
                <p>Hola <strong>{student_name}</strong>,</p>
                <p><strong>{seller_name}</strong> ha programado una sesión en vivo para ti.</p>
                <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:16px 0;">
                    <p style="margin:0;font-size:14px;"><strong>Fecha y hora:</strong> {scheduled_at}</p>
                </div>
                {meet_button}
                <p style="font-size:12px;color:#888;">Guarda este email para acceder el día del evento.</p>
            </div>
        </body>
    </html>
    """

    if RESEND_API_KEY:
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": [email],
            "subject": f"Nuevo webinar: {webinar_title}",
            "html": html
        })
    else:
        message = MessageSchema(
            subject=f"Nuevo webinar: {webinar_title}",
            recipients=[email],
            body=html,
            subtype=MessageType.html,
        )
        await fastmail.send_message(message)


async def send_webinar_confirmation(
    email: str,
    student_name: str,
    webinar_title: str,
    scheduled_at: str,
    meet_link: str,
):
    """Email de confirmación cuando el estudiante se registra en un webinar."""
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #0d9488;">Registro confirmado: {webinar_title}</h2>
                <p>Hola <strong>{student_name}</strong>, tu plaza está reservada.</p>
                <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:16px 0;">
                    <p style="margin:0;font-size:14px;"><strong>Fecha y hora:</strong> {scheduled_at}</p>
                </div>
                <a href="{meet_link}" style="display:inline-block;background:#0d9488;color:white;
                    padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0;">
                    Unirse el día del webinar
                </a>
                <p style="font-size:12px;color:#888;">Guarda este email para acceder el día del evento.</p>
            </div>
        </body>
    </html>
    """

    if RESEND_API_KEY:
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": [email],
            "subject": f"Registro confirmado: {webinar_title}",
            "html": html
        })
    else:
        message = MessageSchema(
            subject=f"¡Registro confirmado! {webinar_title}",
            recipients=[email],
            body=html,
            subtype=MessageType.html,
        )
        await fastmail.send_message(message)


async def send_seller_approved_email(email: str, name: str):
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    html = f"""
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: #333;">
        <div style="max-width: 500px; margin: auto; border: 1px solid #ddd;
          padding: 30px; border-radius: 10px;">
          <h2 style="color: #0d9488;">¡Felicidades, {name}!</h2>
          <p>Tu solicitud para ser instructor en <strong>HealthLearn</strong>
            ha sido <strong>aprobada</strong>.</p>
          <p>Ya puedes acceder a tu panel de creador y empezar a crear
            tus primeros cursos.</p>
          <a href="{frontend}/create"
            style="display:inline-block; background:#0d9488; color:white;
            padding:12px 24px; text-decoration:none; border-radius:6px;
            font-weight:bold; margin:20px 0;">
            Ir a mi panel de creador
          </a>
          <p style="font-size:12px; color:#888;">
            Si tienes alguna duda, contáctanos en soporte@healthlearn.com
          </p>
        </div>
      </body>
    </html>
    """
    if RESEND_API_KEY:
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": [email],
            "subject": "Tu solicitud de instructor ha sido aprobada",
            "html": html
        })
    else:
        message = MessageSchema(
            subject="Tu solicitud de instructor ha sido aprobada",
            recipients=[email],
            body=html,
            subtype=MessageType.html,
        )
        await fastmail.send_message(message)


async def send_seller_rejected_email(email: str, name: str):
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    html = f"""
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: #333;">
        <div style="max-width: 500px; margin: auto; border: 1px solid #ddd;
          padding: 30px; border-radius: 10px;">
          <h2 style="color: #374151;">Hola {name},</h2>
          <p>Hemos revisado tu solicitud para ser instructor en
            <strong>HealthLearn</strong>.</p>
          <p>En este momento no hemos podido aprobarla. Esto puede deberse
            a que necesitamos más información sobre tus credenciales
            o experiencia.</p>
          <p>Puedes volver a solicitar en cualquier momento con información
            adicional.</p>
          <a href="{frontend}/become-instructor"
            style="display:inline-block; background:#6b7280; color:white;
            padding:12px 24px; text-decoration:none; border-radius:6px;
            font-weight:bold; margin:20px 0;">
            Volver a solicitar
          </a>
        </div>
      </body>
    </html>
    """
    if RESEND_API_KEY:
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": [email],
            "subject": "Actualización sobre tu solicitud de instructor",
            "html": html
        })
    else:
        message = MessageSchema(
            subject="Actualización sobre tu solicitud de instructor",
            recipients=[email],
            body=html,
            subtype=MessageType.html,
        )
        await fastmail.send_message(message)


async def send_activation_button_email(email: str, url: str):
    html = f"""
    <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
            <div style="max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #0d9488;">Bienvenido a la Plataforma</h2>
                <p>Gracias por registrarte. Para comenzar, por favor confirma tu cuenta haciendo clic en el botón de abajo:</p>
                <a href="{url}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                    Activar mi cuenta ahora
                </a>
                <p style="font-size: 12px; color: #888;">Si el botón no funciona, copia y pega este enlace: <br> {url}</p>
            </div>
        </body>
    </html>
    """

    if RESEND_API_KEY:
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": [email],
            "subject": "Activa tu cuenta en HealthLearn",
            "html": html
        })
    else:
        message = MessageSchema(
            subject="Activa tu cuenta",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )
        await fastmail.send_message(message)
