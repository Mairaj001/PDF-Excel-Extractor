import os
import logging
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import OpenAI
import openai

import os 
os.environ["OPENAI_API_KEY"] = 'sk-proj-8hEDD0MBrecoxmRA5cyWT3BlbkFJhn1v2mVy59OkNOC6n9EU'
pdf_reader = PdfReader(r"Assest\10K-Microsoft.pdf")

from typing_extensions import Concatenate
rawText = ''
for i,page in enumerate(pdf_reader.pages):
    content = page.extract_text()
    if content:
        rawText += content

textSplit = CharacterTextSplitter(
    separator=  "\n",
    chunk_size = 800,
    chunk_overlap = 200,
    length_function = len,
)
text = textSplit.split_text(rawText)

embedding = OpenAIEmbeddings()
docSearch = FAISS.from_texts(text,embedding)


from langchain_openai import OpenAI
chain = load_qa_chain(OpenAI(), chain_type="stuff")
# this will set by user 
query = """
What is the EPS (earnings per share) of Microsoft's 10-K?

Calculate the book value per share. (Equity - Outstanding shares).

Calculate the earnings per share (net profit / outstanding shares).

Calculate the dividend per share (dividend paid / shares outstanding).
"""
docs = docSearch.similarity_search(query)
# print(docs)
chain.run(input_documents = docs, question = query)

response = openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": f"You are an assistant, explain me about the question in detail and this pdf we used help to search from it and also give another heading in which we have explanation by ai here this pdf: {docs}."},
            {"role": "user", "content": query}
        ]
    )
print(f"ChatGPT: {response.choices[0].message.content}")