"""RAG (Retrieval-Augmented Generation) system for intelligent document retrieval."""

from typing import List, Dict, Any, Optional
import re
from .openrouter import query_model
from .config import CONTEXT_ENGINEERING_MODEL


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks for better context retrieval.
    
    Args:
        text: The text to chunk
        chunk_size: Maximum size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        List of chunks with metadata
    """
    if not text or len(text) <= chunk_size:
        return [{"text": text, "chunk_index": 0, "start_char": 0, "end_char": len(text)}]
    
    chunks = []
    start = 0
    chunk_index = 0
    
    while start < len(text):
        end = start + chunk_size
        
        # Try to break at sentence boundaries
        if end < len(text):
            # Look for sentence endings (. ! ?) near the chunk boundary
            sentence_end = max(
                text.rfind('.', start, end),
                text.rfind('!', start, end),
                text.rfind('?', start, end),
                text.rfind('\n', start, end)
            )
            
            if sentence_end > start + chunk_size * 0.7:  # Only break if we're not too early
                end = sentence_end + 1
        
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append({
                "text": chunk_text,
                "chunk_index": chunk_index,
                "start_char": start,
                "end_char": end
            })
            chunk_index += 1
        
        # Move start position with overlap
        start = end - chunk_overlap if end < len(text) else end
        
        if start >= len(text):
            break
    
    return chunks


def chunk_document(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Chunk a document into smaller pieces.
    
    Args:
        doc: Document dict with 'name' and 'content' keys
        
    Returns:
        List of chunks with document metadata
    """
    content = doc.get('content', '')
    if not content:
        return []
    
    chunks = chunk_text(content)
    
    # Add document metadata to each chunk
    for chunk in chunks:
        chunk['document_name'] = doc.get('name', 'Untitled')
        chunk['document_type'] = 'document'
    
    return chunks


def chunk_file(file_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Chunk a file into smaller pieces.
    
    Args:
        file_data: File dict with 'name', 'type', and 'content' keys
        
    Returns:
        List of chunks with file metadata
    """
    content = file_data.get('content', '')
    if not content:
        return []
    
    chunks = chunk_text(content)
    
    # Add file metadata to each chunk
    for chunk in chunks:
        chunk['document_name'] = file_data.get('name', 'Untitled')
        chunk['document_type'] = file_data.get('type', 'unknown')
        if 'page_count' in file_data:
            chunk['page_count'] = file_data['page_count']
        if 'slide_count' in file_data:
            chunk['slide_count'] = file_data['slide_count']
    
    return chunks


def chunk_link(link_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Chunk a link's content into smaller pieces.
    
    Args:
        link_data: Link dict with 'name', 'original_url', and 'content' keys
        
    Returns:
        List of chunks with link metadata
    """
    content = link_data.get('content', '')
    if not content:
        return []
    
    chunks = chunk_text(content)
    
    # Add link metadata to each chunk
    for chunk in chunks:
        chunk['document_name'] = link_data.get('original_url', link_data.get('name', 'Unknown URL'))
        chunk['document_type'] = 'url'
    
    return chunks


async def score_chunk_relevance(chunk: Dict[str, Any], query: str) -> float:
    """
    Score a chunk's relevance to the query using LLM-based scoring.
    
    Args:
        chunk: Chunk dict with 'text' and metadata
        query: The query/prompt to match against
        
    Returns:
        Relevance score from 0.0 to 1.0
    """
    chunk_text = chunk.get('text', '')
    if not chunk_text or not query:
        return 0.0
    
    # Use LLM to score relevance (more accurate than keyword matching)
    prompt = f"""You are evaluating how relevant a text chunk is to a query. 
    
Query: {query[:500]}

Text Chunk:
{chunk_text[:1000]}

Rate the relevance on a scale of 0.0 to 1.0, where:
- 1.0 = Highly relevant, directly addresses the query
- 0.7-0.9 = Moderately relevant, provides useful context
- 0.4-0.6 = Somewhat relevant, tangentially related
- 0.1-0.3 = Minimally relevant, very little connection
- 0.0 = Not relevant

Respond with ONLY a single number between 0.0 and 1.0 (no explanation, just the number):"""

    try:
        messages = [{"role": "user", "content": prompt}]
        response = await query_model(CONTEXT_ENGINEERING_MODEL, messages, timeout=10.0)
        
        if response and 'content' in response:
            # Extract numeric score from response
            score_text = response['content'].strip()
            # Try to find a float in the response
            match = re.search(r'([0-9]*\.?[0-9]+)', score_text)
            if match:
                score = float(match.group(1))
                # Ensure score is between 0 and 1
                return max(0.0, min(1.0, score))
        
        # Fallback: simple keyword matching if LLM fails
        return simple_relevance_score(chunk_text, query)
        
    except Exception as e:
        print(f"Error scoring chunk relevance: {e}")
        # Fallback to simple keyword matching
        return simple_relevance_score(chunk_text, query)


def simple_relevance_score(chunk_text: str, query: str) -> float:
    """
    Simple keyword-based relevance scoring as fallback.
    
    Args:
        chunk_text: The chunk text
        query: The query text
        
    Returns:
        Relevance score from 0.0 to 1.0
    """
    chunk_lower = chunk_text.lower()
    query_lower = query.lower()
    
    # Extract meaningful words from query (skip common words)
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'what', 'how', 'why', 'when', 'where', 'who', 'which'}
    query_words = [w for w in query_lower.split() if len(w) > 2 and w not in stop_words]
    
    if not query_words:
        return 0.5  # Default score if no meaningful words
    
    # Count matches
    matches = sum(1 for word in query_words if word in chunk_lower)
    
    # Calculate score based on match ratio
    score = matches / len(query_words)
    
    # Boost score if important keywords appear multiple times
    if matches > 0:
        total_occurrences = sum(chunk_lower.count(word) for word in query_words)
        boost = min(0.3, total_occurrences / 100)  # Cap boost at 0.3
        score = min(1.0, score + boost)
    
    return score


async def retrieve_relevant_chunks(
    query: str,
    documents: List[Dict[str, Any]],
    files: List[Dict[str, Any]],
    links: List[Dict[str, Any]],
    top_k: int = 10,
    relevance_threshold: float = 0.3,
    use_llm_scoring: bool = False
) -> List[Dict[str, Any]]:
    """
    Retrieve the most relevant chunks from all documents, files, and links.
    
    Uses a hybrid approach:
    1. First, use fast keyword-based scoring to filter chunks
    2. Optionally, use LLM-based scoring for top candidates (more accurate but slower)
    
    Args:
        query: The query/prompt to match against
        documents: List of document dicts
        files: List of file dicts
        links: List of link dicts
        top_k: Maximum number of chunks to retrieve
        relevance_threshold: Minimum relevance score to include
        use_llm_scoring: Whether to use LLM for final scoring (slower but more accurate)
        
    Returns:
        List of relevant chunks sorted by relevance (highest first)
    """
    all_chunks = []
    
    # Chunk all documents
    for doc in documents:
        chunks = chunk_document(doc)
        all_chunks.extend(chunks)
    
    # Chunk all files
    for file_data in files:
        chunks = chunk_file(file_data)
        all_chunks.extend(chunks)
    
    # Chunk all links
    for link_data in links:
        chunks = chunk_link(link_data)
        all_chunks.extend(chunks)
    
    if not all_chunks:
        return []
    
    # Step 1: Fast keyword-based scoring for all chunks
    scored_chunks = []
    for chunk in all_chunks:
        score = simple_relevance_score(chunk.get('text', ''), query)
        if score >= relevance_threshold:
            scored_chunks.append({
                **chunk,
                'relevance_score': score
            })
    
    # Sort by keyword relevance (highest first)
    scored_chunks.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    # Step 2: If LLM scoring is enabled, re-score top candidates for better accuracy
    if use_llm_scoring and scored_chunks:
        # Only re-score top candidates (e.g., top 20) to save time and API calls
        candidates_to_rescore = min(20, len(scored_chunks))
        top_candidates = scored_chunks[:candidates_to_rescore]
        
        # Re-score with LLM
        rescored = []
        for chunk in top_candidates:
            llm_score = await score_chunk_relevance(chunk, query)
            # Blend keyword and LLM scores (weighted average)
            blended_score = (chunk['relevance_score'] * 0.4) + (llm_score * 0.6)
            chunk['relevance_score'] = blended_score
            rescored.append(chunk)
        
        # Keep the rest with their keyword scores
        remaining = scored_chunks[candidates_to_rescore:]
        
        # Combine and re-sort
        scored_chunks = rescored + remaining
        scored_chunks.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    # Return top K chunks
    return scored_chunks[:top_k]


def format_retrieved_chunks(chunks: List[Dict[str, Any]]) -> str:
    """
    Format retrieved chunks into a readable string for inclusion in context.
    
    Args:
        chunks: List of chunk dicts with relevance scores
        
    Returns:
        Formatted string ready for inclusion in prompt
    """
    if not chunks:
        return ""
    
    formatted = "\n\n---\n\n## RETRIEVED RELEVANT CONTEXT (RAG)\n\n"
    formatted += f"*The following {len(chunks)} most relevant chunks were retrieved from your attachments using RAG (Relevance scores shown):*\n\n"
    
    for i, chunk in enumerate(chunks, 1):
        doc_name = chunk.get('document_name', 'Unknown')
        doc_type = chunk.get('document_type', 'unknown')
        score = chunk.get('relevance_score', 0.0)
        chunk_text = chunk.get('text', '')
        
        formatted += f"### Chunk {i} from {doc_name} ({doc_type.upper()}) - Relevance: {score:.2f}\n\n"
        formatted += f"{chunk_text}\n\n"
        
        # Add metadata if available
        if 'page_count' in chunk:
            formatted += f"*Source: {chunk['page_count']} pages*\n\n"
        elif 'slide_count' in chunk:
            formatted += f"*Source: {chunk['slide_count']} slides*\n\n"
    
    return formatted
