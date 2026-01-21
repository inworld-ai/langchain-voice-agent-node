<script lang="ts">
  import { burgerMenu } from '../menu';
  import { latencyStats, orderState } from '../stores';
  import {
    calculateTotals,
    llmModels,
    ttsModels,
    type LlmModelId,
    type TtsModelId,
  } from '../pricing';
  import { formatCurrency } from '../utils';

  let llmId: LlmModelId = 'anthropic';
  let ttsId: TtsModelId = 'inworld-tts-1.5-mini';
  let convosPerDayPerWindow = 220;
  let avgTurnsPerConvo = 6;
  let windows = 100000;
  let turnsOverride = 6;
  let useLiveTurns = true;

  function toggleStage() {
    if ($orderState.stage === 'menu') {
      orderState.showPricing();
    } else {
      orderState.showMenu();
    }
  }

  let turnsThisConvo = $derived.by(() => {
    const liveTurns = $latencyStats.turns;
    if (useLiveTurns && liveTurns > 0) {
      return liveTurns;
    }
    const overrideValue = Number(turnsOverride);
    const override = Number.isFinite(overrideValue) ? Math.max(overrideValue, 0) : 0;
    return override || liveTurns || 0;
  });

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

<div class="bg-white rounded-2xl p-6 mb-5 border border-gray-200">
  <div class="flex items-center justify-between mb-4">
    <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
      {$orderState.stage === 'menu' ? 'Drive-Thru Menu' : 'Voice Burger Pricing'}
    </span>
    <button
      onclick={toggleStage}
      class="text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
    >
      {$orderState.stage === 'menu' ? 'View pricing' : 'View menu'}
    </button>
  </div>

  {#if $orderState.stage === 'menu'}
    <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
      <div>
        <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Burgers</div>
        <div class="space-y-1.5">
          {#each burgerMenu.burgers as item}
            <div class="flex items-center justify-between">
              <span>{item.name}</span>
              <span class="font-mono text-gray-500">{formatCurrency(item.price)}</span>
            </div>
          {/each}
        </div>
      </div>
      <div>
        <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sides + Drinks</div>
        <div class="space-y-1.5">
          {#each burgerMenu.sides as item}
            <div class="flex items-center justify-between">
              <span>{item.name}</span>
              <span class="font-mono text-gray-500">{formatCurrency(item.price)}</span>
            </div>
          {/each}
          {#each burgerMenu.drinks as item}
            <div class="flex items-center justify-between">
              <span>{item.name}</span>
              <span class="font-mono text-gray-500">{formatCurrency(item.price)}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="mt-4 text-xs text-gray-500">
      Add-ons: {burgerMenu.addOns.join(', ')}. Sauces: {burgerMenu.sauces.join(', ')}.
    </div>
    <div class="mt-4 py-2.5 px-3.5 bg-amber-400/10 border border-amber-400/20 rounded-lg text-xs text-gray-600 text-center">
      Tip: finish the order with "that's all" to trigger pricing mode automatically.
    </div>
  {:else}
    {#if $orderState.summary}
      <div class="mb-4 text-sm text-gray-700">
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">Order Summary</span>
        <span>{$orderState.summary}</span>
      </div>
    {/if}

    <div class="grid md:grid-cols-2 gap-4 mb-5">
      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Models</div>
        <label class="block text-xs text-gray-500 mb-1">LLM</label>
        <select
          class="w-full text-sm rounded-lg border border-gray-200 p-2 mb-3 bg-white"
          bind:value={llmId}
        >
          {#each llmModels as model}
            <option value={model.id}>{model.label}</option>
          {/each}
        </select>
        <label class="block text-xs text-gray-500 mb-1">TTS</label>
        <select
          class="w-full text-sm rounded-lg border border-gray-200 p-2 bg-white"
          bind:value={ttsId}
        >
          {#each ttsModels as model}
            <option value={model.id}>{model.label}</option>
          {/each}
        </select>
      </div>

      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Assumptions</div>
        <label class="block text-xs text-gray-500 mb-1">Turns in this convo</label>
        <div class="flex items-center gap-2 mb-3">
          <input
            type="number"
            min="0"
            class="w-full text-sm rounded-lg border border-gray-200 p-2 bg-white"
            bind:value={turnsOverride}
          />
          <label class="text-xs text-gray-500 flex items-center gap-1">
            <input type="checkbox" bind:checked={useLiveTurns} />
            use live turns
          </label>
        </div>
        <label class="block text-xs text-gray-500 mb-1">Avg turns per convo</label>
        <input
          type="number"
          min="1"
          class="w-full text-sm rounded-lg border border-gray-200 p-2 mb-3 bg-white"
          bind:value={avgTurnsPerConvo}
        />
        <label class="block text-xs text-gray-500 mb-1">Convos per day per window</label>
        <input
          type="number"
          min="1"
          class="w-full text-sm rounded-lg border border-gray-200 p-2 bg-white"
          bind:value={convosPerDayPerWindow}
        />
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Per Turn Costs
        </div>
        <div class="flex items-center justify-between mb-1">
          <span>STT</span>
          <span class="font-mono text-gray-500">{formatCurrency(totals.perTurn.stt)}</span>
        </div>
        <div class="flex items-center justify-between mb-1">
          <span>LLM</span>
          <span class="font-mono text-gray-500">{formatCurrency(totals.perTurn.llm)}</span>
        </div>
        <div class="flex items-center justify-between mb-1">
          <span>TTS</span>
          <span class="font-mono text-gray-500">{formatCurrency(totals.perTurn.tts)}</span>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 font-semibold">
          <span>Total per turn</span>
          <span class="font-mono text-gray-700">{formatCurrency(totals.perTurn.total)}</span>
        </div>
      </div>

      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Conversation Cost
        </div>
        <div class="flex items-center justify-between mb-1">
          <span>This convo ({turnsThisConvo} turns)</span>
          <span class="font-mono text-gray-700">{formatCurrency(totals.perConvo)}</span>
        </div>
        <div class="flex items-center justify-between mb-1">
          <span>Per day (1 window)</span>
          <span class="font-mono text-gray-700">{formatCurrency(totals.dailyPerWindow)}</span>
        </div>
        <div class="flex items-center justify-between mb-1">
          <span>Per year (1 window)</span>
          <span class="font-mono text-gray-700">{formatCurrency(totals.yearlyPerWindow)}</span>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 font-semibold">
          <span>Per year (100,000 windows)</span>
          <span class="font-mono text-gray-900">{formatCurrency(totals.yearlyAtScale)}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 text-xs text-gray-500">
      Pricing uses simple per-turn assumptions for demo purposes. Update the inputs to match your
      operating reality.
    </div>
  {/if}
</div>
