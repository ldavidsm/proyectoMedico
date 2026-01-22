import os
from dotenv import load_dotenv
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM"),
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
    
    message = MessageSchema(
        subject="Tu código de seguridad",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fastmail.send_message(message)
    
    
async def send_activation_button_email(email: str, url: str):
    html = f"""
    <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
            <div style="max-width: 500px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #0d9488;">¡Bienvenido a la Plataforma!</h2>
                <p>Gracias por registrarte. Para comenzar, por favor confirma tu cuenta haciendo clic en el botón de abajo:</p>
                <a href="{url}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                    Activar mi cuenta ahora
                </a>
                <p style="font-size: 12px; color: #888;">Si el botón no funciona, copia y pega este enlace: <br> {url}</p>
            </div>
        </body>
    </html>
    """    
    
    message = MessageSchema(
        subject="Tu código de seguridad",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fastmail.send_message(message)    