from flask import Flask, render_template, jsonify, request
from chat import ChatWithGpt


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    
    response = ChatWithGpt(user_message)
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)