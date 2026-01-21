<script lang="ts">
  import { session } from '../stores';
</script>

<header class="flex items-center justify-between py-4 border-b border-[#3F3B37]">
  <h1 class="text-sm font-medium text-[#AEA69F]">Voice Pipeline</h1>
  <div class="flex items-center gap-2">
    <span
      class="w-1.5 h-1.5 rounded-full transition-colors {$session.connected
        ? 'bg-[#027645]'
        : 'bg-[#5C5652]'}"
    ></span>
    <span class="text-xs text-[#6B6662]">{$session.connected ? 'Connected' : 'Idle'}</span>
  </div>
</header>
