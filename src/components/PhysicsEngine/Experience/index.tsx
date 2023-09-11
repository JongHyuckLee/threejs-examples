import {
  Box,
  Capsule,
  OrbitControls,
  Sphere,
  Torus,
  useAnimations,
  useGLTF,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CapsuleCollider,
  ConeCollider,
  CuboidCollider,
  CylinderCollider,
  quat,
  RigidBody,
  RigidBodyOptions,
} from "@react-three/rapier";
import React, { Ref, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Controls } from "../AppRapierPhysics";
import { RigidBody as RigidBodyType } from "@dimforge/rapier3d-compat/dynamics/rigid_body";
import {
  Face,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  Vector2,
  Vector3,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import gsap from "gsap";

const material = new MeshPhysicalMaterial({
  alphaTest: 1,
  opacity: 0,
  wireframe: false,
});
const Experience = () => {
  const { scene, gl, controls, camera, raycaster } = useThree();
  const [hover, setHover] = useState(false);
  const cube = useRef<RigidBodyType>(null);
  const colliderRef = useRef<any>();
  const [start, setStart] = useState(false);
  const kicker = useRef<RigidBodyType>(null);
  const character = useGLTF("./glbs/T_Pose.glb");
  const idle = useGLTF("./glbs/idle_skel.glb");
  const walking = useGLTF("./glbs/walking_looping_skel.glb");
  const groundMesh = useRef<Mesh>(null);
  const { ref, actions, names, mixer } = useAnimations([
    ...idle.animations,
    ...walking.animations,
  ]);
  const destinationPoint = new THREE.Vector3();
  const jump = () => {
    if (isOnFloor.current) {
      console.log("cwcwwcwccwcwwcwc");
      cube.current?.applyImpulse({ x: 0, y: 100, z: 0 }, false);
    }
  };
  const startPressed = useKeyboardControls((state) => {
    return state[Controls.start];
  });
  const jumpPressed = useKeyboardControls((state) => {
    return state[Controls.jump];
  });
  // const leftPressed = useKeyboardControls((state) => state[Controls.left]);
  // const rightPressed = useKeyboardControls((state) => state[Controls.right]);
  // const backPressed = useKeyboardControls((state) => state[Controls.back]);
  // const forwardPressed = useKeyboardControls(
  //   (state) => state[Controls.forward],
  // );

  // const handleMovement = () => {
  //   if (!isOnFloor.current) {
  //     return;
  //   }
  //
  //   if (rightPressed) {
  //     cube.current?.applyImpulse({ x: 0.000008, y: 0, z: 0 }, false);
  //   }
  //   if (leftPressed) {
  //     cube.current?.applyImpulse({ x: -0.000008, y: 0, z: 0 }, false);
  //   }
  //   if (backPressed) {
  //     cube.current?.applyImpulse({ x: 0, y: 0, z: 0.000008 }, false);
  //   }
  //   if (forwardPressed) {
  //     cube.current?.applyImpulse({ x: 0, y: 0, z: -0.000008 }, false);
  //   }
  // };

  const speed = useRef(5);

  useFrame((_state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    if (jumpPressed) {
      jump();
    }
    if (startPressed) {
      setStart(true);
    }
    // handleMovement();

    if (!start) {
      return;
    }
    const curRotation = quat(kicker.current?.rotation());
    const incrementRotation = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      delta * 3,
    );
    curRotation.multiply(incrementRotation);
    kicker.current?.setNextKinematicRotation(curRotation);

    speed.current += delta;
  });

  useEffect(() => {
    actions[names[1]]?.reset().fadeIn(0).play();

    return () => {
      actions[names[1]]?.reset().fadeOut(0);
    };
  }, []);

  const isOnFloor = useRef(true);

  useEffect(() => {
    const mousedown = (e: MouseEvent) => {
      if (!isOnFloor.current) {
        return;
      }

      // actions[names[0]]?.reset().fadeOut(0);
      // actions[names[1]]?.reset().fadeIn(0).play();
      const mouse = new Vector2();

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      let intersects = raycaster.intersectObject(
        groundMesh.current as Object3D,
      );

      if (intersects.length) {
        const point = intersects[0].point;
        destinationPoint.x = point.x;
        destinationPoint.z = point.z;

        const currentPos = character.scene.position;

        const targetRotation = Math.atan2(
          destinationPoint.x - currentPos.x,
          destinationPoint.z - currentPos.z,
        );
        gsap.to(character.scene.rotation, {
          duration: 0.5,
          y: targetRotation,
        });

        // gsap.to(character.scene.position, {
        //   duration: 1,
        //   x: point.x,
        //   z: point.z,
        //   onUpdate: () => {
        //     colliderRef.current?.setTranslation(
        //       new Vector3(
        //         character.scene.position.x,
        //         1,
        //         character.scene.position.z,
        //       ),
        //       true,
        //     );
        //   },
        // });

        console.dir(colliderRef.current);
        // colliderRef.current.setTranslation(new Vector3(5, 5, 5), true);
        // console.log(colliderRef.current);
        //
        // cube.current?.setTranslation(new Vector3(5, 5, 5), true);
        cube.current?.setTranslation(new Vector3(point.x, 0.5, point.z), true);
      }
    };

    window.addEventListener("mousedown", mousedown);

    return () => {
      window.removeEventListener("mousedown", mousedown);
    };
  }, [
    actions,
    camera,
    character.scene.position,
    character.scene.rotation,
    destinationPoint,
    names,
    raycaster,
  ]);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 0.000001, 0]} intensity={1} />
      <OrbitControls />
      {/*<RigidBody position={[2, 5, 1]} colliders={"hull"}>*/}
      {/*  <Torus />*/}
      {/*</RigidBody>*/}

      {/*<Box material={material} args={[1, 0.01, 1]} />*/}
      {/*<mesh*/}
      {/*  position={[0, 0, 0]}*/}
      {/*  onPointerEnter={() => setHover(true)}*/}
      {/*  onPointerLeave={() => setHover(false)}*/}
      {/*>*/}
      {/*  <boxGeometry args={[1, 0, 1]} />*/}
      {/*  <meshBasicMaterial color={hover ? "hotpink" : "royalblue"} />*/}
      {/*</mesh>*/}
      {/*<group position={[-1.5, 0, 0]}>*/}
      {/*  <primitive*/}
      {/*    ref={ref}*/}
      {/*    object={character.scene}*/}
      {/*    onPointerEnter={() => setHover(true)}*/}
      {/*    onPointerLeave={() => setHover(false)}*/}
      {/*  />*/}
      {/*</group>*/}

      {/*<primitive*/}
      {/*  onPointerEnter={() => setHover(true)}*/}
      {/*  onPointerLeave={() => setHover(false)}*/}
      {/*  onClick={() => setStart(true)}*/}
      {/*  object={character.scene}*/}
      {/*/>*/}
      <RigidBody
        position={[-1.5, 0.5, 0]}
        onCollisionEnter={() => (isOnFloor.current = true)}
        onCollisionExit={() => (isOnFloor.current = false)}
      >
        <primitive ref={ref} object={character.scene} />
      </RigidBody>

      <RigidBody
        type="kinematicPosition"
        position={[0, 0.75, 0]}
        args={[0.1, 0.1, 0.1, 0.1]}
        ref={kicker}
      >
        <group position={[2.5, 0, 0]}>
          <Box args={[5, 0.5, 0.5]}>
            <meshStandardMaterial color="peachpuff" />
          </Box>
        </group>
        <CapsuleCollider
          density={100}
          position={[2.5, 0, 0]}
          args={[2.5, 0.6]}
          rotation={new THREE.Euler(0, 0, Math.PI / 2)}
        />
      </RigidBody>
      <RigidBody restitution={1} type="fixed" name="floor" shape={"cuboid"}>
        <Box ref={groundMesh} position={[0, 0, 0]} args={[10, 1, 10]}>
          <meshStandardMaterial color="springgreen" />
        </Box>
      </RigidBody>
    </>
  );
};
export default Experience;
