import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import Experience from "./Experience";
import AppRapierPhysics from "./AppRapierPhysics";

const PhysicsEngine = () => {
  return <AppRapierPhysics />;
};

export default PhysicsEngine;
