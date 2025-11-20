"use client";

import Lottie, { LottieComponentProps } from "lottie-react";

export default function LottiePlayer(props: LottieComponentProps) {
  const animationData =
    typeof props.src === "string"
      ? props.src
      : props.animationData;
  return (
    <Lottie
      {...props}
      animationData={typeof animationData === 'string' ? undefined : animationData}
      path={typeof animationData === 'string' ? animationData : undefined}
      className="w-full h-full"
      loop
      autoplay
    />
  );
}
