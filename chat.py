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

def main():
    print("Welcome to the ChatGPT CLI!")
    print("Type 'exit' to end the conversation.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break

        response = ChatWithGpt(user_input)


if __name__ == "__main__":
    main()