<script lang="ts">
  import { session, selectedVoice, VOICE_OPTIONS } from '../stores';

  interface Props {
    onStart: () => void;
    onStop: () => void;
  }

  let { onStart, onStop }: Props = $props();
</script>

<footer class="py-4">
  <div class="flex gap-3">
    <select
      bind:value={$selectedVoice}
      disabled={$session.connected}
      class="py-2.5 px-3 text-sm rounded-md transition-colors cursor-pointer
             bg-[#3F3B37] text-[#E9E5E0] border border-[#5C5652]
             disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#each VOICE_OPTIONS as voice}
        <option value={voice.id}>{voice.label}</option>
      {/each}
    </select>
    <button
      onclick={$session.connected ? onStop : onStart}
      class="flex-1 py-2.5 px-4 text-sm rounded-md transition-colors cursor-pointer
             {$session.connected
               ? 'bg-[#3F3B37] text-[#AEA69F] border border-[#5C5652] hover:bg-[#5C5652]'
               : 'bg-[#027645] text-[#E9E5E0] border border-[#027645] hover:bg-[#016630]'}"
    >
      {$session.connected ? 'End Session' : 'Start Session'}
    </button>
  </div>
</footer>
