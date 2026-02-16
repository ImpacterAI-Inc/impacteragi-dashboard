import subprocess
import psutil
import os
import json
from datetime import datetime
from config import Config

class SystemManager:
    """Manages all ImpacterAGI agent systems"""
    
    @staticmethod
    def get_process_by_name(process_name):
        """Find running process by name"""
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'status']):
            try:
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if process_name in cmdline:
                    return proc
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None
    
    @staticmethod
    def is_running(system_id):
        """Check if a system is running"""
        system = Config.SYSTEMS.get(system_id)
        if not system:
            return False
        
        process = SystemManager.get_process_by_name(system['process_name'])
        return process is not None
    
    @staticmethod
    def start_system(system_id):
        """Start a system"""
        system = Config.SYSTEMS.get(system_id)
        if not system:
            return {'success': False, 'message': 'System not found'}
        
        # Check if already running
        if SystemManager.is_running(system_id):
            return {'success': False, 'message': 'System already running'}
        
        # Check if file exists
        if not os.path.exists(system['path']):
            return {'success': False, 'message': f'System file not found: {system["path"]}'}
        
        try:
            # Start the process in background
            log_file = os.path.join(Config.LOGS_PATH, f'{system_id}.log')
            os.makedirs(Config.LOGS_PATH, exist_ok=True)
            
            with open(log_file, 'a') as log:
                log.write(f"\n{'='*50}\n")
                log.write(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                log.write(f"{'='*50}\n")
                
                subprocess.Popen(
                    ['python3', system['path']],
                    stdout=log,
                    stderr=log,
                    start_new_session=True
                )
            
            return {'success': True, 'message': f'{system["name"]} started successfully'}
        except Exception as e:
            return {'success': False, 'message': f'Failed to start: {str(e)}'}
    
    @staticmethod
    def stop_system(system_id):
        """Stop a system"""
        system = Config.SYSTEMS.get(system_id)
        if not system:
            return {'success': False, 'message': 'System not found'}
        
        process = SystemManager.get_process_by_name(system['process_name'])
        if not process:
            return {'success': False, 'message': 'System not running'}
        
        try:
            # Terminate the process
            process.terminate()
            process.wait(timeout=5)
            
            # Log the stop
            log_file = os.path.join(Config.LOGS_PATH, f'{system_id}.log')
            with open(log_file, 'a') as log:
                log.write(f"\nStopped at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            return {'success': True, 'message': f'{system["name"]} stopped successfully'}
        except psutil.TimeoutExpired:
            # Force kill if terminate doesn't work
            process.kill()
            return {'success': True, 'message': f'{system["name"]} force stopped'}
        except Exception as e:
            return {'success': False, 'message': f'Failed to stop: {str(e)}'}
    
    @staticmethod
    def get_all_status():
        """Get status of all systems"""
        status = {}
        for system_id, system in Config.SYSTEMS.items():
            running = SystemManager.is_running(system_id)
            process = SystemManager.get_process_by_name(system['process_name']) if running else None
            
            status[system_id] = {
                'name': system['name'],
                'icon': system['icon'],
                'running': running,
                'status': 'running' if running else 'stopped',
                'pid': process.pid if process else None,
                'cpu': round(process.cpu_percent(), 1) if process else 0,
                'memory': round(process.memory_info().rss / 1024 / 1024, 1) if process else 0  # MB
            }
        
        return status
    
    @staticmethod
    def get_logs(system_id, lines=50):
        """Get last N lines of logs for a system"""
        log_file = os.path.join(Config.LOGS_PATH, f'{system_id}.log')
        
        if not os.path.exists(log_file):
            return []
        
        try:
            with open(log_file, 'r') as f:
                all_lines = f.readlines()
                return all_lines[-lines:] if len(all_lines) > lines else all_lines
        except Exception as e:
            return [f'Error reading logs: {str(e)}']
    
    @staticmethod
    def get_stats():
        """Get overall system statistics"""
        running_count = sum(1 for system_id in Config.SYSTEMS if SystemManager.is_running(system_id))
        total_count = len(Config.SYSTEMS)
        
        # Mock stats - in production, these would come from databases
        return {
            'systems_running': running_count,
            'systems_total': total_count,
            'calls_today': 47,  # Would query from call logs
            'emails_sent': 128,  # Would query from email logs
            'leads_processed': 23,  # Would query from lead database
            'uptime_hours': 168  # Would calculate from system start time
        }
    
    @staticmethod
    def start_all():
        """Start all systems"""
        results = []
        for system_id in Config.SYSTEMS:
            result = SystemManager.start_system(system_id)
            results.append({
                'system': Config.SYSTEMS[system_id]['name'],
                'success': result['success'],
                'message': result['message']
            })
        return results
    
    @staticmethod
    def stop_all():
        """Stop all systems"""
        results = []
        for system_id in Config.SYSTEMS:
            if SystemManager.is_running(system_id):
                result = SystemManager.stop_system(system_id)
                results.append({
                    'system': Config.SYSTEMS[system_id]['name'],
                    'success': result['success'],
                    'message': result['message']
                })
        return results
