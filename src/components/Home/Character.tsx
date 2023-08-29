import { useAnimations, useGLTF } from "@react-three/drei";
import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
const Character = () => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const nextPosition = useRef<any>();
  const character = useGLTF("./glbs/T_Pose.glb");
  const walking = useGLTF("./glbs/walking_looping_skel.glb");
  const idle = useGLTF("./glbs/idle_skel.glb");

  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  const { ref, actions, names, mixer } = useAnimations([
    ...walking.animations,
    ...idle.animations,
  ]);
  useFrame((_, dt) => {
    const offset = new THREE.Vector3(0, 3, 5); // 이 벡터는 카메라의 원하는 오프셋을 나타냅니다.
    const desiredPosition = character.scene.position.clone().add(offset);
    camera.position.lerp(desiredPosition, 0.05);
    camera.lookAt(character.scene.position);

    if (mixer) {
      mixer.update(dt);
    }
    if (nextPosition.current) {
      TWEEN.update();
    }
  });
  const onMouseClick = (event: any) => {
    actions[names[1]]?.reset().fadeOut(0);
    actions[names[0]]?.reset().fadeIn(0).play();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      nextPosition.current = intersect.point;
      const position = nextPosition.current;
      position.set(position.x, -0.5, position.z);
      const currentPos = character.scene.position;
      const targetRotation = Math.atan2(
        intersect.point.x - currentPos.x,
        intersect.point.z - currentPos.z,
      );

      character.scene.rotation.y = targetRotation;
      new TWEEN.Tween(character.scene.position)
        .to(position, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    }
    setTimeout(() => {
      actions[names[0]]?.reset().fadeOut(0);
      actions[names[1]]?.reset().fadeIn(0).play();
    }, 1600);
  };

  useEffect(() => {
    actions[names[1]]?.reset().fadeIn(0).play();

    return () => {
      actions[names[1]]?.reset().fadeOut(0);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("click", onMouseClick, false);
  }, []);

  return (
    <group>
      <ambientLight intensity={-3} />
      {character && (
        <primitive
          fog={false}
          ref={ref}
          side={THREE.DoubleSide}
          style={{ cursor: "pointer" }}
          object={character.scene}
          position={[0, -0.5, 4]}
          envMapIntensity={2}
        />
      )}
    </group>
  );
};
export default Character;
