<script lang="ts">
  import { currentTurn, audioPlaying, session } from '../stores';
  import { formatDuration } from '../utils';

  interface StageState {
    active: boolean;
    ready: boolean;
    complete: boolean;
    time: string;
  }

  // Check if session is connected but no turn has started (ready for speech)
  let isReadyForSpeech = $derived(
    $session.connected && !$currentTurn.sttStartTs && !$currentTurn.sttEndTs
  );

  // STT: estimated ~400ms for turn detection
  let stt = $derived<StageState>({
    active: !!$currentTurn.sttStartTs && !$currentTurn.sttEndTs,
    ready: isReadyForSpeech,
    complete: !!$currentTurn.sttEndTs,
    time: $currentTurn.sttEndTs ? '~400' : $currentTurn.sttStartTs ? '...' : '—',
  });

  // LLM: time from LLM call to LLM output complete
  let agent = $derived<StageState>({
    active: !!$currentTurn.sttEndTs && !$currentTurn.agentEndTs,
    ready: false,
    complete: !!$currentTurn.agentEndTs,
    time: $currentTurn.agentEndTs && $currentTurn.sttEndTs
      ? formatDuration($currentTurn.agentEndTs - $currentTurn.sttEndTs)
      : $currentTurn.sttEndTs ? '...' : '—',
  });

  // TTS: time from LLM done to first audio byte (stays active during playback)
  let tts = $derived<StageState>({
    active: (!!$currentTurn.agentEndTs && !$currentTurn.ttsStartTs) || $audioPlaying,
    ready: false,
    complete: !!$currentTurn.ttsStartTs && !$audioPlaying,
    time: $currentTurn.ttsStartTs && $currentTurn.agentEndTs
      ? formatDuration($currentTurn.ttsStartTs - $currentTurn.agentEndTs)
      : $currentTurn.agentEndTs ? '...' : '—',
  });

  function stageClasses(state: StageState): string {
    let classes = `w-10 h-10 rounded-md flex items-center justify-center
                   bg-[#222222] border border-[#3F3B37] transition-all duration-200`;

    if (state.active) {
      classes += ' border-[#027645] bg-[#027645]/10 animate-pulse-border';
    } else if (state.ready) {
      classes += ' border-[#027645] bg-[#027645]/10 animate-pulse-border';
    } else if (state.complete) {
      classes += ' opacity-50';
    }

    return classes;
  }
</script>

<div class="flex items-center justify-center gap-3 py-4">
  <!-- STT Stage -->
  <div class="flex flex-col items-center gap-1">
    <div class={stageClasses(stt)}>
      <svg class="w-4 h-4 text-[#AEA69F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      </svg>
    </div>
    <div class="text-[10px] text-[#6B6662]">STT</div>
    <div class="font-mono text-[11px] text-[#AEA69F]">{stt.time}</div>
  </div>

  <svg class="w-3 h-3 text-[#3F3B37] -mt-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>

  <!-- LLM Stage -->
  <div class="flex flex-col items-center gap-1">
    <div class={stageClasses(agent)}>
      <svg class="w-4 h-4 text-[#AEA69F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
        <path d="M9 14v2M15 14v2"/>
      </svg>
    </div>
    <div class="text-[10px] text-[#6B6662]">LLM</div>
    <div class="font-mono text-[11px] text-[#AEA69F]">{agent.time}</div>
  </div>

  <svg class="w-3 h-3 text-[#3F3B37] -mt-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>

  <!-- TTS Stage -->
  <div class="flex flex-col items-center gap-1">
    <div class={stageClasses(tts)}>
      <svg class="w-4 h-4 text-[#AEA69F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    </div>
    <div class="text-[10px] text-[#6B6662]">TTS</div>
    <div class="font-mono text-[11px] text-[#AEA69F]">{tts.time}</div>
  </div>
</div>

<style>
  @keyframes pulse-border {
    0%, 100% {
      border-color: #027645;
      box-shadow: 0 0 0 0 rgba(2, 118, 69, 0.4);
    }
    50% {
      border-color: #03a860;
      box-shadow: 0 0 8px 2px rgba(2, 118, 69, 0.3);
    }
  }

  :global(.animate-pulse-border) {
    animation: pulse-border 1.5s ease-in-out infinite;
  }
</style>
