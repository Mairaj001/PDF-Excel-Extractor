import openai

def text_to_speech(text):
 response = openai.audio.speech.create(
    model="tts-1",
    voice="alloy",
    input=text,
    response_format="mp3"
 )

 return response
