from flask import Flask, jsonify, request
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Basic configuration
    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'Flask backend is running!'
        }), 200
    
    # Basic API routes
    @app.route('/api', methods=['GET'])
    def api_info():
        return jsonify({
            'message': 'Welcome to the HackGT-12 API',
            'version': '1.0.0',
            'endpoints': [
                '/health - Health check',
                '/api - API information',
                '/api/data - Sample data endpoint'
            ]
        }), 200
    
    # Sample data endpoint
    @app.route('/api/data', methods=['GET'])
    def get_data():
        sample_data = {
            'items': [
                {'id': 1, 'name': 'Sample Item 1', 'description': 'This is a sample item'},
                {'id': 2, 'name': 'Sample Item 2', 'description': 'This is another sample item'},
            ],
            'total': 2
        }
        return jsonify(sample_data), 200
    
    # POST endpoint example
    @app.route('/api/data', methods=['POST'])
    def create_data():
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # In a real app, you'd save this to a database
        response_data = {
            'message': 'Data received successfully',
            'received_data': data,
            'id': 3  # Mock ID
        }
        
        return jsonify(response_data), 201
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)