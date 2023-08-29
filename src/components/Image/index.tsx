import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  OrbitControls,
  PerspectiveCamera,
  Plane,
  useTexture,
} from "@react-three/drei";
import {
  Canvas,
  CanvasProps,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import {
  DirectionalLight,
  Material,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { Sprite, Stage } from "@pixi/react";
import * as PIXI from "pixi.js";

//
// function ImagePlane() {
//   const texture = useTexture("./images/T_A_rainbow_hair02_box.png");
//   const normalMapTexture = useTexture("./images/T_A_rainbow_hair02_box_N.png"); // 당신의 normal map 이미지
//   console.log(normalMapTexture);
//   return (
//     <Plane args={[5, 5]}>
//       <meshPhongMaterial
//         attach="material"
//         map={texture}
//         normalMap={normalMapTexture}
//         bumpScale={0.05}
//         normalMapType={1}
//         normalScale={new Vector2(1, 1)}
//       />
//     </Plane>
//   );
// }
//
// function Image() {
//   return (
//     <Canvas style={{ width: "100vw", height: "100vh" }}>
//       <OrbitControls />
//       <ambientLight />
//       <pointLight position={[10, 10, 10]} />
//       <ImagePlane />
//     </Canvas>
//   );
// }
//
// export default Image;
function ImagePlane() {
  const material = useRef<MeshStandardMaterial>(null);
  const [map, normalMap] = useLoader(TextureLoader, [
    "./images/pikachu/Pikachu_Color.png",
    "./images/pikachu/Pikachu_Depth.png",
  ]);
  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      console.log("aaaaaaaa");
      if (material.current) {
        material.current.normalScale.x =
          (window.innerWidth / 2 - e.clientX) / 20;
        material.current.normalScale.y =
          (window.innerHeight / 2 - e.clientY) / 20;
        console.log(material.current.normalScale);
      }
    });
  }, []);
  return (
    <>
      <mesh>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial
          ref={material}
          map={map}
          normalMap={normalMap}
          roughness={0.6}
          displacementScale={0.4}
        />
      </mesh>
    </>
  );
}

function ImagePerson() {
  const meshRef = useRef<MeshStandardMaterial>(null);
  const [map, normalMap] = useLoader(TextureLoader, [
    "./images/human/diffusion1.png",
    "./images/human/depth1.png",
  ]);
  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      console.log("aaaaaaaa");
      if (meshRef.current) {
        meshRef.current.normalScale.x =
          (window.innerWidth / 2 - e.clientX) / 20;
        meshRef.current.normalScale.y =
          (window.innerHeight / 2 - e.clientY) / 20;
        console.log(meshRef.current.normalScale);
      }
    });
  }, []);
  return (
    <>
      <mesh position={new Vector3(0, 0, 0)}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial
          color={0xffffff}
          ref={meshRef}
          map={map}
          normalMap={normalMap}
          roughness={0.3}
          normalScale={new Vector2(0.4, 0.4)}
        />
      </mesh>
    </>
  );
}
function ImageCto() {
  const { gl, scene, camera, raycaster } = useThree();
  const materialRef = useRef<MeshStandardMaterial>(null);
  const meshRef = useRef<Mesh>(null);
  const geoRef = useRef<PlaneGeometry>(null);
  const [map, normalMap] = useLoader(TextureLoader, [
    "./images/cto/T_Sir.png",
    "./images/cto/T_Sir_depth_edit.png",
  ]);

  useEffect(() => {
    const image = new Image();
    image.src = "./images/cto/T_Sir.png";
    image.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      let context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, image.width, image.height);

      let imageData = context?.getImageData(0, 0, image.width, image.height)
        .data;

      let geometry = new THREE.PlaneGeometry(
        image.width,
        image.height,
        image.width,
        image.height,
      );
      console.log(geometry.attributes.position.array);
      const positions = geometry.attributes.position.array;
      console.log(positions.length, imageData?.length);
      if (imageData && imageData.length) {
        console.log(imageData);
        for (let i = 0, j = 0; i < positions?.length; i += 1, j++) {
          let brightness = imageData[i] / 255.0;

          positions[j * 3 + 2] = brightness * 0.2;
        }
      }
      let material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map,
      });
      let mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    };
  }, []);
  useFrame(() => {
    gl.render(scene, camera);
  });
  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      if (materialRef.current) {
        const material = materialRef.current;
        material.normalScale.x = (window.innerWidth / 2 - e.clientX) / 20;
        material.normalScale.y = (window.innerHeight / 2 - e.clientY) / 20;
        materialRef.current.needsUpdate = true;
      }

      normalMap.image.style.zoom = 10;
      normalMap.needsUpdate = true;

      console.dir(normalMap.image);
    });
  }, [normalMap.image]);

  return (
    <>
      {/*<mesh position={new Vector3(0, 0, 0)} ref={meshRef}>*/}
      {/*  <planeGeometry ref={geoRef} />*/}
      {/*  <meshStandardMaterial*/}
      {/*    color={0xffffff}*/}
      {/*    ref={materialRef}*/}
      {/*    map={map}*/}
      {/*    normalMap={normalMap}*/}
      {/*    roughness={1.3}*/}
      {/*    displacementScale={2}*/}
      {/*    normalScale={new Vector2(0.6, 0.6)}*/}
      {/*  />*/}
      {/*</mesh>*/}
    </>
  );
}

export default function ImageComponent() {
  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <OrbitControls />
      <PerspectiveCamera position={[4, 15, 3]} />
      <directionalLight
        color="0xffffff"
        intensity={5}
        position={new Vector3(0, 6, 6)}
      />
      <ambientLight
        color="0xffffff"
        intensity={1}
        position={new Vector3(0, 3, 0)}
      />
      <ImageCto />
      {/*<ImagePerson />*/}
      {/*<axesHelper scale={new Vector3(10, 10, 10)} />*/}
    </Canvas>
  );
}
const opts = {
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: false,
  antialias: true,
  resolution: window.devicePixelRatio,
};
// export default function Image2() {
//   const canvas = useRef<HTMLCanvasElement>(null);
//
//   useEffect(() => {
//     const selector = document.querySelector("#image");
//     const app = new PIXI.Application({
//       width: window.innerWidth,
//       height: window.innerHeight,
//     });
//     selector?.appendChild(app?.view as never as Node);
//
//     const img = PIXI.Sprite.from("./images/pikachu/Pikachu_Color.png");
//     img.width = window.innerWidth;
//     img.height = window.innerHeight;
//     app.stage.addChild(img);
//
//     const depthMap = PIXI.Sprite.from("./images/pikachu/Pikachu_Depth.png");
//     app.stage.addChild(depthMap);
//
//     const displacementFilter = new PIXI.filters.DisplacementFilter(depthMap);
//     app.stage.filters = [displacementFilter];
//     console.log(app);
//     window.addEventListener("mousemove", function (e) {
//       img.setTransform(
//         (window.innerWidth / 2 - e.offsetX) / 10,
//         (window.innerHeight / 2 - e.clientY) / 10,
//         1,
//         1,
//       );
//     });
//   }, []);
//   return <div id={"image"} />;
// }
