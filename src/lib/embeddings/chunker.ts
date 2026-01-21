// src/lib/embeddings/chunker.ts
// Document chunking for embedding

import type { ChunkOptions, DocumentChunk } from './types'

// Simple token estimation (rough: 1 token ≈ 4 chars for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Split text into sentences (basic implementation)
function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries, keeping the delimiter
  const sentences = text.split(/(?<=[.!?])\s+/)
  return sentences.filter(s => s.trim().length > 0)
}

// Split text into paragraphs
function splitIntoParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.filter(p => p.trim().length > 0)
}

// Detect section headers (basic heuristic)
function detectHeader(text: string): string | undefined {
  const lines = text.split('\n')
  const firstLine = lines[0]?.trim()
  
  // Check if first line looks like a header
  if (firstLine && firstLine.length < 100) {
    // All caps
    if (firstLine === firstLine.toUpperCase() && firstLine.length > 3) {
      return firstLine
    }
    // Ends with colon
    if (firstLine.endsWith(':')) {
      return firstLine.slice(0, -1)
    }
    // Common section patterns
    if (/^(item|section|part|chapter)\s+\d+/i.test(firstLine)) {
      return firstLine
    }
  }
  
  return undefined
}

export function chunkDocument(
  documentId: string,
  content: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const {
    maxTokens = 500,
    overlap = 50,
    minTokens = 100,
  } = options
  
  const chunks: DocumentChunk[] = []
  
  // First, split into paragraphs
  const paragraphs = splitIntoParagraphs(content)
  
  let currentChunk = ''
  let currentTokens = 0
  let chunkIndex = 0
  let currentHeading: string | undefined
  
  for (const paragraph of paragraphs) {
    const paraTokens = estimateTokens(paragraph)
    
    // Check for section header
    const header = detectHeader(paragraph)
    if (header) {
      currentHeading = header
    }
    
    // If single paragraph exceeds max, split by sentences
    if (paraTokens > maxTokens) {
      // Flush current chunk first
      if (currentChunk.trim() && currentTokens >= minTokens) {
        chunks.push({
          id: `${documentId}-chunk-${chunkIndex}`,
          documentId,
          content: currentChunk.trim(),
          index: chunkIndex,
          tokens: currentTokens,
          metadata: { heading: currentHeading },
        })
        chunkIndex++
      }
      
      // Split paragraph into sentences
      const sentences = splitIntoSentences(paragraph)
      currentChunk = ''
      currentTokens = 0
      
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence)
        
        if (currentTokens + sentenceTokens > maxTokens && currentChunk.trim()) {
          // Save chunk
          chunks.push({
            id: `${documentId}-chunk-${chunkIndex}`,
            documentId,
            content: currentChunk.trim(),
            index: chunkIndex,
            tokens: currentTokens,
            metadata: { heading: currentHeading },
          })
          chunkIndex++
          
          // Start new chunk with overlap
          const words = currentChunk.trim().split(/\s+/)
          const overlapWords = words.slice(-Math.floor(overlap / 4)) // Rough token-to-word
          currentChunk = overlapWords.join(' ') + ' ' + sentence
          currentTokens = estimateTokens(currentChunk)
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence
          currentTokens += sentenceTokens
        }
      }
    } else {
      // Check if adding this paragraph exceeds max
      if (currentTokens + paraTokens > maxTokens && currentChunk.trim()) {
        // Save current chunk
        if (currentTokens >= minTokens) {
          chunks.push({
            id: `${documentId}-chunk-${chunkIndex}`,
            documentId,
            content: currentChunk.trim(),
            index: chunkIndex,
            tokens: currentTokens,
            metadata: { heading: currentHeading },
          })
          chunkIndex++
        }
        
        // Start new chunk with overlap
        const words = currentChunk.trim().split(/\s+/)
        const overlapWords = words.slice(-Math.floor(overlap / 4))
        currentChunk = overlapWords.join(' ') + '\n\n' + paragraph
        currentTokens = estimateTokens(currentChunk)
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
        currentTokens += paraTokens
      }
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim() && currentTokens >= minTokens) {
    chunks.push({
      id: `${documentId}-chunk-${chunkIndex}`,
      documentId,
      content: currentChunk.trim(),
      index: chunkIndex,
      tokens: currentTokens,
      metadata: { heading: currentHeading },
    })
  }
  
  return chunks
}

// Chunk specifically for SEC filings (aware of common sections)
export function chunkSECFiling(
  documentId: string,
  content: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  // SEC filings have standard sections we can detect
  const sectionPatterns = [
    /ITEM\s+1[A-B]?\.\s*/gi,  // Item 1, 1A, 1B
    /ITEM\s+[2-9]\.\s*/gi,    // Items 2-9
    /ITEM\s+1[0-5]\.\s*/gi,   // Items 10-15
    /PART\s+I+\s*/gi,         // Part I, II, III, IV
    /RISK\s+FACTORS/gi,
    /MANAGEMENT.S DISCUSSION/gi,
    /FINANCIAL\s+STATEMENTS/gi,
  ]
  
  // First try to split by major sections
  let sections: { header: string; content: string }[] = []
  let lastIndex = 0
  let lastHeader = 'Introduction'
  
  for (const pattern of sectionPatterns) {
    pattern.lastIndex = 0 // Reset regex
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        sections.push({
          header: lastHeader,
          content: content.slice(lastIndex, match.index),
        })
      }
      lastHeader = match[0].trim()
      lastIndex = match.index + match[0].length
    }
  }
  
  // Add remaining content
  if (lastIndex < content.length) {
    sections.push({
      header: lastHeader,
      content: content.slice(lastIndex),
    })
  }
  
  // If no sections found, fall back to regular chunking
  if (sections.length <= 1) {
    return chunkDocument(documentId, content, options)
  }
  
  // Chunk each section
  const allChunks: DocumentChunk[] = []
  let globalIndex = 0
  
  for (const section of sections) {
    if (section.content.trim().length < 50) continue
    
    const sectionChunks = chunkDocument(
      documentId,
      section.content,
      options
    )
    
    for (const chunk of sectionChunks) {
      allChunks.push({
        ...chunk,
        id: `${documentId}-chunk-${globalIndex}`,
        index: globalIndex,
        metadata: {
          ...chunk.metadata,
          section: section.header,
        },
      })
      globalIndex++
    }
  }
  
  return allChunks
}
