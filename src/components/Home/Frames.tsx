import * as THREE from "three";
import React, { useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import Frame from "./Frame";
import { GOLDENRATIO } from "../App";

const Frames = ({
  images,
  q = new THREE.Quaternion(),
  p = new THREE.Vector3(),
}: any) => {
  const ref = useRef<any>();
  const clicked = useRef<any>();
  const [, params] = useRoute("/item/:id");
  const [, setLocation] = useLocation();
  useEffect(() => {
    clicked.current = ref.current.getObjectByName(params?.id);
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true);
      clicked.current.parent.localToWorld(p.set(0, GOLDENRATIO / 2, 1.4));
      clicked.current.parent.getWorldQuaternion(q);
    } else {
      p.set(0, 0, 8);
      q.identity();
    }
  }, [p, params?.id, q]);

  useFrame((state, dt) => {
    if (params) {
      easing.damp3(state.camera.position, p, 0.4, dt);
      easing.dampQ(state.camera.quaternion, q, 0.4, dt);
    }
  });

  return (
    <group
      ref={ref}
      onClick={(e) => (
        e.stopPropagation(),
        setLocation(
          clicked.current === e.object ? "/" : "/item/" + e.object.name,
        )
      )}
      onPointerMissed={() => setLocation("/")}
    >
      {images.map((props: any) => (
        <Frame key={props.url} {...props} />
      ))}
    </group>
  );
};
export default Frames;
