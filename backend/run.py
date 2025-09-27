#!/usr/bin/env python3
"""
Simple script to run the Flask application
"""

import os
from app import create_app

if __name__ == '__main__':
    # Get environment from environment variable, default to development
    env = os.environ.get('FLASK_ENV', 'development')
    
    # Create the Flask app
    app = create_app()
    
    # Run the app
    print(f"Starting Flask app in {env} mode...")
    print("Available endpoints:")
    print("  - GET  /health - Health check")
    print("  - GET  /api - API information")
    print("  - GET  /api/data - Get sample data")
    print("  - POST /api/data - Create new data")
    print("\nServer running at: http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5001)),
        debug=True if env == 'development' else False
    )