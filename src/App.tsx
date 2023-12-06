import "./App.css";

import { Mesh, Color, MathUtils } from "three";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stats, OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

function makePosition(
  j: number,
  k: number,
  z: number,
  count: number,
  spacing: number,
  size: number
): [number, number, number] {
  const length = (count - 1) * (size + spacing);
  const half = length / 2;

  function make(n: number) {
    return MathUtils.lerp(-half, half, n / (count - 1));
  }
  return [make(j), make(k), make(z)];
}

interface BoxProps {
  i: number;
  j: number;
  k: number;
  matrixSize: number;
  pulse: boolean;
}

function Box({ i, j, k, matrixSize, pulse }: BoxProps) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<Mesh>(null!);

  // Hold state for hovered and clicked events
  const [color] = useState(
    new Color(Math.random(), Math.random(), Math.random())
  );
  const position = makePosition(i, j, k, matrixSize, 0, 1);
  const activePosition = makePosition(i, j, k, matrixSize, 1, 1);
  const [x, y, z] = position;
  const [ax, ay, az] = activePosition;

  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame(({ clock }) => {
    if (pulse) {
      const sinus = 0.5 + 0.5 * Math.sin(clock.getElapsedTime());
      ref.current.position.x = MathUtils.lerp(x, ax, sinus);
      ref.current.position.y = MathUtils.lerp(y, ay, sinus);
      ref.current.position.z = MathUtils.lerp(z, az, sinus);
    }
  });

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      position={position}
      ref={ref}
      onClick={() => console.log(position)}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.5]} />

      <meshPhysicalMaterial
        color={color}
        metalness={0.2}
        roughness={0}
        thickness={1}
      />
    </mesh>
  );
}

function Scene() {
  const {
    rotateCube,
    pulseSpheres,
    lights,
    lightIntensity,
    lightDistance,
    boxes,
  } = useControls({
    rotateCube: { name: "Rotate Cube", value: true },
    pulseSpheres: { name: "Pulse Spheres", value: true },
    boxes: { value: 3, min: 1, max: 11, step: 1 },
    lights: { value: 4, min: 1, max: 10, step: 1 },
    lightIntensity: { value: 40, min: 1, max: 100, step: 1 },
    lightDistance: { value: 6, min: 1, max: 20, step: 1 },
  });
  const boxMatrix = new Array(boxes).fill(null);
  const lightMatrix = new Array(lights).fill(null);

  const ref = useRef<Mesh>(null!);
  useFrame((_, delta) => {
    if (rotateCube) {
      ref.current.rotation.x += delta / 5;
      ref.current.rotation.y += delta / 2;
      ref.current.rotation.z += delta / 3;
    }
  });
  return (
    <>
      {lightMatrix.map((_, i) => {
        const deg = (2 * Math.PI * (i + 1)) / lightMatrix.length;
        const x = Math.sin(deg) * lightDistance;
        const z = Math.cos(deg) * lightDistance;

        return (
          <pointLight
            key={i}
            castShadow
            position={[x, 10, z]}
            color="white"
            intensity={lightIntensity}
          />
        );
      })}
      <mesh ref={ref} castShadow receiveShadow>
        {boxMatrix.map((_, i) => {
          return boxMatrix.map((_, j) => {
            return boxMatrix.map((_, k) => {
              return (
                <Box
                  key={`${i}-${j}-${k}`}
                  i={i}
                  j={j}
                  k={k}
                  matrixSize={boxes}
                  pulse={pulseSpheres}
                />
              );
            });
          });
        })}
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -10, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshPhysicalMaterial
          color="white"
          
          roughness={0.7}
          thickness={1}
        />
      </mesh>
    </>
  );
}

export default function App() {
  return (
    <div className="container">
      <Canvas flat shadows camera={{ position: [0, 10, 25] }}>
        <Scene />
        <OrbitControls />
        <Stats />
      </Canvas>
    </div>
  );
}
