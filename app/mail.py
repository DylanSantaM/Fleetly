from dotenv import load_dotenv
import os
# Load .env file from the project root
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from flask import Flask
from flask_mail import Mail, Message
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
mail = Mail(app)

with app.app_context():
    try:
        with mail.connect() as conn:
            msg = Message(
                subject="SMTP Test Email",
                sender=app.config['MAIL_USERNAME'],
                recipients=['app.config['MAIL_USERNAME']'],  # send to yourself for testing
                body="This is a test email from your Fleetly SMTP configuration."
            )
            conn.send(msg)
            print("Test email sent successfully!")
    except Exception as e:
        print("Failed to send test email:", e)