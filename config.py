import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'manny@impacteragi.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'ImpacterAGI2026!Secure#Dashboard')
    
    # Flask settings
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    
    # System paths
    SYSTEMS = {
        'voice_ai': {
            'name': 'Voice AI Agent',
            'description': 'Inbound call handling system',
            'path': os.getenv('VOICE_AI_PATH', '/data/.openclaw/workspace/voice_ai_agent.py'),
            'process_name': 'voice_ai_agent',
            'icon': '📞'
        },
        'sal': {
            'name': 'Sal Insurance Agent',
            'description': 'Insurance sales and support',
            'path': os.getenv('SAL_AGENT_PATH', '/data/.openclaw/workspace/sal_agent.py'),
            'process_name': 'sal_agent',
            'icon': '🏥'
        },
        'homefreedom': {
            'name': 'HomeFreedom Pre-Foreclosure',
            'description': 'Pre-foreclosure lead management',
            'path': os.getenv('HOMEFREEDOM_PATH', '/data/.openclaw/workspace/homefreedom_agent.py'),
            'process_name': 'homefreedom_agent',
            'icon': '🏠'
        },
        'lead_nurture': {
            'name': 'Lead Nurture System',
            'description': 'Automated lead follow-up',
            'path': os.getenv('LEAD_NURTURE_PATH', '/data/.openclaw/workspace/lead_nurture.py'),
            'process_name': 'lead_nurture',
            'icon': '🌱'
        },
        'john_sdr': {
            'name': 'John AI SDR',
            'description': 'Sales development representative',
            'path': os.getenv('JOHN_SDR_PATH', '/data/.openclaw/workspace/john_sdr.py'),
            'process_name': 'john_sdr',
            'icon': '💼'
        },
        'email_monitor': {
            'name': 'Email Auto-Reply Monitor',
            'description': 'Automated email responses',
            'path': os.getenv('EMAIL_MONITOR_PATH', '/data/.openclaw/workspace/email_monitor.py'),
            'process_name': 'email_monitor',
            'icon': '📧'
        },
        'vapi': {
            'name': 'VAPI Call System',
            'description': 'Voice API call management',
            'path': os.getenv('VAPI_SYSTEM_PATH', '/data/.openclaw/workspace/vapi_system.py'),
            'process_name': 'vapi_system',
            'icon': '☎️'
        }
    }
    
    # Database
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'dashboard.db')
    LOGS_PATH = os.path.join(os.path.dirname(__file__), 'logs')
