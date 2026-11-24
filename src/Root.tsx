import { Composition } from 'remotion';
import { LrsHudReel } from './LrsHudReel';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="LrsHudReel"
        component={LrsHudReel}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
