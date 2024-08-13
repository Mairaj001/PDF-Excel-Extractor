from openai import OpenAI
import os
client = OpenAI(api_key="sk-proj-8hEDD0MBrecoxmRA5cyWT3BlbkFJhn1v2mVy59OkNOC6n9EU")


def WhisperModel(audio_file):
 transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file
 )
 print(transcription.text)
 return transcription.text

