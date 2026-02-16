// ImpacterAGI Dashboard JavaScript

// Auto-refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Start auto-refresh if on dashboard/systems page
    if (window.location.pathname === '/dashboard' || window.location.pathname === '/systems') {
        setInterval(refreshStatus, REFRESH_INTERVAL);
    }
});

// Setup all event listeners
function setupEventListeners() {
    // Start All button
    const startAllBtn = document.getElementById('startAllBtn');
    if (startAllBtn) {
        startAllBtn.addEventListener('click', startAllSystems);
    }
    
    // Stop All button
    const stopAllBtn = document.getElementById('stopAllBtn');
    if (stopAllBtn) {
        stopAllBtn.addEventListener('click', stopAllSystems);
    }
    
    // Individual system controls
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const systemId = this.closest('[data-system]').dataset.system;
            startSystem(systemId);
        });
    });
    
    document.querySelectorAll('.stop-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const systemId = this.closest('[data-system]').dataset.system;
            stopSystem(systemId);
        });
    });
    
    document.querySelectorAll('.logs-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const systemId = this.closest('[data-system]').dataset.system;
            viewLogs(systemId);
        });
    });
}

// Start all systems
async function startAllSystems() {
    const btn = document.getElementById('startAllBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Starting...';
    
    try {
        const response = await fetch('/api/systems/start-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        // Show results
        let successCount = 0;
        let failCount = 0;
        
        data.results.forEach(result => {
            if (result.success) successCount++;
            else failCount++;
        });
        
        showNotification(
            `Started ${successCount} systems. ${failCount > 0 ? failCount + ' failed.' : ''}`,
            successCount > 0 ? 'success' : 'danger'
        );
        
        // Refresh status
        await refreshStatus();
        
    } catch (error) {
        showNotification('Failed to start systems: ' + error.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play me-2"></i>START ALL';
    }
}

// Stop all systems
async function stopAllSystems() {
    if (!confirm('Are you sure you want to stop all systems?')) {
        return;
    }
    
    const btn = document.getElementById('stopAllBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Stopping...';
    
    try {
        const response = await fetch('/api/systems/stop-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        // Show results
        let successCount = data.results.filter(r => r.success).length;
        
        showNotification(
            `Stopped ${successCount} systems successfully`,
            'info'
        );
        
        // Refresh status
        await refreshStatus();
        
    } catch (error) {
        showNotification('Failed to stop systems: ' + error.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-stop me-2"></i>STOP ALL';
    }
}

// Start individual system
async function startSystem(systemId) {
    const card = document.querySelector(`[data-system="${systemId}"]`);
    const startBtn = card.querySelector('.start-btn');
    
    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    
    try {
        const response = await fetch(`/api/system/${systemId}/start`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        showNotification(data.message, data.success ? 'success' : 'danger');
        
        if (data.success) {
            await refreshStatus();
        }
        
    } catch (error) {
        showNotification('Failed to start system: ' + error.message, 'danger');
    } finally {
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    }
}

// Stop individual system
async function stopSystem(systemId) {
    const card = document.querySelector(`[data-system="${systemId}"]`);
    const stopBtn = card.querySelector('.stop-btn');
    
    stopBtn.disabled = true;
    stopBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    
    try {
        const response = await fetch(`/api/system/${systemId}/stop`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        showNotification(data.message, data.success ? 'info' : 'danger');
        
        if (data.success) {
            await refreshStatus();
        }
        
    } catch (error) {
        showNotification('Failed to stop system: ' + error.message, 'danger');
    } finally {
        stopBtn.disabled = false;
        stopBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
    }
}

// View system logs
async function viewLogs(systemId) {
    const modal = new bootstrap.Modal(document.getElementById('logsModal'));
    const logsContent = document.getElementById('logsContent');
    
    logsContent.textContent = 'Loading logs...';
    modal.show();
    
    try {
        const response = await fetch(`/api/system/${systemId}/logs?lines=100`);
        const data = await response.json();
        
        if (data.logs && data.logs.length > 0) {
            logsContent.textContent = data.logs.join('');
        } else {
            logsContent.textContent = 'No logs available yet.';
        }
        
        // Auto-scroll to bottom
        logsContent.scrollTop = logsContent.scrollHeight;
        
    } catch (error) {
        logsContent.textContent = 'Error loading logs: ' + error.message;
    }
}

// Refresh system status
async function refreshStatus() {
    try {
        const [statusResponse, statsResponse] = await Promise.all([
            fetch('/api/status'),
            fetch('/api/stats')
        ]);
        
        const status = await statusResponse.json();
        const stats = await statsResponse.json();
        
        // Update stats if on dashboard
        updateStats(stats);
        
        // Update system cards/rows
        updateSystemStatus(status);
        
        // Update health indicator
        updateHealthIndicator(status);
        
    } catch (error) {
        console.error('Failed to refresh status:', error);
    }
}

// Update statistics
function updateStats(stats) {
    const elements = {
        'systemsRunning': stats.systems_running,
        'callsToday': stats.calls_today,
        'emailsSent': stats.emails_sent,
        'leadsProcessed': stats.leads_processed
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Update system status display
function updateSystemStatus(status) {
    Object.entries(status).forEach(([systemId, system]) => {
        const card = document.querySelector(`[data-system="${systemId}"]`);
        if (!card) return;
        
        const statusBadge = card.querySelector('.status-badge');
        const startBtn = card.querySelector('.start-btn');
        const stopBtn = card.querySelector('.stop-btn');
        const cpuStat = card.querySelector('.stat-item:nth-child(1) strong');
        const memStat = card.querySelector('.stat-item:nth-child(2) strong');
        
        // Update status badge
        if (statusBadge) {
            statusBadge.className = `status-badge status-${system.status}`;
            statusBadge.innerHTML = `<i class="fas fa-circle"></i> ${system.running ? 'Running' : 'Stopped'}`;
        }
        
        // Update buttons
        if (startBtn && stopBtn) {
            startBtn.disabled = system.running;
            stopBtn.disabled = !system.running;
        }
        
        // Update stats
        if (cpuStat) cpuStat.textContent = `${system.cpu}%`;
        if (memStat) memStat.textContent = `${system.memory} MB`;
    });
}

// Update health indicator in sidebar
function updateHealthIndicator(status) {
    const indicator = document.getElementById('systemHealthIndicator');
    if (!indicator) return;
    
    const runningCount = Object.values(status).filter(s => s.running).length;
    const totalCount = Object.keys(status).length;
    
    if (runningCount === totalCount) {
        indicator.className = 'alert alert-success';
        indicator.innerHTML = '<i class="fas fa-check-circle me-2"></i><strong>All Systems Operational</strong>';
    } else if (runningCount === 0) {
        indicator.className = 'alert alert-danger';
        indicator.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i><strong>All Systems Stopped</strong>';
    } else {
        indicator.className = 'alert alert-warning';
        indicator.innerHTML = `<i class="fas fa-info-circle me-2"></i><strong>${runningCount}/${totalCount} Systems Running</strong>`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of main content
    const main = document.querySelector('.main-content');
    if (main) {
        main.insertBefore(alert, main.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Export functions for external use
window.impacterDashboard = {
    refreshStatus,
    startSystem,
    stopSystem,
    viewLogs
};
