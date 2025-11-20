"use client";

import { Lottie, LottieComponentProps } from "lottie-react";

export default function LottiePlayer(props: LottieComponentProps) {
  const animationData =
    typeof props.animationData === "string"
      ? JSON.parse(props.animationData)
      : props.animationData;
  return (
    <Lottie
      {...props}
      animationData={animationData}
      className="w-full h-full"
      loop
      autoplay
    />
  );
}
