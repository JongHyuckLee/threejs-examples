import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useRoute } from "wouter";
import Character from "./Character";
import Ground from "./Ground";
import { IMAGES, MODELS } from "../../constants";
import Frames from "./Frames";
import Frame3D from "../Ocean/Frame3D";
import Frame from "./Frame";

export const GOLDENRATIO = 1.61803398875;

const Home = () => {
  const [, params] = useRoute("/item/:id");

  useEffect(() => {
    useGLTF.preload(MODELS);
  }, []);
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ fov: 70, far: 1000, position: [0, 4, 15] }}
    >
      <directionalLight
        position={[-5, 5, 5]}
        castShadow
        shadow-mapSize={1024}
        intensity={9}
      />
      {!params && <OrbitControls />}
      {!params && <Character />}
      <color attach="background" args={["#191920"]} />
      <fog attach="fog" args={["#191920", 0, 15]} />

      <group position={[0, -0.5, 0]}>
        <Frames images={IMAGES} />
        <group>
          <Frame
            url={"./images/T_A_rainbow_hair02_box.png"}
            position={[0, 0, 1.5]}
            rotation={[0, 0, 0]}
          />
        </group>
        <Ground />
      </group>
      <Environment preset="city" />
    </Canvas>
  );
};
export default Home;
