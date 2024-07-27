import openai

def text_to_speech(text):
 response = openai.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input=text,
 )

 response.stream_to_file("output.mp3")
