import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(recipient_email: str, reset_token: str) -> bool:
    """
    Send password reset email to patient if SMTP is configured.
    If SMTP is not configured, logs the token/link safely and returns False.
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.info(
            "SMTP is not configured. Reset link for %s: %s",
            recipient_email,
            reset_link,
        )
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "HeartGuard AI - Password Reset Request"
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = recipient_email

        text_content = (
            f"Hello,\n\n"
            f"You requested to reset your password for your HeartGuard AI account.\n"
            f"Click the link below to reset it (valid for {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes):\n"
            f"{reset_link}\n\n"
            f"If you did not request this, you can safely ignore this email.\n"
        )
        msg.attach(MIMEText(text_content, "plain"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        if settings.SMTP_TLS:
            server.starttls()
        if settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
        server.quit()
        logger.info("Password reset email sent successfully to %s", recipient_email)
        return True
    except Exception as exc:
        logger.error("Failed to send password reset email via SMTP: %s", exc)
        return False
