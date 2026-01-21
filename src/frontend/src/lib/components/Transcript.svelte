<script lang="ts">
  import { activities } from '../stores';

  let scrollContainer: HTMLDivElement;

  let transcriptItems = $derived(
    $activities
      .filter((a) => a.type === 'stt' || a.type === 'agent')
      .slice(0, 10)
      .reverse()
  );

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (transcriptItems.length > 0 && scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
</script>

<div class="h-full flex flex-col overflow-hidden">
  <div class="text-[10px] text-[#6B6662] mb-2 flex-shrink-0">Transcript</div>
  <div bind:this={scrollContainer} class="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
    {#if transcriptItems.length === 0}
      <div class="text-[#5C5652] text-xs">No conversation yet</div>
    {:else}
      {#each transcriptItems as item (item.id)}
        <div class="flex gap-2">
          <div class="w-1 rounded-full flex-shrink-0 {item.type === 'stt' ? 'bg-[#5C5652]' : 'bg-[#027645]'}"></div>
          <div class="min-w-0">
            <div class="text-[10px] text-[#6B6662] mb-0.5">{item.type === 'stt' ? 'User' : 'Agent'}</div>
            <div class="text-xs text-[#D6D1CB] break-words">{item.text}</div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
