import { Canvas, PerspectiveCameraProps } from "@react-three/fiber";
import Frame3D from "./Frame3D";
import React from "react";
import { PerspectiveCamera } from "@react-three/drei";

const Ocean = () => {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 5, 100], fov: 55, near: 1, far: 20000 }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <PerspectiveCamera position={[0, 0, 5]} />
      <Frame3D />
    </Canvas>
  );
};
export default Ocean;
