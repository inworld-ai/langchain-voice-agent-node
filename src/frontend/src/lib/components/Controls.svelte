<script lang="ts">
  import { session } from '../stores';

  interface Props {
    onStart: () => void;
    onStop: () => void;
  }

  let { onStart, onStop }: Props = $props();
</script>

<footer class="py-4">
  <button
    onclick={$session.connected ? onStop : onStart}
    class="w-full py-2.5 px-4 text-sm rounded-md transition-colors cursor-pointer
           {$session.connected
             ? 'bg-[#3F3B37] text-[#AEA69F] border border-[#5C5652] hover:bg-[#5C5652]'
             : 'bg-[#027645] text-[#E9E5E0] border border-[#027645] hover:bg-[#016630]'}"
  >
    {$session.connected ? 'End Session' : 'Start Session'}
  </button>
</footer>
