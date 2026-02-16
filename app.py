from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from config import Config
from auth import User
from system_manager import SystemManager
import os

app = Flask(__name__)
app.config.from_object(Config)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.get_user(user_id)

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember') == 'on'
        
        user = User.verify_user(email, password)
        if user:
            login_user(user, remember=remember)
            flash('Welcome to ImpacterAGI Dashboard!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    stats = SystemManager.get_stats()
    status = SystemManager.get_all_status()
    return render_template('dashboard.html', stats=stats, systems=status)

@app.route('/systems')
@login_required
def systems():
    status = SystemManager.get_all_status()
    return render_template('systems.html', systems=status)

@app.route('/leads')
@login_required
def leads():
    # Mock lead data - in production, would query from database
    mock_leads = [
        {'id': 1, 'name': 'John Smith', 'system': 'Sal', 'status': 'new', 'phone': '555-0101'},
        {'id': 2, 'name': 'Jane Doe', 'system': 'HomeFreedom', 'status': 'contacted', 'phone': '555-0102'},
        {'id': 3, 'name': 'Bob Johnson', 'system': 'John SDR', 'status': 'qualified', 'phone': '555-0103'},
    ]
    return render_template('leads.html', leads=mock_leads)

@app.route('/activity')
@login_required
def activity():
    # Mock activity data - in production, would query from database
    mock_activity = [
        {'time': '2026-02-12 09:15', 'type': 'call', 'system': 'Voice AI', 'details': 'Inbound call from 555-0101'},
        {'time': '2026-02-12 09:30', 'type': 'email', 'system': 'Email Monitor', 'details': 'Sent follow-up to john@example.com'},
        {'time': '2026-02-12 09:45', 'type': 'sms', 'system': 'Lead Nurture', 'details': 'SMS sent to 555-0102'},
    ]
    return render_template('activity.html', activity=mock_activity)

@app.route('/settings')
@login_required
def settings():
    return render_template('settings.html')

# API Routes
@app.route('/api/status')
@login_required
def api_status():
    return jsonify(SystemManager.get_all_status())

@app.route('/api/stats')
@login_required
def api_stats():
    return jsonify(SystemManager.get_stats())

@app.route('/api/system/<system_id>/start', methods=['POST'])
@login_required
def api_start_system(system_id):
    result = SystemManager.start_system(system_id)
    return jsonify(result)

@app.route('/api/system/<system_id>/stop', methods=['POST'])
@login_required
def api_stop_system(system_id):
    result = SystemManager.stop_system(system_id)
    return jsonify(result)

@app.route('/api/system/<system_id>/logs')
@login_required
def api_get_logs(system_id):
    lines = request.args.get('lines', 50, type=int)
    logs = SystemManager.get_logs(system_id, lines)
    return jsonify({'logs': logs})

@app.route('/api/systems/start-all', methods=['POST'])
@login_required
def api_start_all():
    results = SystemManager.start_all()
    return jsonify({'results': results})

@app.route('/api/systems/stop-all', methods=['POST'])
@login_required
def api_stop_all():
    results = SystemManager.stop_all()
    return jsonify({'results': results})

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    print("=" * 60)
    print("🚀 ImpacterAGI Dashboard Starting...")
    print("=" * 60)
    print(f"📍 URL: http://{Config.FLASK_HOST}:{Config.FLASK_PORT}")
    print(f"👤 Username: {Config.ADMIN_EMAIL}")
    print(f"🔑 Password: {Config.ADMIN_PASSWORD}")
    print("=" * 60)
    
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=(Config.FLASK_ENV == 'development')
    )
