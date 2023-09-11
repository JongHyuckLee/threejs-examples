import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls } from "@react-three/drei";
import Experience from "../Experience";

export const Controls = {
  forward: "forward",
  back: "back",
  left: "left",
  right: "right",
  jump: "jump",
  start: "start",
};

const AppRapierPhysics = () => {
  const map = useMemo(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
      { name: Controls.start, keys: ["Enter"] },
    ],
    [],
  );

  return (
    <KeyboardControls map={map}>
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        shadows
        camera={{ position: [3, 10, 10], fov: 60 }}
      >
        <color attach="background" args={["#ececec"]} />
        <Suspense>
          <Physics debug>
            <Experience />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
};
export default AppRapierPhysics;
