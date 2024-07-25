from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from Socketio_instance import socketio  # Import socketio instance
from voiceChat import start_voice_activation, stop_voice_activation
from chat import ChatWithGpt

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

if __name__ == '__main__':
    socketio.run(app, debug=True)
