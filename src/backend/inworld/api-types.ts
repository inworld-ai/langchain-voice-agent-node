/**
 * Create context message for Inworld TTS
 */
export interface InworldCreateMessage {
  context_id: string;
  create: {
    voice_id: string;
    model_id: string;
    audio_config: {
      audio_encoding: "LINEAR16";
      sample_rate_hertz: number;
    };
  };
}

/**
 * Send text message for Inworld TTS
 */
export interface InworldSendTextMessage {
  context_id: string;
  send_text: {
    text: string;
    flush_context: Record<string, never>;
  };
}

/**
 * Close context message for Inworld TTS
 */
export interface InworldCloseContextMessage {
  context_id: string;
  close_context: Record<string, never>;
}

/**
 * Union type for all outgoing Inworld TTS messages
 */
export type InworldTTSRequest =
  | InworldCreateMessage
  | InworldSendTextMessage
  | InworldCloseContextMessage;

/**
 * Response message received from Inworld TTS WebSocket
 */
export interface InworldTTSResponse {
  result?: {
    audioChunk?: {
      audioContent?: string;
      timestampInfo?: unknown;
    };
    contextClosed?: boolean;
    status?: string;
  };
  error?: {
    message?: string;
  };
  done?: boolean;
}
