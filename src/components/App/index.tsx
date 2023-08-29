import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useRoute } from "wouter";
import Character from "../Home/Character";
import { IMAGES, MODELS, ROUTES } from "../../constants";
import Frames from "../Home/Frames";
import Frame from "../Home/Frame";
import Frame3D from "../Ocean/Frame3D";
import { Route, Routes } from "react-router-dom";
import Home from "../Home";
import Ocean from "../Ocean";
import NightOcean from "../NightOcean";

import Ground from "../Ground";
import Image2 from "../Image";

export const GOLDENRATIO = 1.61803398875;

const App = () => {
  useEffect(() => {
    useGLTF.preload(MODELS);
  }, []);
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.OCEAN} element={<Ocean />} />
      <Route path={ROUTES.NIGHT_OCEAN} element={<NightOcean />} />
      <Route path={ROUTES.IMAGE} element={<Image2 />} />
      <Route path={ROUTES.GROUND} element={<Ground />} />
    </Routes>
  );
};
export default App;
