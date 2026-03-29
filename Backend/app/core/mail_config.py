from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from app.config import (
    RESEND_API_KEY, MAIL_FROM, MAIL_USERNAME, MAIL_PASSWORD,
    MAIL_PORT, MAIL_SERVER, FRONTEND_URL,
)

# --- Resend integration ---
import resend
resend.api_key = RESEND_API_KEY

# --- SMTP fallback config ---
conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
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
    frontend = FRONTEND_URL
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
    frontend = FRONTEND_URL
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
      <body style="font-family: sans-serif; background: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 480px; margin: auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 10px;">
              <div style="width: 40px; height: 40px; background: #7C3AED; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 18px;">H</span>
              </div>
              <span style="font-size: 20px; font-weight: bold; color: #0f172a;">HealthLearn</span>
            </div>
          </div>
          <h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin: 0 0 12px; text-align: center;">Bienvenido a HealthLearn</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6; text-align: center; margin: 0 0 32px;">Gracias por registrarte. Para comenzar, confirma tu cuenta haciendo clic en el botón:</p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="{url}" style="display: inline-block; background: #7C3AED; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px;">Activar mi cuenta</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Este enlace expira en 1 hora.<br>Si no creaste esta cuenta, ignora este email.</p>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 12px 0 0;">Si el botón no funciona, copia este enlace:<br><span style="color: #7C3AED;">{url}</span></p>
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
