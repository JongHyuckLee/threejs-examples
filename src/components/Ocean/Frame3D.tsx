import { useMemo, useRef } from "react";
import { extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Sky, OrbitControls } from "@react-three/drei";
import { Water } from "three-stdlib";
import * as THREE from "three";

extend({ Water });
function Ocean() {
  const ref = useRef<any>();
  const gl = useThree((state) => state.gl);
  const waterNormals = useLoader(THREE.TextureLoader, "./waternormals.jpeg");
  // waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  const geom = useMemo(() => new THREE.PlaneGeometry(10000, 10000), []);
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 0,
      fog: false,
      format: (gl as any).encoding,
    }),
    [waterNormals],
  );
  useFrame(
    (state, delta) => (ref.current.material.uniforms.time.value += delta),
  );

  // @ts-ignore
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />;
}
function Frame3D() {
  return (
    <group>
      <OrbitControls />
      <Ocean />
      <Sky sunPosition={[500, 150, -1000]} turbidity={0.1} />
    </group>
  );
}
export default Frame3D;
