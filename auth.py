from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
from config import Config

class User(UserMixin):
    def __init__(self, email):
        self.id = email
        self.email = email
    
    @staticmethod
    def verify_user(email, password):
        """Verify user credentials"""
        if email == Config.ADMIN_EMAIL and password == Config.ADMIN_PASSWORD:
            return User(email)
        return None
    
    @staticmethod
    def get_user(email):
        """Get user by email"""
        if email == Config.ADMIN_EMAIL:
            return User(email)
        return None
