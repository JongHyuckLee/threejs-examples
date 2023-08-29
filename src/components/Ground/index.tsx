import {
  Canvas,
  PerspectiveCameraProps,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  BvhProps,
  OrbitControls,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  MeshBVHVisualizer,
} from "three-mesh-bvh";
import {
  BufferAttribute,
  Face,
  IcosahedronGeometry,
  LineBasicMaterial,
  Material,
  Mesh,
  Object3D,
  PlaneGeometry,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

const params = {
  matcap: "Clay",

  size: 0.1,
  brush: "clay",
  intensity: 50,
  maxSteps: 10,
  invert: false,
  symmetrical: true,
  flatShading: false,

  depth: 10,
  displayHelper: false,
};

const Plane = () => {
  let pointsMaterial = new THREE.PointsMaterial({
    color: 0xff0000,
    size: 0.1,
  });

  let points: Array<Vector3> = [];
  let groundGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
  const isPressed = useRef(false);
  const mouse = new THREE.Vector2();
  const destinationPoint = new THREE.Vector3();
  const { scene, gl, controls, camera, raycaster } = useThree();
  const [map, normalMap] = useLoader(TextureLoader, [
    "./images/human/diffusion1.png",
    "./images/human/depth1.png",
  ]);

  let pointsGeometry = new THREE.BufferGeometry();
  // Add Points to scene
  let pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);

  scene.add(pointsMesh);
  const setMouse = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  const brush = useMemo(() => {
    const brushSegments = [new THREE.Vector3(), new THREE.Vector3(0, 0, 1)];
    for (let i = 0; i < 1000; i++) {
      const nexti = i + 1;
      const x1 = Math.sin((2 * Math.PI * i) / 1000);
      const y1 = Math.cos((2 * Math.PI * i) / 1000);

      const x2 = Math.sin((2 * Math.PI * nexti) / 1000);
      const y2 = Math.cos((2 * Math.PI * nexti) / 1000);

      brushSegments.push(
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0),
      );
    }

    const brush = new THREE.LineSegments();
    const material = brush.material as LineBasicMaterial;
    brush.geometry.setFromPoints(brushSegments);
    material.color.set(0xfb8c00);
    brush.rotation.x = -Math.PI / 2;
    brush.position.y = 0.3;
    return brush;
  }, []);
  const raycasting = () => {
    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObject(
      targetMesh.current as never as Object3D<Event>,
    );
    if (intersect.length) {
      const point = intersect[0].point;
      destinationPoint.x = point.x;
      destinationPoint.y = 0.1;
      destinationPoint.z = point.z;
      brush.position.x = destinationPoint.x;
      brush.position.z = destinationPoint.z;
    }

    if (isPressed.current) {
      points.push(
        new Vector3(destinationPoint.x, destinationPoint.y, destinationPoint.z),
      );
    }
  };

  useFrame(() => {
    raycasting();
    gl.render(scene, camera);
  });

  const targetMesh = useRef<Mesh>();
  const bvhHelper = useRef<MeshBVHVisualizer>();
  const standardMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.4,
    });
  }, []);

  const reset = () => {
    // if (targetMesh.current) {
    //   const mesh = targetMesh.current as Mesh;
    //   mesh.geometry.dispose();
    //   (mesh.material as Material).dispose();
    //   scene.remove(mesh);
    // }

    groundGeometry.deleteAttribute("uv");
    groundGeometry = BufferGeometryUtils.mergeVertices(
      groundGeometry,
    ) as PlaneGeometry;
    (groundGeometry.attributes.position as BufferAttribute).setUsage(
      THREE.DynamicDrawUsage,
    );
    (groundGeometry.attributes.normal as BufferAttribute).setUsage(
      THREE.DynamicDrawUsage,
    );
    targetMesh.current = new THREE.Mesh(groundGeometry, standardMaterial);
    targetMesh.current?.rotation.set(Math.PI / 2, 0, 0);
    targetMesh.current.frustumCulled = false;
    scene.add(targetMesh.current);

    if (!bvhHelper.current) {
      bvhHelper.current = new MeshBVHVisualizer(
        targetMesh.current,
        params.depth,
      );

      if (params.displayHelper) {
        scene.add(bvhHelper.current);
      }
    }
    bvhHelper.current?.update();
  };

  const init = () => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.setClearColor(0x060609, 1);
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.domElement.style.touchAction = "none";

    scene.fog = new THREE.Fog(0xffffff, 0.5);
    scene.add(brush);

    const material = new THREE.LineBasicMaterial({
      color: 0x000000,
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    line.position.y = 0.3;
    scene.add(line);
  };

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const mousedown = (e: MouseEvent) => {
      isPressed.current = true;
      setMouse(e);
    };
    window.addEventListener("mousedown", mousedown);

    return () => {
      window.removeEventListener("mousedown", mousedown);
    };
  }, [mouse, setMouse]);
  //
  useEffect(() => {
    const mouseup = (e: MouseEvent) => {
      isPressed.current = false;
    };
    window.addEventListener("mouseup", mouseup);

    return () => {
      window.removeEventListener("mouseup", mouseup);
    };
  }, []);

  useEffect(() => {}, []);

  useEffect(() => {
    const mousemove = (e: MouseEvent) => {
      const mouse = new Vector2();
      if (isPressed.current) {
        setMouse(e);

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObject(
          targetMesh.current as Object3D,
        );
        if (intersects.length > 0) {
          let { face } = intersects[0];

          let vertices = groundGeometry.attributes.position.array;
          console.log(face);
          // Move the vertex at the intersected index along the normal.
          ["a", "b", "c"].forEach((index) => {
            if (face) {
              vertices[(face[index as keyof Face] as number) * 3 + 2] = 1;
            }
          });
          groundGeometry.attributes.position.needsUpdate = true;
          groundGeometry.computeVertexNormals();

          // groundGeometry.normalsNeedUpdate = true;
        }
        //
        // const path = new THREE.CatmullRomCurve3(
        //   points.length > 2
        //     ? points
        //     : [
        //         new THREE.Vector3(0, 0, 0),
        //         new THREE.Vector3(0, 0, 0),
        //         new THREE.Vector3(0, 0, 0),
        //       ],
        // );
        //
        // const tubeGeometry = new THREE.TubeGeometry(path, 50, 1, 20, false);
        // const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x747474 });
        // const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        //
        // scene.add(tubeMesh);

        // scene.add(tubeMesh);
        // if (pointsGeometry) {
        //   pointsGeometry.setAttribute(
        //     "position",
        //     new THREE.Float32BufferAttribute(points, 3),
        //   );
        //   pointsGeometry.attributes.position.needsUpdate = true;
        // }
      } else {
        points = [];
      }
    };

    window.addEventListener("mousemove", mousemove);

    return () => {
      window.removeEventListener("mousemove", mousemove);
    };
  }, [isPressed, points]);

  return (
    <>
      {/*<mesh rotation={[Math.PI / 2, 0, 0]} material={standardMaterial}>*/}
      {/*  <planeGeometry args={[100, 100]} />*/}
      {/*</mesh>*/}

      {/*<primitive object={brush} />*/}
    </>
  );
};

const Ground = () => {
  const { scene, gl, controls, camera } = useThree();

  return (
    <>
      <pointLight color={0xffffff} position={[0, 10, 3]} intensity={0.4} />
      <directionalLight color={0xffffff} position={[1, 1, 1]} intensity={0.5} />
      <ambientLight color={0xffffff} intensity={0.4} />
      <fog color={0x263238 / 2} near={20} far={60} />
      <Plane />
    </>
  );
};
const WithCanvas = () => {
  const cameraRef = useRef<PerspectiveCameraProps>();

  useEffect(() => {
    cameraRef?.current?.lookAt?.(0, 0, 0);

    console.log(cameraRef.current);
  }, []);

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 30, 70], fov: 55, near: 1, far: 1000 }}
    >
      <PerspectiveCamera
        near={1}
        far={100}
        fov={70}
        position={[0, 5, 3]}
        ref={cameraRef}
      />
      {/*<OrbitControls />*/}
      <Ground />
    </Canvas>
  );
};

export default WithCanvas;
