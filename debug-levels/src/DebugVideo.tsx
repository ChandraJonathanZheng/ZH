import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { scene, VO } from "./kit";
import { CTA, Hook, Intro, L1, L2, L3, L4, L5, L6, L7 } from "./Scenes";

const SCENES: Record<string, React.FC> = {
  hook: Hook,
  intro: Intro,
  l1: L1,
  l2: L2,
  l3: L3,
  l4: L4,
  l5: L5,
  l6: L6,
  l7: L7,
  cta: CTA,
};

// Scene lengths come from the voiceover manifest, so the video always
// matches the real audio.
export const TOTAL_FRAMES = VO.reduce((sum, s) => sum + s.frames, 0);

export const DebugVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0E1424" }}>
    <Series>
      {VO.map((s) => {
        const Scene = SCENES[s.id];
        return (
          <Series.Sequence key={s.id} durationInFrames={scene(s.id).frames} name={s.id}>
            <Scene />
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
