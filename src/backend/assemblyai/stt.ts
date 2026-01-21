import WebSocket from "ws";
import { writableIterator } from "../utils.js";
import type { AssemblyAISTTMessage } from "./api-types.js";
import type { VoiceAgentEvent } from "../types.js";

interface AssemblyAISTTOptions {
  apiKey?: string;
  sampleRate?: number;
  formatTurns?: boolean;
  endOfTurnConfidenceThreshold?: number;
  minEndOfTurnSilenceWhenConfident?: number;
  maxTurnSilence?: number;
}

export class AssemblyAISTT {
  apiKey: string;
  sampleRate: number;
  formatTurns: boolean;
  endOfTurnConfidenceThreshold: number;
  minEndOfTurnSilenceWhenConfident: number;
  maxTurnSilence: number;

  protected _bufferIterator = writableIterator<VoiceAgentEvent.STTEvent>();
  protected _connectionPromise: Promise<WebSocket> | null = null;
  protected get _connection(): Promise<WebSocket> {
    if (this._connectionPromise) {
      return this._connectionPromise;
    }

    this._connectionPromise = new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        sample_rate: this.sampleRate.toString(),
        format_turns: this.formatTurns.toString().toLowerCase(),
        end_of_turn_confidence_threshold: this.endOfTurnConfidenceThreshold.toString(),
        min_end_of_turn_silence_when_confident: this.minEndOfTurnSilenceWhenConfident.toString(),
        max_turn_silence: this.maxTurnSilence.toString(),
      });

      const url = `wss://streaming.assemblyai.com/v3/ws?${params.toString()}`;
      const ws = new WebSocket(url, {
        headers: { Authorization: this.apiKey },
      });

      ws.on("open", () => {
        resolve(ws);
      });

      ws.on("message", (data: WebSocket.RawData) => {
        try {
          const message: AssemblyAISTTMessage = JSON.parse(data.toString());
          if (message.type === "Begin") {
            // no-op
          } else if (message.type === "Turn") {
            if (message.turn_is_formatted) {
              if (message.transcript) {
                this._bufferIterator.push({ type: "stt_output", transcript: message.transcript, ts: Date.now() });
              }
            } else {
              this._bufferIterator.push({ type: "stt_chunk", transcript: message.transcript, ts: Date.now() });
            }
          } else if (message.type === "Termination") {
            // no-op
          } else if (message.type === "Error") {
            throw new Error(message.error);
          }
        } catch (error) {
          // TODO: better catch json parsing error
          console.error(error);
        }
      });

      ws.on("error", (error) => {
        this._bufferIterator.cancel();
        reject(error);
      });

      ws.on("close", () => {
        this._connectionPromise = null;
      });
    });

    return this._connectionPromise;
  }

  constructor(options: AssemblyAISTTOptions) {
    this.apiKey = options.apiKey || process.env.ASSEMBLYAI_API_KEY || "";
    this.sampleRate = options.sampleRate || 16000;
    this.formatTurns = options.formatTurns ?? true;
    this.endOfTurnConfidenceThreshold = options.endOfTurnConfidenceThreshold ?? 0.4;
    this.minEndOfTurnSilenceWhenConfident = options.minEndOfTurnSilenceWhenConfident ?? 400;
    this.maxTurnSilence = options.maxTurnSilence ?? 800;

    if (!this.apiKey) {
      throw new Error("AssemblyAI API key is required");
    }
  }

  async sendAudio(buffer: Uint8Array): Promise<void> {
    const conn = await this._connection;
    conn.send(buffer);
  }

  async *receiveEvents(): AsyncGenerator<VoiceAgentEvent.STTEvent> {
    yield* this._bufferIterator;
  }

  async close(): Promise<void> {
    if (this._connectionPromise) {
      const ws = await this._connectionPromise;
      ws.close();
    }
  }
}
