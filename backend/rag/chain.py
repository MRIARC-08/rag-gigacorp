# backend/rag/chain.py
# LangChain RAG chain with Groq LLM

from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from rag.vectorstore import get_retriever
from core.config import get_settings
from typing import Dict, Any

settings = get_settings()

SYSTEM_PROMPT = """You are GigaCorp's friendly and knowledgeable AI customer support assistant.

Your job is to answer customer questions using the context provided below and the conversation history.

INSTRUCTIONS:
1. Use the context and chat history to give accurate, helpful answers.
2. If the question relates to topics covered in the context, reason through the information and answer — even if the exact wording doesn't match. Use common sense.
3. For conversational follow-ups (e.g. "tell me more", "what about X?", "how many days?"), use the chat history to understand what the user is referring to.
4. Only say you don't have information if the topic is truly NOT covered anywhere in the context.
5. Format your answers using markdown for readability:
   - Use **bold** for key details (prices, deadlines, names)
   - Use bullet points or numbered lists for multi-part answers
   - Use tables when comparing items (e.g. subscription tiers)
6. Keep answers concise but complete. Don't repeat the question back.

Context:
{context}

Chat History:
{chat_history}

Question: {question}

Answer:"""

PROMPT = PromptTemplate(
    input_variables=["context", "chat_history", "question"],
    template=SYSTEM_PROMPT
)

_session_memories: Dict[str, ConversationBufferWindowMemory] = {}

def get_memory(session_id: str) -> ConversationBufferWindowMemory:
    if session_id not in _session_memories:
        _session_memories[session_id] = ConversationBufferWindowMemory(
            k=10,
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
    return _session_memories[session_id]

def get_chain(session_id: str) -> ConversationalRetrievalChain:
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name=settings.GROQ_MODEL,
        temperature=0.3,
        max_tokens=1024
    )
    
    memory = get_memory(session_id)
    retriever = get_retriever(k=5)
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        return_source_documents=True,
        combine_docs_chain_kwargs={"prompt": PROMPT},
        output_key="answer",
        verbose=False
    )
    
    return chain

async def run_chain(
    session_id: str, 
    question: str
) -> Dict[str, Any]:
    chain = get_chain(session_id)
    
    result = await chain.ainvoke({
        "question": question
    })
    
    sources = []
    seen_content = set()
    
    for doc in result.get("source_documents", []):
        content = doc.page_content[:200]
        
        if content not in seen_content:
            seen_content.add(content)
            sources.append({
                "content": doc.page_content,
                "source_file": doc.metadata.get("source", "gigacorp_faq.txt"),
                "line_number": doc.metadata.get("line_reference", "N/A"),
                "section": doc.metadata.get("section", "GENERAL")
            })
    
    return {
        "answer": result["answer"],
        "sources": sources
    }
