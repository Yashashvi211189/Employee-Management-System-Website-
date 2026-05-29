# Local development settings
from .settings import *

# Use SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

print("Using SQLite database for local development")

ALWAYS_UPLOAD_FILES_TO_AWS = False
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media_cdn'
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# Next.js dev server runs on port 3000 (not 3001). Explicit origins are required
# because CORS_ALLOW_ALL_ORIGINS + CORS_ALLOW_CREDENTIALS cannot both be True.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]


