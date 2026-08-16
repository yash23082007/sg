"""
SkillGap Security & Cryptography Module
Standard library PBKDF2-HMAC-SHA256 password hashing and JWT token management.
"""

import hashlib
import hmac
import os
import json
import base64
import time
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hashes password using PBKDF2-HMAC-SHA256 with a unique 16-byte salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored PBKDF2 hash."""
    try:
        salt_hex, key_hex = hashed_password.split("$")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(key, new_key)
    except Exception:
        return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed HMAC-SHA256 JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": subject, "exp": int(expire.timestamp())}
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[str]:
    """Decodes and validates a signed JWT access token, returning the subject."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        
        # Pad base64 if needed
        padding = "=" * (4 - len(sig_b64) % 4) if len(sig_b64) % 4 else ""
        actual_sig = base64.urlsafe_b64decode(sig_b64 + padding)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        # Verify expiration
        payload_padding = "=" * (4 - len(payload_b64) % 4) if len(payload_b64) % 4 else ""
        payload_bytes = base64.urlsafe_b64decode(payload_b64 + payload_padding)
        payload = json.loads(payload_bytes.decode())
        
        if payload.get("exp", 0) < int(time.time()):
            return None
        
        return payload.get("sub")
    except Exception:
        return None
