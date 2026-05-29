import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Set up the SMTP server and login credentials
smtp_server = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
smtp_port = int(os.environ.get('EMAIL_PORT', '587'))
smtp_username = os.environ.get('EMAIL_HOST_USER', '')
smtp_password = os.environ.get('EMAIL_HOST_PASSWORD', '')
smtp_sender = os.environ.get('DEFAULT_FROM_EMAIL', smtp_username)

# Set up the email message
msg = MIMEMultipart()
msg['From'] = smtp_sender
msg['To'] = 'office@nilaya.com'
msg['Subject'] = 'Test Email'
body = 'This is a test email.'
msg.attach(MIMEText(body, 'plain'))

# Connect to the SMTP server and send the email
with smtplib.SMTP(smtp_server, smtp_port) as server:
    server.ehlo()
    server.starttls()
    server.login(smtp_username, smtp_password)
    server.sendmail(smtp_sender, 'office@nilaya.com', msg.as_string())
