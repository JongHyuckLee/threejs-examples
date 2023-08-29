import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Group, Mesh } from "three";

export interface GLB extends GLTF {
  materials: Record<string, Mesh | Group>;
  nodes: Record<string, Mesh | Group>;
  parent: Group | Mesh;
}
