import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings

_MAGIC = b"EJES1"
_NONCE_LENGTH = 12


def _document_key():
    key_material = f"{settings.SECRET_KEY}:zambian-ejustice-document-storage-v1".encode()
    return hashlib.sha256(key_material).digest()


def encrypt_document(plaintext):
    nonce = os.urandom(_NONCE_LENGTH)
    ciphertext = AESGCM(_document_key()).encrypt(nonce, plaintext, _MAGIC)
    return _MAGIC + nonce + ciphertext


def decrypt_document(encrypted):
    if not encrypted.startswith(_MAGIC) or len(encrypted) < len(_MAGIC) + _NONCE_LENGTH + 16:
        raise ValueError("Stored document is not a valid encrypted E-Justice document.")
    nonce_start = len(_MAGIC)
    nonce = encrypted[nonce_start : nonce_start + _NONCE_LENGTH]
    ciphertext = encrypted[nonce_start + _NONCE_LENGTH :]
    return AESGCM(_document_key()).decrypt(nonce, ciphertext, _MAGIC)
