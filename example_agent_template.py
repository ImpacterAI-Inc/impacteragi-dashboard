"""
Example AI Agent Script Template

This is a template showing how your AI agent scripts should be structured
to work with the ImpacterAGI dashboard.

Key requirements:
1. Can run as a daemon/background process
2. Logs output to stdout/stderr (captured by dashboard)
3. Responds to termination signals gracefully
4. Has a unique process name for identification
"""

import sys
import time
import signal
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global flag for graceful shutdown
running = True

def signal_handler(signum, frame):
    """Handle termination signals gracefully"""
    global running
    logger.info(f"Received signal {signum}, shutting down gracefully...")
    running = False

# Register signal handlers
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

def main():
    """Main agent loop"""
    logger.info("AI Agent starting...")
    logger.info("Initializing systems...")
    
    # Simulate initialization
    time.sleep(2)
    logger.info("Systems initialized successfully")
    
    # Main work loop
    iteration = 0
    while running:
        iteration += 1
        logger.info(f"Processing iteration {iteration}")
        
        # Your AI agent work goes here
        # Example: check for calls, process emails, etc.
        
        # Simulate work
        time.sleep(10)
        
        # Log some activity (for dashboard stats)
        if iteration % 6 == 0:  # Every minute
            logger.info("Status: Active | Calls: 47 | Emails: 128 | Leads: 23")
    
    logger.info("AI Agent stopped gracefully")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
