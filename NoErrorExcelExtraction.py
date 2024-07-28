import os
import logging
from dotenv import load_dotenv
import pandas as pd
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI
import openai
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Load environment variables
load_dotenv()

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = 'sk-proj-8hEDD0MBrecoxmRA5cyWT3BlbkFJhn1v2mVy59OkNOC6n9EU'

# Define a function to extract text from an Excel file
def extract_text_from_excel(file_path: str) -> str:
    try:
        # Load Excel data into a Pandas dataframe
        df = pd.read_excel(file_path)
        
        # Convert the dataframe to a string
        excel_text = df.to_string()
        return excel_text
    except Exception as e:
        logging.error(f"An error occurred while extracting text from Excel: {e}")
        return None

# Define a function to split text into chunks
def split_text_into_chunks(text: str, chunk_size: int = 800, chunk_overlap: int = 200) -> list:
    try:
        text_splitter = CharacterTextSplitter(
            separator='\n',
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
        )
        return text_splitter.split_text(text)
    except Exception as e:
        logging.error(f"An error occurred while splitting text into chunks: {e}")
        return None

# Define a function to create a FAISS index from text chunks
def create_faiss_index(text_chunks: list, embedding: OpenAIEmbeddings) -> FAISS:
    try:
        return FAISS.from_texts(text_chunks, embedding)
    except Exception as e:
        logging.error(f"An error occurred while creating FAISS index: {e}")
        return None

# Define a function to search for similar documents
def search_similar_documents(query: str, faiss_index: FAISS) -> list:
    try:
        return faiss_index.similarity_search(query)
    except Exception as e:
        logging.error(f"An error occurred while searching similar documents: {e}")
        return None

# Define a function to answer questions using the QA chain
def answer_questions(query: str, docs: list, openai: OpenAI) -> str:
    try:
        # Join the docs into a single string
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Use OpenAI to answer the question
        chain = load_qa_chain(openai, chain_type="stuff")
        response = chain.run(input_documents=docs, question=query)
        return response
    except Exception as e:
        logging.error(f"An error occurred while answering questions: {e}")
        return None
# Define a function to generate a response using ChatGPT
def generate_response(query: str, docs: list) -> str:
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are an assistant, explain me about the question in detail and this excel file we used help to search from it and also give another heading in which we have explanation by ai here this excel file and perform the calcaulate if require and also if the required prompt is not related to query just pdf have not info: {docs}."},
                {"role": "user", "content": query}
            ]
        )
        if response and response.choices:
            return response.choices[0].message.content
        else:
            return "No response from ChatGPT"
    except Exception as e:
        logging.error(f"An error occurred while generating response using ChatGPT: {e}")
        return None

# Main program
if __name__ == '__main__':
    # Extract text from Excel file
    excel_file_path = r'Assest\1.xlsx'
    excel_text = extract_text_from_excel(excel_file_path)

    if excel_text:
        # Split text into chunks
        text_chunks = split_text_into_chunks(excel_text)

        if text_chunks:
            # Create a FAISS index from text chunks
            embedding = OpenAIEmbeddings()
            faiss_index = create_faiss_index(text_chunks, embedding)

            if faiss_index:
                # Search for similar documents
                query = "What was Microsoft's share price 40 days ago and how has it changed in percentage terms compared to today?"
                docs = search_similar_documents(query, faiss_index)

                if docs:
                    # Answer questions using the QA chain
                    answers = answer_questions(query, docs, OpenAI())

                    # Generate a response using ChatGPT
                    response = generate_response(query, docs)
                    print(f"ChatGPT: {response}")
                else:
                    print("No similar documents found.")
            else:
                print("Failed to create FAISS index.")
        else:
            print("Failed to split text into chunks.")
    else:
        print("Failed to extract text from Excel file.")