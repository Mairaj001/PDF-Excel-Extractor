import os
import logging
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
import openai
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)




pdf_reader = PdfReader(r"Assest\10K-Microsoft.pdf")
raw_text = ''
for i, page in enumerate(pdf_reader.pages):
    content = page.extract_text()
    if content:
        raw_text += content


text_splitter = CharacterTextSplitter(
    separator="\n",
    chunk_size=800,
    chunk_overlap=200,
    length_function=len,
)
text_chunks = text_splitter.split_text(raw_text)


embedding = OpenAIEmbeddings()
doc_search = FAISS.from_texts(text_chunks, embedding)


query = """
What is the EPS (earnings per share) of Microsoft's 10-K?

Calculate the book value per share. (Equity - Outstanding shares).

Calculate the earnings per share (net profit / outstanding shares).

Calculate the dividend per share (dividend paid / shares outstanding).
"""

docs = doc_search.similarity_search(query)

chain = load_qa_chain(OpenAI(), chain_type="stuff")
input_data = {"input_documents": docs, "question": query}
answers = chain.invoke(input=input_data)

response = openai.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "system", "content": f"You are an assistant, explain in detail the question and use the PDF we searched. Also, provide another heading with an explanation by AI for this PDF: {docs}."},
        {"role": "user", "content": query}
    ]
)
print(f"ChatGPT: {response.choices[0].message.content}")
