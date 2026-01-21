<script lang="ts">
  import { latencyStats } from '../stores';
  import {
    calculateTotals,
    llmModels,
    ttsModels,
    type LlmModelId,
    type TtsModelId,
  } from '../pricing';
  import { formatCurrency } from '../utils';

  let llmId = $state<LlmModelId>('anthropic');
  let ttsId = $state<TtsModelId>('inworld-tts-1.5-mini');
  let convosPerDayPerWindow = $state(220);
  let avgTurnsPerConvo = $state(6);
  let windows = $state(100000);

  let turnsThisConvo = $derived($latencyStats.turns || avgTurnsPerConvo);

  let totals = $derived.by(() => {
    const avgTurns = Math.max(Number(avgTurnsPerConvo) || 0, 0);
    const dailyConvos = Math.max(Number(convosPerDayPerWindow) || 0, 0);
    const windowCount = Math.max(Number(windows) || 0, 0);
    return calculateTotals({
      turnsThisConvo,
      avgTurnsPerConvo: avgTurns,
      convosPerDayPerWindow: dailyConvos,
      windows: windowCount,
      llmId,
      ttsId,
    });
  });
</script>

<div class="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
  <div class="flex items-center justify-between mb-5">
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
      <span class="text-xs font-medium uppercase tracking-wider text-gray-500">Cost Estimates</span>
    </div>
    <span class="text-[10px] text-gray-600">per-turn pricing</span>
  </div>

  <!-- Model Selection -->
  <div class="grid grid-cols-2 gap-3 mb-5">
    <div>
      <label for="llm-select" class="block text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">LLM Provider</label>
      <select
        id="llm-select"
        class="w-full text-sm rounded-lg border border-gray-700 p-2.5 bg-gray-800/50 text-gray-200
               focus:border-purple-500 focus:outline-none transition-colors"
        bind:value={llmId}
      >
        {#each llmModels as model}
          <option value={model.id}>{model.label}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="tts-select" class="block text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">TTS Provider</label>
      <select
        id="tts-select"
        class="w-full text-sm rounded-lg border border-gray-700 p-2.5 bg-gray-800/50 text-gray-200
               focus:border-orange-500 focus:outline-none transition-colors"
        bind:value={ttsId}
      >
        {#each ttsModels as model}
          <option value={model.id}>{model.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Per Turn Costs -->
  <div class="mb-5 p-4 bg-gray-800/30 rounded-lg border border-gray-800">
    <div class="text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-3">Per Turn Cost</div>
    <div class="grid grid-cols-4 gap-3">
      <div class="text-center">
        <div class="text-[9px] uppercase text-gray-600 mb-1">STT</div>
        <div class="font-mono text-sm text-cyan-400">{formatCurrency(totals.perTurn.stt)}</div>
      </div>
      <div class="text-center">
        <div class="text-[9px] uppercase text-gray-600 mb-1">LLM</div>
        <div class="font-mono text-sm text-purple-400">{formatCurrency(totals.perTurn.llm)}</div>
      </div>
      <div class="text-center">
        <div class="text-[9px] uppercase text-gray-600 mb-1">TTS</div>
        <div class="font-mono text-sm text-orange-400">{formatCurrency(totals.perTurn.tts)}</div>
      </div>
      <div class="text-center border-l border-gray-700 pl-3">
        <div class="text-[9px] uppercase text-gray-600 mb-1">Total</div>
        <div class="font-mono text-sm font-semibold text-emerald-400">{formatCurrency(totals.perTurn.total)}</div>
      </div>
    </div>
  </div>

  <!-- Assumptions -->
  <div class="grid grid-cols-3 gap-3 mb-5">
    <div>
      <label for="turns-input" class="block text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">Turns/Convo</label>
      <input
        id="turns-input"
        type="number"
        min="1"
        class="w-full text-sm rounded-lg border border-gray-700 p-2 bg-gray-800/50 text-gray-200
               focus:border-cyan-500 focus:outline-none transition-colors font-mono"
        bind:value={avgTurnsPerConvo}
      />
    </div>
    <div>
      <label for="convos-input" class="block text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">Convos/Day</label>
      <input
        id="convos-input"
        type="number"
        min="1"
        class="w-full text-sm rounded-lg border border-gray-700 p-2 bg-gray-800/50 text-gray-200
               focus:border-cyan-500 focus:outline-none transition-colors font-mono"
        bind:value={convosPerDayPerWindow}
      />
    </div>
    <div>
      <label for="scale-input" class="block text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-1.5">Scale (units)</label>
      <input
        id="scale-input"
        type="number"
        min="1"
        class="w-full text-sm rounded-lg border border-gray-700 p-2 bg-gray-800/50 text-gray-200
               focus:border-cyan-500 focus:outline-none transition-colors font-mono"
        bind:value={windows}
      />
    </div>
  </div>

  <!-- Cost Summary -->
  <div class="grid grid-cols-2 gap-3">
    <div class="p-4 bg-gray-800/30 rounded-lg border border-gray-800">
      <div class="text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-3">Single Unit</div>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Per conversation</span>
          <span class="font-mono text-gray-300">{formatCurrency(totals.perConvo)}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Daily</span>
          <span class="font-mono text-gray-300">{formatCurrency(totals.dailyPerWindow)}</span>
        </div>
        <div class="flex justify-between text-sm pt-2 border-t border-gray-700">
          <span class="text-gray-400 font-medium">Yearly</span>
          <span class="font-mono text-gray-200 font-medium">{formatCurrency(totals.yearlyPerWindow)}</span>
        </div>
      </div>
    </div>
    <div class="p-4 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-lg border border-purple-500/20">
      <div class="text-[10px] font-medium uppercase tracking-wider text-gray-600 mb-3">At Scale</div>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">{windows.toLocaleString()} units</span>
          <span class="text-gray-400">yearly</span>
        </div>
        <div class="pt-3">
          <div class="font-mono text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {formatCurrency(totals.yearlyAtScale)}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
