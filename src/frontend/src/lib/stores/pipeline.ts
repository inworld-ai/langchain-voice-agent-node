import { writable, derived } from "svelte/store";
import type { TurnState, LatencyStats } from "../types";

const initialTurnState: TurnState = {
  active: false,
  turnStartTs: null,
  sttStartTs: null,
  sttLastChunkTs: null,
  sttEndTs: null,
  agentStartTs: null,
  agentEndTs: null,
  ttsStartTs: null,
  ttsEndTs: null,
  transcript: "",
  response: "",
};

function createTurnStore() {
  const { subscribe, set, update } = writable<TurnState>(initialTurnState);

  return {
    subscribe,

    startTurn(ts: number) {
      set({
        ...initialTurnState,
        active: true,
        turnStartTs: ts,
      });
    },

    sttStart(ts: number) {
      update((t) => ({ ...t, sttStartTs: t.sttStartTs ?? ts }));
    },

    sttEnd(ts: number, transcript: string) {
      update((t) => ({ ...t, sttEndTs: ts, transcript }));
    },

    sttChunk(ts: number, transcript: string) {
      update((t) => ({ ...t, sttLastChunkTs: ts, transcript }));
    },

    agentStart(ts: number) {
      update((t) => ({ ...t, agentStartTs: t.agentStartTs ?? ts }));
    },

    agentChunk(ts: number, text: string) {
      update((t) => ({
        ...t,
        agentStartTs: t.agentStartTs ?? ts,
        response: t.response + text,
      }));
    },

    agentEnd(ts: number) {
      update((t) => ({ ...t, agentEndTs: ts }));
    },

    ttsStart(ts: number) {
      update((t) => ({ ...t, ttsStartTs: t.ttsStartTs ?? ts }));
    },

    ttsChunk(ts: number) {
      update((t) => ({
        ...t,
        ttsStartTs: t.ttsStartTs ?? ts,
        ttsEndTs: ts,
      }));
    },

    finishTurn() {
      update((t) => ({ ...t, active: false }));
    },

    reset() {
      set(initialTurnState);
    },
  };
}

function createLatencyStore() {
  const { subscribe, set, update } = writable<LatencyStats>({
    turns: 0,
    stt: [],
    agent: [],
    tts: [],
    total: [],
  });

  return {
    subscribe,

    recordTurn(turn: TurnState) {
      // STT latency: fixed estimate of ~400ms for turn detection
      const sttLatency = turn.sttEndTs ? 400 : null;
      // LLM latency: time from LLM call to LLM output complete
      const llmLatency =
        turn.agentEndTs && turn.sttEndTs
          ? turn.agentEndTs - turn.sttEndTs
          : null;
      // TTS latency: time from LLM done to first audio byte
      const ttsLatency =
        turn.ttsStartTs && turn.agentEndTs
          ? turn.ttsStartTs - turn.agentEndTs
          : null;
      // Total: STT (~400ms) + LLM + TTS
      const totalLatency =
        sttLatency !== null && llmLatency !== null && ttsLatency !== null
          ? sttLatency + llmLatency + ttsLatency
          : null;

      if (sttLatency !== null && llmLatency !== null && ttsLatency !== null && totalLatency !== null) {
        update((s) => ({
          turns: s.turns + 1,
          stt: [...s.stt, sttLatency],
          agent: [...s.agent, llmLatency],
          tts: [...s.tts, ttsLatency],
          total: [...s.total, totalLatency],
        }));
      }
    },

    reset() {
      set({ turns: 0, stt: [], agent: [], tts: [], total: [] });
    },
  };
}

export const currentTurn = createTurnStore();
export const latencyStats = createLatencyStore();

// Audio playback state (true when audio is actively playing)
export const audioPlaying = writable<boolean>(false);

// Preserved waterfall data (kept until next turn starts)
export const waterfallData = writable<TurnState | null>(null);

// Derived stats
export const computedStats = derived(latencyStats, ($stats) => {
  if ($stats.total.length === 0) {
    return { avg: null, min: null, max: null };
  }
  const avg = $stats.total.reduce((a, b) => a + b, 0) / $stats.total.length;
  const min = Math.min(...$stats.total);
  const max = Math.max(...$stats.total);
  return { avg, min, max };
});
