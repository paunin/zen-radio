import { useState, useCallback } from "react";
import { useRadio } from "~/context/RadioContext";
import { PlayPauseButton } from "./PlayPauseButton";
import { StopButton } from "./StopButton";
import { VolumeButton, VolumePanel } from "./VolumeControl";
import { NowPlaying } from "~/components/NowPlaying/NowPlaying";

export function TransportControls() {
  const { state, actions } = useRadio();
  const hasStation = state.currentStation !== null;
  const [volumeOpen, setVolumeOpen] = useState(false);

  const toggleVolume = useCallback(() => setVolumeOpen((v) => !v), []);
  const closeVolume = useCallback(() => setVolumeOpen(false), []);

  return (
    <div className="flex flex-col">
      {/* Volume slide-up panel */}
      <VolumePanel
        volume={state.volume}
        isOpen={volumeOpen}
        onChange={actions.setVolume}
        onClose={closeVolume}
      />

      {/* Main transport row */}
      <div className="flex items-center gap-3 py-3 px-4">
        {/* Now playing info */}
        <div className="flex-1 min-w-0">
          <NowPlaying />
        </div>

        {/* Buttons: volume, play/pause, stop */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <VolumeButton
            volume={state.volume}
            isOpen={volumeOpen}
            onToggle={toggleVolume}
          />
          <PlayPauseButton
            isPlaying={state.isPlaying}
            isPaused={state.isPaused}
            isBuffering={state.isBuffering}
            onClick={actions.togglePlayPause}
          />
          <StopButton onClick={actions.stop} disabled={!hasStation} />
        </div>
      </div>
    </div>
  );
}
