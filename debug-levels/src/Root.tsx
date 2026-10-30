import { Composition } from "remotion";
import { DebugVideo, TOTAL_FRAMES } from "./DebugVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DebugLevels"
      component={DebugVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
