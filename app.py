from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from Socketio_instance import socketio  # Import socketio instance
from voiceChat import start_voice_activation, stop_voice_activation
from chat import ChatWithGpt
from pdf import process_pdf_query
from NoErrorExcelExtraction import process_excel
import os
import logging
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'


socketio.init_app(app)
logging.basicConfig(level=logging.DEBUG)


CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    
    response = ChatWithGpt(user_message)
    
    return jsonify({'response': response})

@app.route('/start-voice-activation', methods=['POST'])
def start_voice_activation_route():
    activation_data = request.json.get('activation')
    deactivation_data = request.json.get('deactivation')
    result = start_voice_activation(activation_data,deactivation_data)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result)

@app.route('/stop-voice-activation', methods=['POST'])
def stop_voice_activation_route():
    result = stop_voice_activation()
    return jsonify(result)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@app.route('/process', methods=['POST'])
def process_request():
    try:
        if 'pdf_file' not in request.files:
            return jsonify({"error": "PDF file is required"}), 400
        if 'query' not in request.form:
            return jsonify({"error": "Query is required"}), 400

        pdf_file = request.files['pdf_file']
        query = request.form['query']

        if not pdf_file:
            return jsonify({"error": "No file uploaded"}), 400

        # Process the PDF and query
        response = process_pdf_query(pdf_file, query)

        return jsonify({"response": response})
    
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

@app.route('/process_excel', methods=['POST'])
def process_file():
    if 'file' not in request.files or 'query' not in request.form:
        return jsonify({'error': 'File or query missing.'}), 400

    # Retrieve the file and query from the request
    excel_file = request.files['file']
    query = request.form['query']

    # Process the query and file using the excel_processor module
    response = process_excel(excel_file,query)

    return jsonify({'response': response})
if __name__ == '__main__':
    socketio.run(app, debug=True)
