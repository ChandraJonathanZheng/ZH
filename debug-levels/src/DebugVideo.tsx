import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Series, staticFile } from "remotion";
import { VO } from "./kit";
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

const startOf = (id: string) => {
  let f = 0;
  for (const s of VO) {
    if (s.id === id) return f;
    f += s.frames;
  }
  throw new Error(`No scene ${id}`);
};

// Quiet music bed. It cuts out for Level 7 (silence is the punchline)
// and comes back softly for the CTA.
const MUSIC = 0.07;
const musicVolume = (f: number) => {
  const l7 = startOf("l7");
  const cta = startOf("cta");
  const v = f < l7 ? MUSIC : f < cta ? 0 : interpolate(f, [cta, cta + 10], [0, MUSIC], { extrapolateRight: "clamp" });
  return interpolate(f, [TOTAL_FRAMES - 15, TOTAL_FRAMES], [v, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

export const DebugVideo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0E1424" }}>
    <Series>
      {VO.map((s) => {
        const Scene = SCENES[s.id];
        return (
          <Series.Sequence key={s.id} durationInFrames={s.frames} name={s.id}>
            <Scene />
          </Series.Sequence>
        );
      })}
    </Series>
    <Audio src={staticFile("sfx/music.mp3")} loop volume={musicVolume} />
  </AbsoluteFill>
);
