import { useMemo, useRef } from "react";
import { extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Sky, Stars, OrbitControls } from "@react-three/drei";
import { Water } from "three-stdlib";
import * as THREE from "three";

extend({ Water });
function Ocean() {
  const ref = useRef<any>();
  const gl = useThree((state) => state.gl);
  const waterNormals = useLoader(THREE.TextureLoader, "./waternormals2.jpeg");
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
      distortionScale: 3.7,
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
  const theta = Math.PI * (0.49 - 0.5); // 저녁 시간에 해당하는 각도
  const phi = 2 * Math.PI * (0.75 - 0.5); // 시간에 따른 위치 변화, 저녁을 나타내기 위해 조정
  const ref = useRef<any>();
  const { viewport, size } = useThree();

  return (
    <group>
      <Ocean />
      <Stars radius={1000} count={1000} />
      <OrbitControls />
      <Sky distance={1000} sunPosition={[0, 0, 0]} turbidity={0} />
    </group>
  );
}
export default Frame3D;
