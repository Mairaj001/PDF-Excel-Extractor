# pdf_processing.py

import os
import openai
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import OpenAI

# Load environment variables from .env file
load_dotenv()


openai.api_key = os.getenv("OPENAI_API_KEY")

def process_pdf_file(pdf_file, query):
    # Load the PDF file using PdfReader
    pdf_reader = PdfReader(pdf_file)

    # Extract text from each page
    raw_text = ''
    for page in pdf_reader.pages:
        content = page.extract_text()
        if content:
            raw_text += content

    # Split the text into chunks
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=800,
        chunk_overlap=200,
        length_function=len,
    )
    text_chunks = text_splitter.split_text(raw_text)

    # Create embeddings
    embeddings = OpenAIEmbeddings()
    doc_search = FAISS.from_texts(text_chunks, embeddings)

    # Load the QA chain
    chain = load_qa_chain(OpenAI(), chain_type="stuff")

    # Perform similarity search
    docs = doc_search.similarity_search(query)

    # Get the answer from the chain
    answer = chain.run(input_documents=docs, question=query)

    # Additional response from ChatGPT
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": f"You are an assistant, explain the question in detail. The PDF used for the search is: {docs}."},
            {"role": "user", "content": query}
        ]
    )

    # Return the combined answer
    return {
        'qa_answer': answer,
        'gpt_explanation': response.choices[0].message.content
    }
