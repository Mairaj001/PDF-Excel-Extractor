import os
import openai

os.environ["OPENAI_API_KEY"] = "sk-proj-8hEDD0MBrecoxmRA5cyWT3BlbkFJhn1v2mVy59OkNOC6n9EU"
client = openai.OpenAI()


def ChatWithGpt(prompt):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a  assistant, explain me about the question in detail."},
            {"role": "user", "content": prompt}
            ]         
    )
    result = print(f"ChatGPT:{ response.choices[0].message.content}")
    return f"ChatGPT:{ response.choices[0].message.content}"
