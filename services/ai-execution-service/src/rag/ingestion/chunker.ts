import type { DocumentMetadata } from '@loan-platform/shared-types';

export interface ChunkInput {
  content: string;
  source: string;
  title: string;
  metadata?: DocumentMetadata;
  chunkSize?: number;     // approximate character count (default 2000)
  chunkOverlap?: number;  // overlap in characters (default 200)
}

export interface TextChunk {
  content: string;
  chunkIndex: number;
  source: string;
  title: string;
  metadata: DocumentMetadata;
  charStart: number;
  charEnd: number;
}

const DEFAULT_CHUNK_SIZE = 2000;
const DEFAULT_OVERLAP = 200;

/**
 * Splits a document into overlapping text chunks.
 *
 * Strategy:
 * 1. Split on paragraph boundaries (double newline) first
 * 2. If a paragraph exceeds chunkSize, split on sentence boundaries (. ! ?)
 * 3. Merge short paragraphs until reaching chunkSize
 * 4. Apply overlap by carrying the tail of the previous chunk into the next
 *
 * Metadata is deep-copied into every chunk and enriched with
 * chunkTotal and charStart/charEnd for source reconstruction.
 */
export function chunkDocument(input: ChunkInput): TextChunk[] {
  const chunkSize = input.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = input.chunkOverlap ?? DEFAULT_OVERLAP;

  const normalised = input.content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  if (normalised.length === 0) return [];

  // Step 1: paragraph-split
  const paragraphs = normalised.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  // Step 2: merge paragraphs into target-sized segments
  const segments: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (para.length > chunkSize) {
      // Flush current buffer first
      if (current.trim()) { segments.push(current.trim()); current = ''; }
      // Split oversized paragraph on sentence boundaries
      const sentences = para.match(/[^.!?]+[.!?]+[\s]*/g) ?? [para];
      let sentBuf = '';
      for (const sentence of sentences) {
        if ((sentBuf + sentence).length > chunkSize && sentBuf.trim()) {
          segments.push(sentBuf.trim());
          sentBuf = sentence;
        } else {
          sentBuf += sentence;
        }
      }
      if (sentBuf.trim()) segments.push(sentBuf.trim());
    } else if ((current + '\n\n' + para).length > chunkSize && current.trim()) {
      segments.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) segments.push(current.trim());

  // Step 3: apply overlap — prefix each segment (except first) with the tail
  // of the previous segment to maintain semantic continuity across chunk boundaries.
  const chunks: TextChunk[] = [];
  let charCursor = 0;

  for (let i = 0; i < segments.length; i++) {
    let text = segments[i]!;

    if (i > 0 && overlap > 0) {
      const prev = segments[i - 1]!;
      const tail = prev.length > overlap ? prev.slice(prev.length - overlap) : prev;
      text = `${tail}\n\n${text}`;
    }

    const charStart = normalised.indexOf(segments[i]!, charCursor);
    const charEnd = charStart + (segments[i]?.length ?? 0);
    charCursor = charEnd;

    chunks.push({
      content: text,
      chunkIndex: i,
      source: input.source,
      title: input.title,
      metadata: {
        ...input.metadata,
        chunkTotal: segments.length,
        charStart,
        charEnd,
      },
      charStart,
      charEnd,
    });
  }

  return chunks;
}
