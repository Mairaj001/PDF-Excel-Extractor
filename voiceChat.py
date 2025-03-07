import speech_recognition as sr
import openai
import threading
from Socketio_instance import socketio
from whisperModel import WhisperModel

# Global variables for managing the thread and messages
voice_activation_thread = None
stop_flag = threading.Event()
user_messages = []
bot_messages = []

def VoiceActivation(activate,deactivate):
    global user_messages, bot_messages
    activation_phrase = activate
    goodbye_phrase = deactivate
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    user_messages = []
    bot_messages = []

    print(activation_phrase,goodbye_phrase)

    while not stop_flag.is_set():
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio)
            socketio.emit('user_message', {'message':text})
            print(text, "user")
            if activation_phrase.lower() in text.lower():
                user_messages.append("Activation phrase detected. Starting session...")
                socketio.emit('assistant_message', {'message': "Ok, now tell me about your query."})
              
                while not stop_flag.is_set():
                    with microphone as source:
                        recognizer.adjust_for_ambient_noise(source)
                        audio = recognizer.listen(source)

                    try:
                        
                        speech_text=WhisperModel(audio)
                        user_messages.append(speech_text)
                        socketio.emit("user_message",{'message':speech_text})
                        
                        response = openai.chat.completions.create(
                            model="gpt-4o",
                            messages=[
                                {"role": "system", "content": "You are an assistant, explain to me about the question in detail."},
                                {"role": "user", "content": speech_text}
                            ]
                        )
                        bot_message = response.choices[0].message.content
                        bot_messages.append(bot_message)
                        socketio.emit('assistant_message', {'message': bot_message})
                        
                        if goodbye_phrase.lower() in speech_text.lower():
                            user_messages.append("Goodbye!")
                            socketio.emit('assistant_message', {'message': "Goodbye!"})
                            stop_flag.set()  
                            break

                    except sr.UnknownValueError:
                        bot_messages.append("Could not understand audio.")
                        socketio.emit('assistant_message', {'message': "Could not understand audio."})
                    except sr.RequestError:
                        bot_messages.append("Speech recognition service is unavailable.")
                        socketio.emit('assistant_message', {'message': "Speech recognition service is unavailable."})
                        stop_flag.set()
                        break

                break

        except sr.UnknownValueError:
            pass
        except sr.RequestError:
            bot_messages.append("Speech recognition service is unavailable.")
            socketio.emit('assistant_message', {'message': "Speech recognition service is unavailable."})
            stop_flag.set()
            break

def start_voice_activation(actviate,deactivate):
    
    global voice_activation_thread, stop_flag
    if voice_activation_thread and voice_activation_thread.is_alive():
        return {'error': 'Voice activation is already running.'}
    
    print("Thread started")
    stop_flag.clear()
    voice_activation_thread = threading.Thread(target=VoiceActivation(activate=actviate,deactivate=deactivate))
    voice_activation_thread.start()
    return {'message': 'Voice activation started.'}

def stop_voice_activation():
    global stop_flag, voice_activation_thread
    stop_flag.set()
    if voice_activation_thread:
        voice_activation_thread.join()  # Wait for the thread to stop
    return {'message': 'Voice activation stopped.'}

def get_messages():
    return {
        'user_messages': user_messages,
        'bot_messages': bot_messages
    }
