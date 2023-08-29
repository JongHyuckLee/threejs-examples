import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import React, { useEffect, useRef } from "react";

export const Init = () => {
  return (
    <>
      <OrbitControls />
      <PerspectiveCamera position={[4, 19, 3]} />
    </>
  );
};
