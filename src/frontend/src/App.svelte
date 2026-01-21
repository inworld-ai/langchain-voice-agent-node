<script lang="ts">
  import { Header, Controls, PipelineCard, Transcript } from './lib/components';
  import { createVoiceSession } from './lib/websocket';

  const voiceSession = createVoiceSession();
</script>

<div class="h-screen flex flex-col max-w-md mx-auto px-6 overflow-hidden">
  <Header />
  <PipelineCard />
  <div class="flex-1 min-h-0 py-3 overflow-hidden">
    <Transcript />
  </div>
  <Controls onStart={() => voiceSession.start()} onStop={() => voiceSession.stop()} />
</div>
