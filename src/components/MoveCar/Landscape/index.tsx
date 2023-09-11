import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls as Controls } from "three/examples/jsm/controls/OrbitControls";
import {
  Line,
  OrbitControls,
  Plane,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  AxesHelper,
  Camera,
  Object3D,
  PerspectiveCamera,
  Texture,
  Vector3,
} from "three";
import { CONTROL_POINTS } from "../constants";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2";
import { Line2 } from "three/examples/jsm/lines/Line2";
const planeSize = 40;
const Landscape = () => {
  const curveObjRef = useRef<Line2 | LineSegments2>(null);
  const carPosition = new THREE.Vector3();
  const carTarget = new THREE.Vector3();
  const cars: Object3D[] = useMemo(() => [], []);
  const { scene, camera, gl, clock } = useThree();
  const texture = useTexture("/images/move-car/checker.png", (texture) => {
    const singleTexture = texture as Texture;
    singleTexture.wrapS = THREE.RepeatWrapping;
    singleTexture.wrapT = THREE.RepeatWrapping;
    singleTexture.magFilter = THREE.NearestFilter;
    singleTexture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    singleTexture.repeat.set(repeats, repeats);
  });
  const root = useGLTF(
    "/images/move-car/cartoon_lowpoly_small_city_free_pack.glb",
  ).scene;
  const loadedCars = root.getObjectByName("Cars");
  const controls = useMemo(
    () => new Controls(camera, gl.domElement),
    [camera, gl.domElement],
  );

  const curve = useMemo(() => {
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    return new THREE.CatmullRomCurve3(
      CONTROL_POINTS.map((p, ndx) => {
        const p1Points = CONTROL_POINTS[(ndx + 1) % CONTROL_POINTS.length] as [
          number,
          number,
          number,
        ];
        p0.set(...(p as [number, number, number]));
        p1.set(...p1Points);
        return [
          new THREE.Vector3().copy(p0),
          new THREE.Vector3().lerpVectors(p0, p1, 0.1),
          new THREE.Vector3().lerpVectors(p0, p1, 0.9),
        ];
      }).flat(),
    );
  }, []);

  function frameArea(
    sizeToFitOnScreen: number,
    boxSize: number,
    boxCenter: Vector3,
    camera: Camera,
  ) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen;
    const halfFovY = THREE.MathUtils.degToRad(
      (camera as PerspectiveCamera).fov * 0.5,
    );
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    (camera as PerspectiveCamera).position.copy(
      direction.multiplyScalar(distance).add(boxCenter),
    );

    (camera as PerspectiveCamera).near = boxSize / 100;
    (camera as PerspectiveCamera).far = boxSize * 100;

    (camera as PerspectiveCamera).updateProjectionMatrix();
    (camera as PerspectiveCamera).lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  const resizeRenderToDisplaySize = () => {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      gl.setSize(width, height, false);
    }
    return needResize;
  };

  useEffect(() => {
    const fixes = [
      { prefix: "Car_08", y: 0, rot: [Math.PI * 0.5, 0, Math.PI * 0.5] },
      { prefix: "CAR_03", y: 33, rot: [0, Math.PI, 0] },
      { prefix: "Car_04", y: 40, rot: [0, Math.PI, 0] },
    ];
    scene.add(root);
    root.updateMatrixWorld();
    if (loadedCars) {
      for (const car of loadedCars.children?.slice()) {
        const fix = fixes.find((fix) => car.name.startsWith(fix.prefix));
        const rot = fix?.rot as [number, number, number];
        const obj = new THREE.Object3D();
        const axesHelper = new AxesHelper(100);

        car.getWorldPosition(obj.position);
        console.log(car.rotation);
        car.position.set(0, (fix as { y: number }).y, 0);
        car.rotation.set(...rot);
        obj.add(axesHelper);
        obj.add(car);
        scene.add(obj);
        cars.push(obj);
      }
    }
  }, [cars, loadedCars, root, scene]);

  useFrame(() => {
    if (resizeRenderToDisplaySize()) {
      const canvas = gl.domElement;
      (camera as PerspectiveCamera).aspect =
        canvas.clientWidth / canvas.clientHeight;
      (camera as PerspectiveCamera).updateProjectionMatrix();
    }

    for (const car of cars) {
      car.rotation.y = clock.getElapsedTime();
    }

    const pathTime = clock.getElapsedTime() * 0.01;
    const targetOffset = 0.01;

    cars.forEach((car, ndx) => {
      const curveObject = curveObjRef.current as Line2;
      const u = pathTime + ndx / cars.length;

      curve.getPointAt(u % 1, carPosition);
      carPosition.applyMatrix4(curveObject.matrixWorld);
      curve.getPointAt((u + targetOffset) % 1, carTarget);
      carTarget.applyMatrix4(curveObject.matrixWorld);

      car.position.copy(carPosition);
      car.lookAt(carTarget);

      car.position.lerpVectors(carPosition, carTarget, 0.5);
    });

    gl.render(scene, camera);
  });

  useEffect(() => {
    scene.background = new THREE.Color("black");
  }, [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(root);
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    frameArea(boxSize / 2, boxSize, boxCenter, camera);
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  }, [root, camera, controls, scene, cars, clock]);

  return (
    <>
      <OrbitControls target={new Vector3(0, 5, 0)} />
      <Plane args={[planeSize, planeSize]} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </Plane>
      <Line
        points={curve.getPoints(250)}
        renderOrder={1}
        scale={new Vector3(100, 100, 100)}
        visible={false}
        position={new Vector3(0, -621, 0)}
        ref={curveObjRef}
      >
        <lineBasicMaterial
          depthTest={false}
          color={0xff0000}
          side={THREE.DoubleSide}
        />
      </Line>
    </>
  );
};

export default Landscape;
