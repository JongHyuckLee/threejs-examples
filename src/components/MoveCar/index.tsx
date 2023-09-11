import { Canvas } from "@react-three/fiber";
import Landscape from "./Landscape";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Vector3 } from "three";
const skyBlue = 0xb1e1ff;
const groundColor = 0xb97a20;
const hemiIntensity = 2;

const color = 0xffffff;
const dirIntensity = 2.5;

const MoveCar = () => {
  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <hemisphereLight
        color={skyBlue}
        intensity={hemiIntensity}
        groundColor={groundColor}
      />
      <directionalLight
        color={color}
        intensity={dirIntensity}
        position={new Vector3(5, 10, 2)}
      />

      <PerspectiveCamera
        onUpdate={(c) => c.updateProjectionMatrix()}
        makeDefault={true}
        position={new Vector3(2, 10, 20)}
        fov={45}
        aspect={2}
        near={0.1}
        far={100}
      />
      <Landscape />
    </Canvas>
  );
};

export default MoveCar;
