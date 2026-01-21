<script lang="ts">
  import { currentTurn, waterfallData, computedStats, latencyStats } from '../stores';
  import { formatDuration } from '../utils';

  // Use current turn if active, otherwise preserved waterfall data
  let data = $derived($currentTurn.active ? $currentTurn : $waterfallData);

  interface BarStyle {
    left: string;
    width: string;
    opacity: number;
  }

  function getBarStyle(
    baseTime: number,
    totalDuration: number,
    startTs: number | null,
    endTs: number | null,
    isActiveNow: boolean
  ): BarStyle {
    if (!startTs) return { left: '0%', width: '0%', opacity: 0 };

    const now = Date.now();
    const left = ((startTs - baseTime) / totalDuration) * 100;

    let end: number;
    if (endTs) {
      end = endTs;
    } else if (isActiveNow) {
      end = now;
    } else {
      end = startTs;
    }

    const width = Math.max(((end - startTs) / totalDuration) * 100, 0.5);
    return { left: `${left}%`, width: `${width}%`, opacity: 1 };
  }

  function getDuration(startTs: number | null, endTs: number | null, isActiveNow: boolean): string {
    if (!startTs) return '—';
    if (!endTs && isActiveNow) return formatDuration(Date.now() - startTs);
    if (!endTs) return '—';
    return formatDuration(endTs - startTs);
  }

  let bars = $derived.by(() => {
    if (!data?.turnStartTs) return null;

    const baseTime = data.turnStartTs;
    const now = Date.now();
    const isActive = $currentTurn.active;

    // Calculate end time for scaling
    let endTime = baseTime;
    if (data.ttsStartTs) endTime = Math.max(endTime, data.ttsStartTs);
    else if (data.agentStartTs) endTime = Math.max(endTime, data.agentStartTs);
    else if (data.sttEndTs) endTime = Math.max(endTime, data.sttEndTs);
    if (isActive) endTime = Math.max(endTime, now);

    const totalDuration = Math.max(endTime - baseTime, 500);

    // STT latency: estimated ~400ms for turn detection
    const sttLatency = data.sttEndTs ? '~400' : data.sttStartTs ? '...' : '—';

    // LLM latency: time from LLM call to LLM output complete
    const llmLatency = data.agentEndTs && data.sttEndTs
      ? formatDuration(data.agentEndTs - data.sttEndTs)
      : data.sttEndTs ? '...' : '—';

    // TTS latency: time from LLM done to first audio
    const ttsLatency = data.ttsStartTs && data.agentEndTs
      ? formatDuration(data.ttsStartTs - data.agentEndTs)
      : data.agentEndTs ? '...' : '—';

    return {
      stt: {
        style: getBarStyle(baseTime, totalDuration, data.sttStartTs, data.sttEndTs, isActive && !!data.sttStartTs && !data.sttEndTs),
        duration: sttLatency,
      },
      agent: {
        style: getBarStyle(baseTime, totalDuration, data.sttEndTs, data.agentEndTs, isActive && !!data.sttEndTs && !data.agentEndTs),
        duration: llmLatency,
      },
      tts: {
        style: getBarStyle(baseTime, totalDuration, data.agentEndTs, data.ttsStartTs, isActive && !!data.agentEndTs && !data.ttsStartTs),
        duration: ttsLatency,
      },
    };
  });

  // Total latency: STT (~400ms) + LLM + TTS
  let totalLatencyDisplay = $derived.by(() => {
    if (!data) return '—';
    const sttEstimate = 400;
    if (data.sttEndTs && data.agentEndTs && data.ttsStartTs) {
      const llm = data.agentEndTs - data.sttEndTs;
      const tts = data.ttsStartTs - data.agentEndTs;
      return formatDuration(sttEstimate + llm + tts);
    }
    if ($currentTurn.active && data.sttEndTs) {
      const llm = data.agentEndTs ? data.agentEndTs - data.sttEndTs : Date.now() - data.sttEndTs;
      const tts = data.ttsStartTs && data.agentEndTs ? data.ttsStartTs - data.agentEndTs : 0;
      return formatDuration(sttEstimate + llm + tts);
    }
    return '—';
  });
</script>

<div class="mt-3 pt-3 border-t border-[#3F3B37]">
  <!-- Waterfall Bars -->
  <div class="space-y-1">
    {#if bars}
      {#each [
        { label: 'STT', bar: bars.stt },
        { label: 'LLM', bar: bars.agent },
        { label: 'TTS', bar: bars.tts },
      ] as row}
        <div class="flex items-center gap-2">
          <div class="w-7 flex-shrink-0 text-[10px] text-[#6B6662]">
            {row.label}
          </div>
          <div class="flex-1 h-3 bg-[#222222] rounded-sm relative overflow-hidden">
            <div
              class="absolute h-full rounded-sm bg-[#5C5652]"
              style="left: {row.bar.style.left}; width: {row.bar.style.width}; opacity: {row.bar.style.opacity}"
            ></div>
          </div>
          <div class="w-12 flex-shrink-0 text-right font-mono text-[10px] text-[#AEA69F]">
            {row.bar.duration}
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-3 text-[#5C5652] text-xs">Start a session to see latency data</div>
    {/if}
  </div>

  <!-- Stats Row -->
  <div class="flex items-center justify-between mt-3 pt-2 border-t border-[#3F3B37] text-[11px]">
    <div class="flex items-center gap-3 text-[#6B6662]">
      <span>Turns: <span class="text-[#AEA69F] font-mono">{$latencyStats.turns}</span></span>
      <span>Avg: <span class="text-[#AEA69F] font-mono">{$computedStats.avg ? formatDuration($computedStats.avg) : '—'}</span></span>
      <span>Min: <span class="text-[#AEA69F] font-mono">{$computedStats.min ? formatDuration($computedStats.min) : '—'}</span></span>
      <span>Max: <span class="text-[#AEA69F] font-mono">{$computedStats.max ? formatDuration($computedStats.max) : '—'}</span></span>
    </div>
    <span class="font-mono text-xs text-[#027645]">{totalLatencyDisplay}</span>
  </div>
</div>
