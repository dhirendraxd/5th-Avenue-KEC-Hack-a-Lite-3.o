/**
 * Chat message structure for conversation with AI assistant
 * - role: Identifies whether message is from user or assistant
 * - content: The actual message text (supports Markdown and equipment tags)
 */
export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Supabase Edge Function endpoint for equipment recommendation chat
 * Connects to OpenAI-compatible streaming API
 */
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/equipment-chat`;

/**
 * Stream chat responses from AI assistant
 * Uses Server-Sent Events (SSE) to receive incremental response chunks
 *
 * Flow:
 * 1. Send conversation history to Supabase Edge Function
 * 2. Edge Function forwards to OpenAI API for streaming response
 * 3. Parse SSE stream line-by-line as chunks arrive
 * 4. Extract content from each chunk and pass to onDelta callback
 * 5. Handle completion and errors appropriately
 *
 * @param messages - Full conversation history (user and assistant messages)
 * @param onDelta - Callback fired for each text chunk received
 * @param onDone - Callback fired when stream completes successfully
 * @param onError - Callback fired if request or parsing fails
 */
export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  // POST conversation history to Supabase Edge Function
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Supabase auth key for Edge Function access
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  // Handle HTTP errors (network issues, auth failures, etc.)
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Failed to connect to AI assistant");
    return;
  }

  // Ensure response has a readable stream body
  if (!resp.body) {
    onError("No response stream");
    return;
  }

  /**
   * Set up stream reader and decoder
   * - reader: ReadableStream reader to get chunks from response body
   * - decoder: Convert binary chunks to UTF-8 text
   * - textBuffer: Accumulate partial lines that span multiple chunks
   * - streamDone: Track when [DONE] signal received
   */
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  // Read stream chunks until completion
  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode binary chunk to text and add to buffer
    textBuffer += decoder.decode(value, { stream: true });

    /**
     * Process complete lines from the buffer
     * SSE format: Each event is "data: {json}\n"
     * Lines starting with ":" are comments (ignored)
     * [DONE] signal indicates stream end
     */
    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      // Extract one complete line from buffer
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      // Handle different line endings (\r\n or \n)
      if (line.endsWith("\r")) line = line.slice(0, -1);

      // Skip SSE comments and empty lines
      if (line.startsWith(":") || line.trim() === "") continue;

      // Only process SSE data lines
      if (!line.startsWith("data: ")) continue;

      // Extract JSON payload (remove "data: " prefix)
      const jsonStr = line.slice(6).trim();

      // Check for stream completion signal
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      // Parse OpenAI streaming response format
      try {
        const parsed = JSON.parse(jsonStr);
        // Extract text content from delta (incremental update)
        const content = parsed.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (content) onDelta(content);
      } catch {
        // If JSON parse fails, might be incomplete - restore to buffer
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  /**
   * Final flush: Process any remaining buffered data
   * After stream ends, there might be incomplete lines left in buffer
   * Try to parse them one more time for complete messages
   */
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      // Skip comments and empty lines
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;

      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (content) onDelta(content);
      } catch {
        /* ignore unparseable fragments */
      }
    }
  }

  // Notify completion
  onDone();
}
