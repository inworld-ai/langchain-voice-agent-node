import { writable } from "svelte/store";

export type VoiceId = "Clive" | "Hana" | "Blake" | "Olivia" | "Mark";

export const VOICE_OPTIONS: Array<{ id: VoiceId; label: string }> = [
  { id: "Clive", label: "Clive" },
  { id: "Hana", label: "Hana" },
  { id: "Blake", label: "Blake" },
  { id: "Olivia", label: "Olivia" },
  { id: "Mark", label: "Mark" },
];

export const selectedVoice = writable<VoiceId>("Clive");
