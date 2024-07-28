import logging
from PyPDF2 import PdfReader
from io import BytesIO
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
import openai

# Set OpenAI API key
openai.api_key = "sk-proj-8hEDD0MBrecoxmRA5cyWT3BlbkFJhn1v2mVy59OkNOC6n9EU"

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file."""
    pdf_reader = PdfReader(BytesIO(pdf_file.read()))  # Use BytesIO for in-memory processing
    raw_text = ''
    for i, page in enumerate(pdf_reader.pages):
        content = page.extract_text()
        if content:
            raw_text += content
    return raw_text

def split_text_into_chunks(raw_text, chunk_size=800, chunk_overlap=200):
    """Split raw text into chunks."""
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    return text_splitter.split_text(raw_text)

def create_faiss_index(text_chunks):
    """Create a FAISS index from text chunks."""
    embedding = OpenAIEmbeddings()
    return FAISS.from_texts(text_chunks, embedding)

def search_similar_documents(doc_search, query):
    """Search for similar documents."""
    try:
        docs = doc_search.similarity_search(query)
        return docs
    except Exception as e:
        logging.error(f"Error during similarity search: {e}")
        return []

def answer_questions_with_qa_chain(docs, query):
    """Answer questions using the QA chain."""
    chain = load_qa_chain(OpenAI(), chain_type="stuff")
    input_data = {"input_documents": docs, "question": query}
    try:
        answers = chain.invoke(input=input_data)
        return answers
    except Exception as e:
        logging.error(f"Error during QA chain invocation: {e}")
        return "Error answering the query."

def generate_chatgpt_response(docs, query):
    """Generate a response using ChatGPT."""
    try:
        response = openai.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an assistant. Explain in detail the question and use the PDF we searched. Also, provide another heading with an explanation by AI for this PDF: {docs}.",
                },
                {"role": "user", "content": query},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error generating ChatGPT response: {e}")
        return "Error generating a response from ChatGPT."

def process_pdf_query(pdf_file, query):
    """Process the PDF and query to provide an answer."""
    try:
        # Extract text from PDF
        raw_text = extract_text_from_pdf(pdf_file)
        if not raw_text:
            logging.error("No text extracted from PDF.")
            return "No text extracted from PDF."

        # Split text into chunks
        text_chunks = split_text_into_chunks(raw_text)

        # Create FAISS index from text chunks
        doc_search = create_faiss_index(text_chunks)

        # Search for similar documents
        docs = search_similar_documents(doc_search, query)
        if not docs:
            logging.error("No documents found for the query.")
            return "No relevant documents found for the query."

        # Answer questions using the QA chain
        answers = answer_questions_with_qa_chain(docs, query)

        # Generate a response using ChatGPT
        chatgpt_response = generate_chatgpt_response(docs, query)
        return f"ChatGPT: {chatgpt_response}"

    except Exception as e:
        logging.error(f"Error processing PDF and query: {e}")
        return "An error occurred during processing. Please try again."
