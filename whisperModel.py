from openai import OpenAI
import os



def WhisperModel(audio_file):
 transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file
 )
 print(transcription.text)
 return transcription.text

