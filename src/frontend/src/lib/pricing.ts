export type LlmModelId = "anthropic" | "gemini";
export type TtsModelId = "inworld-tts-1.5-mini" | "inworld-tts-1.5-max";

export const sttPerTurnUsd = 0.0012;

export const llmModels: Array<{ id: LlmModelId; label: string; perTurnUsd: number }> = [
  { id: "anthropic", label: "Anthropic", perTurnUsd: 0.0032 },
  { id: "gemini", label: "Gemini", perTurnUsd: 0.0024 },
];

export const ttsModels: Array<{ id: TtsModelId; label: string; perTurnUsd: number }> = [
  { id: "inworld-tts-1.5-mini", label: "Inworld TTS 1.5 Mini", perTurnUsd: 0.0014 },
  { id: "inworld-tts-1.5-max", label: "Inworld TTS 1.5 Max", perTurnUsd: 0.0026 },
];

export function getLlmModel(id: LlmModelId) {
  return llmModels.find((model) => model.id === id) ?? llmModels[0];
}

export function getTtsModel(id: TtsModelId) {
  return ttsModels.find((model) => model.id === id) ?? ttsModels[0];
}

export function perTurnCostUsd(llmId: LlmModelId, ttsId: TtsModelId) {
  const llm = getLlmModel(llmId);
  const tts = getTtsModel(ttsId);
  return {
    stt: sttPerTurnUsd,
    llm: llm.perTurnUsd,
    tts: tts.perTurnUsd,
    total: sttPerTurnUsd + llm.perTurnUsd + tts.perTurnUsd,
  };
}

export function calculateTotals(options: {
  turnsThisConvo: number;
  avgTurnsPerConvo: number;
  convosPerDayPerWindow: number;
  windows: number;
  llmId: LlmModelId;
  ttsId: TtsModelId;
}) {
  const perTurn = perTurnCostUsd(options.llmId, options.ttsId);
  const perConvo = perTurn.total * options.turnsThisConvo;
  const dailyPerWindow = perTurn.total * options.avgTurnsPerConvo * options.convosPerDayPerWindow;
  const yearlyPerWindow = dailyPerWindow * 365;
  const yearlyAtScale = yearlyPerWindow * options.windows;
  return {
    perTurn,
    perConvo,
    dailyPerWindow,
    yearlyPerWindow,
    yearlyAtScale,
  };
}
