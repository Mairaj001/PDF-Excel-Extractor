import speech_recognition as sr
import openai
import threading
from Socketio_instance import socketio

# Global variables for managing the thread and messages
voice_activation_thread = None
stop_flag = threading.Event()
user_messages = []
bot_messages = []

def VoiceActivation():
    global user_messages, bot_messages
    activation_phrase = "start listening"
    goodbye_phrase = "good bye"
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()

    user_messages = []
    bot_messages = []

    while not stop_flag.is_set():
        with microphone as source:
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio)
            socketio.emit('user_message', {'message':text})
            if activation_phrase in text.lower():
                user_messages.append("Activation phrase detected. Starting session...")
                socketio.emit('assistant_message', {'message': "Ok, now tell me about your query."})
                
                while not stop_flag.is_set():
                    with microphone as source:
                        recognizer.adjust_for_ambient_noise(source)
                        audio = recognizer.listen(source)

                    try:
                        speech_text = recognizer.recognize_google(audio)
                        user_messages.append(speech_text)
                        socketio.emit("user_message",{'message':speech_text})
                        openai.api_key = "sk-proj-8hEDD0MBrecoxmRA5cyWT3BlbkFJhn1v2mVy59OkNOC6n9EU"
                        response = openai.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": "You are an assistant, explain to me about the question in detail."},
                                {"role": "user", "content": speech_text}
                            ]
                        )
                        bot_message = response.choices[0].message.content
                        bot_messages.append(bot_message)
                        socketio.emit('assistant_message', {'message': bot_message})
                        
                        if goodbye_phrase in speech_text.lower():
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

def start_voice_activation():
    global voice_activation_thread, stop_flag
    if voice_activation_thread and voice_activation_thread.is_alive():
        return {'error': 'Voice activation is already running.'}
    
    stop_flag.clear()
    voice_activation_thread = threading.Thread(target=VoiceActivation)
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
