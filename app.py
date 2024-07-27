from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from Socketio_instance import socketio  # Import socketio instance
from voiceChat import start_voice_activation, stop_voice_activation
from chat import ChatWithGpt
from pdfExtract import process_pdf_file

from excel import process_excel_and_query

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'


socketio.init_app(app)


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
    result = start_voice_activation()
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

@app.route("/process_pdf", methods=["POST"])
def process_pdf_route():
    try:
        pdf_file = request.files.get("pdf_file")
        query = request.form.get("query")

        if not pdf_file or not query:
            return jsonify({"error": "Missing PDF file or query"}), 400

        
        response = process_pdf_file(pdf_file, query)

        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/process_excel", methods=["POST"])
def process_excel_route():
    try:
        # Retrieve the uploaded Excel file and query from the request
        excel_file = request.files.get("excel_file")
        query = request.form.get("query")

        
        if not excel_file or not query:
            return jsonify({"error": "Missing Excel file or query"}), 400

       
        response = process_excel_and_query(excel_file, query)

        
        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    socketio.run(app, debug=True)
