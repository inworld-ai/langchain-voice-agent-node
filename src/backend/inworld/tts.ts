import WebSocket from 'ws';
import { writableIterator } from '../utils.js';
import type {
  InworldCreateMessage,
  InworldSendTextMessage,
  InworldCloseContextMessage,
  InworldTTSResponse,
} from './api-types.js';
import type { VoiceAgentEvent } from '../types.js';

interface InworldTTSOptions {
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  sampleRate?: number;
}

export class InworldTTS {
  apiKey: string;
  voiceId: string;
  modelId: string;
  sampleRate: number;

  protected _bufferIterator = writableIterator<VoiceAgentEvent.TTSChunk>();
  protected _connectionPromise: Promise<WebSocket> | null = null;
  protected _contextCounter = 0;

  /**
   * Generate a valid context_id for Inworld.
   */
  protected _generateContextId(): string {
    const timestamp = Date.now();
    const counter = this._contextCounter++;
    return `ctx-${timestamp}-${counter}`;
  }

  protected get _connection(): Promise<WebSocket> {
    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    this._connectionPromise = new Promise((resolve, reject) => {
      const url = 'wss://api.inworld.ai/tts/v1/voice:streamBidirectional';
      const ws = new WebSocket(url, {
        headers: {
          Authorization: `Basic ${this.apiKey}`,
        },
      });

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('message', (data: WebSocket.RawData) => {
        try {
          const message: InworldTTSResponse = JSON.parse(data.toString());

          // Handle server errors
          if (message.error?.message) {
            console.error(`Inworld error: ${message.error.message}`);
            return;
          }

          // Handle audio chunks
          const audioContent = message.result?.audioChunk?.audioContent;
          if (audioContent) {
            // Decode base64 to check for WAV header
            const audioBuffer = Buffer.from(audioContent, 'base64');

            // Strip WAV header if present (44 bytes starting with "RIFF")
            let pcmData: Buffer;
            if (
              audioBuffer.length > 44 &&
              audioBuffer.subarray(0, 4).toString() === 'RIFF'
            ) {
              pcmData = audioBuffer.subarray(44);
            } else {
              pcmData = audioBuffer;
            }

            // Re-encode to base64 and push
            this._bufferIterator.push({
              type: 'tts_chunk',
              audio: pcmData.toString('base64'),
              ts: Date.now(),
            });
          }

          // Handle context closed confirmation
          if (message.result?.contextClosed) {
            // Context is closed, ready for next request
          }
        } catch (error) {
          console.error('Inworld JSON parse error:', error);
        }
      });

      ws.on('error', (error) => {
        this._bufferIterator.cancel();
        reject(error);
      });

      ws.on('close', () => {
        this._connectionPromise = null;
      });
    });

    return this._connectionPromise;
  }

  constructor(options: InworldTTSOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.INWORLD_API_KEY ?? '';
    if (!this.apiKey) {
      throw new Error('Inworld API key is required');
    }
    this.voiceId = options.voiceId ?? 'Ashley';
    this.modelId = options.modelId ?? 'inworld-tts-1.5-max';
    this.sampleRate = options.sampleRate ?? 24000;
  }

  async sendText(text: string): Promise<void> {
    if (!text || !text.trim()) {
      return;
    }

    const conn = await this._connection;
    if (conn.readyState === WebSocket.OPEN) {
      const contextId = this._generateContextId();

      // Step 1: Create context
      const createMsg: InworldCreateMessage = {
        context_id: contextId,
        create: {
          voice_id: this.voiceId,
          model_id: this.modelId,
          audio_config: {
            audio_encoding: 'LINEAR16',
            sample_rate_hertz: this.sampleRate,
          },
        },
      };
      conn.send(JSON.stringify(createMsg));

      // Step 2: Send text with flush
      const sendTextMsg: InworldSendTextMessage = {
        context_id: contextId,
        send_text: {
          text: text,
          flush_context: {},
        },
      };
      conn.send(JSON.stringify(sendTextMsg));

      // Step 3: Close context
      const closeMsg: InworldCloseContextMessage = {
        context_id: contextId,
        close_context: {},
      };
      conn.send(JSON.stringify(closeMsg));
    }
  }

  async *receiveEvents(): AsyncGenerator<VoiceAgentEvent.TTSChunk> {
    yield* this._bufferIterator;
  }

  async warmup(): Promise<void> {
    await this._connection;
  }

  async close(): Promise<void> {
    if (this._connectionPromise) {
      const ws = await this._connectionPromise;
      ws.close();
    }
  }
}
