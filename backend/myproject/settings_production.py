# Production settings for Nilaya deployment
from .settings import *

# SECURITY SETTINGS
DEBUG = False

ALLOWED_HOSTS = [
    'nilaya.ai',
    'www.nilaya.ai',
    'localhost',
    '127.0.0.1'
]
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = os.environ.get('EMAIL_PORT', '587')
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'no-reply@nilaya.ai')
CONTACT_EMAIL = os.environ.get('CONTACT_EMAIL', 'contact@nilaya.ai')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'true').strip().lower() in {'1', 'true', 'yes'}

# CORS Configuration for Next.js frontend
CORS_ALLOWED_ORIGINS = [
    'https://nilaya.ai',
    'https://www.nilaya.ai',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
]

CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    'https://nilaya.ai',
    'https://www.nilaya.ai',
]

# Database - Keep PostgreSQL for production
DATABASES = { 
    'default': { 
        'ENGINE': 'django.db.backends.postgresql_psycopg2', 
        'NAME': os.environ.get('DB_NAME', 'myproject'),
        'USER': os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    } 
}

# Static and Media files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static_cdn')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media_cdn')

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

ALWAYS_UPLOAD_FILES_TO_AWS = os.environ.get("ALWAYS_UPLOAD_FILES_TO_AWS", "false").strip().lower() in {"1", "true", "yes"}

print("🚀 Using PRODUCTION settings for Nilaya")


