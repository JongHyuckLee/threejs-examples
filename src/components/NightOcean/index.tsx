import { Canvas } from "@react-three/fiber";
import Frame3D from "./Frame3D";
import React from "react";

const Ocean = () => {
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 5, 100], fov: 55, near: 1, far: 20000 }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <camera position={[0, 0, 5]} />
      <Frame3D />
    </Canvas>
  );
};
export default Ocean;
