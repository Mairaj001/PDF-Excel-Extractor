import os
from dotenv import load_dotenv
import pandas as pd
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI
import openai

# Load environment variables
load_dotenv()

# Set OpenAI API key from environment variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Define a function to extract text from an Excel file
def extract_text_from_excel(file_path):
    try:
        # Load Excel data into a Pandas dataframe
        df = pd.read_excel(file_path, engine='openpyxl')  # Specify the engine
        # Convert the dataframe to a string
        raw_text = df.to_string()
        return raw_text
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None

# Define a function to split text into chunks
def split_text_into_chunks(text, chunk_size=800, chunk_overlap=200):
    text_splitter = CharacterTextSplitter(
        separator='\n',
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    return text_splitter.split_text(text)

# Define a function to create a FAISS index from text chunks
def create_faiss_index(text_chunks, embedding):
    return FAISS.from_texts(text_chunks, embedding)

# Define a function to search for similar documents
def search_for_similar_documents(query, faiss_index):
    return faiss_index.similarity_search(query)

# Define a function to answer questions using the QA chain
def answer_questions(query, docs, chain):
    # Use the invoke method instead of run
    return chain.invoke({"input_documents": docs, "question": query})


# Main program
if __name__ == '__main__':
    # Path to your Excel file
    excel_file_path = r'test.xlsx'
    
    # Extract text from Excel file
    raw_text = extract_text_from_excel(excel_file_path)

    if raw_text:
        # Split text into chunks
        text_chunks = split_text_into_chunks(raw_text)

        # Create a FAISS index from text chunks
        embedding = OpenAIEmbeddings()
        faiss_index = create_faiss_index(text_chunks, embedding)

        # Search for similar documents
        query = """
        What was Microsoft's share price 40 days ago and how has it changed in percentage terms compared to today?
        """
        docs = search_for_similar_documents(query, faiss_index)

        # Answer questions using the QA chain
        chain = load_qa_chain(OpenAI(), chain_type="stuff")
        answers = answer_questions(query, docs, chain)

        # Use ChatGPT to generate a response
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": f"You are an assistant. Explain in detail about the question using the Excel file we used to search and also perform calculations if required. If the required prompt is not related to query, just state that the Excel file doesn't have the necessary information: {docs}."},
                    {"role": "user", "content": query}
                ]
            )
            print(f"ChatGPT: {response['choices'][0]['message']['content']}")
        except openai.error.OpenAIError as e:
            print(f"Error with OpenAI API: {e}")
