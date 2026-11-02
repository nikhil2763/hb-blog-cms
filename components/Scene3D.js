"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, MeshDistortMaterial, Sparkles, Stars, Text3D } from "@react-three/drei";
import * as THREE from "three";

const FONT = "/fonts/helvetiker_bold.typeface.json";

// Page scroll progress (0 = top, 1 = bottom) kept in a ref so the render loop can read it cheaply.
function useScrollProgress() {
  const ref = useRef(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return ref;
}

// Pointer parallax plus scroll: the camera sinks and pulls back while the scene turns as you scroll.
function Rig({ scroll, children }) {
  const group = useRef();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, delta) => {
    const p = scroll.current;
    target.set(state.pointer.x * 0.9, state.pointer.y * 0.6 - p * 1.6, 6 + p * 2.5);
    state.camera.position.lerp(target, 0.05);
    state.camera.lookAt(0, -p * 1.6, 0);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, p * Math.PI * 0.75, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, p * 0.35, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

function Blob({ position, scale = 1.35, color = "#7c3aed" }) {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.15;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial color={color} emissive="#3b0764" roughness={0.15} metalness={0.4} distort={0.42} speed={2} />
      </mesh>
    </Float>
  );
}

function Rings({ position, scale = 1 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.z += delta * 0.12;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.1, 0.018, 16, 200]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[Math.PI / 1.7, 0.6, 0]}>
        <torusGeometry args={[2.55, 0.012, 16, 200]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[0.3, Math.PI / 2.2, 0.4]}>
        <torusGeometry args={[2.95, 0.008, 16, 200]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Knot({ position }) {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.3;
    ref.current.rotation.y += delta * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={ref} position={position} scale={0.55}>
        <torusKnotGeometry args={[1, 0.32, 160, 24]} />
        <meshStandardMaterial color="#22d3ee" metalness={0.7} roughness={0.2} emissive="#0e7490" emissiveIntensity={0.35} />
      </mesh>
    </Float>
  );
}

const SHARDS = [
  { pos: [-1.2, -1.4, 0.5], color: "#f472b6", s: 0.35 },
  { pos: [3.6, 1.6, -1.5], color: "#facc15", s: 0.28 },
  { pos: [-3.8, -0.8, -0.6], color: "#a3e635", s: 0.25 },
  { pos: [0.3, 1.8, -2], color: "#60a5fa", s: 0.3 },
  { pos: [2.4, -2.6, -1], color: "#c084fc", s: 0.22 },
  { pos: [-2.6, 2.2, -2.5], color: "#fb7185", s: 0.2 },
];

function Shards() {
  return SHARDS.map((sh, i) => (
    <Float key={i} speed={2.5 + i * 0.3} rotationIntensity={2} floatIntensity={2}>
      <mesh position={sh.pos} scale={sh.s}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={sh.color} flatShading metalness={0.3} roughness={0.4} />
      </mesh>
    </Float>
  ));
}

// Spiral galaxy of additive-blended points, slowly rotating below the main objects.
function Galaxy({ count = 6000, radius = 7, position = [0, -2.4, -4] }) {
  const ref = useRef();
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const inner = new THREE.Color("#c084fc");
    const outer = new THREE.Color("#22d3ee");
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = Math.random() * radius;
      const angle = ((i % 3) / 3) * Math.PI * 2 + r * 0.9;
      const jitter = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * (1 + r * 0.25);
      pos[i * 3] = Math.cos(angle) * r + jitter();
      pos[i * 3 + 1] = jitter() * 0.5;
      pos[i * 3 + 2] = Math.sin(angle) * r + jitter();
      c.copy(inner).lerp(outer, r / radius);
      col.set([c.r, c.g, c.b], i * 3);
    }
    return [pos, col];
  }, [count, radius]);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.06;
  });
  return (
    <points ref={ref} position={position} rotation={[0.38, 0, 0.12]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} sizeAttenuation vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Wireframe sphere; "core" adds the glossy distorted blob inside it.
function Globe({ position = [0, 0, 0], core = true, opacity = 0.28 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.18;
    ref.current.rotation.x += delta * 0.05;
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <icosahedronGeometry args={[2, 3]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={opacity} />
      </mesh>
      {core && (
        <mesh scale={1.15}>
          <icosahedronGeometry args={[1, 32]} />
          <MeshDistortMaterial color="#6d28d9" emissive="#2e1065" roughness={0.2} metalness={0.5} distort={0.3} speed={1.5} />
        </mesh>
      )}
    </group>
  );
}

// Login centrepiece: a glowing 3D "HB" logo inside a slow wireframe globe with orbit rings.
function LogoOrb({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <Globe core={false} opacity={0.22} />
      <Rings position={[0, 0, 0]} scale={0.95} />
      <pointLight position={[0, 0, 2.5]} intensity={18} color="#c4b5fd" />
      <Suspense fallback={null}>
        <Word text="HB" position={[0, 0, 0.2]} size={1.05} color="#a78bfa" />
      </Suspense>
    </group>
  );
}

function Word({ text, position, size = 1, color = "#a78bfa" }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.4) * 0.08;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={ref} position={position}>
        <Center>
          <Text3D font={FONT} size={size} height={0.3} curveSegments={10} bevelEnabled bevelThickness={0.05} bevelSize={0.03} bevelSegments={4}>
            {text}
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} emissive="#4c1d95" emissiveIntensity={0.3} />
          </Text3D>
        </Center>
      </group>
    </Float>
  );
}

// What each page shows; positions shift on narrow screens so objects stay behind, not on top of, the text.
function Objects({ variant, narrow }) {
  switch (variant) {
    case "post":
      return (
        <>
          <Galaxy count={narrow ? 2500 : 4500} position={[0, -2.8, -5]} />
          <Blob position={narrow ? [1.2, 1.2, -1.5] : [3, 0.6, -0.5]} scale={0.95} />
          <Rings position={narrow ? [1.2, 1.2, -1.5] : [3, 0.6, -0.5]} scale={0.65} />
          <Shards />
        </>
      );
    case "login":
      return (
        <>
          <Galaxy count={narrow ? 2000 : 4000} radius={8} position={[0, -3.6, -7]} />
          <LogoOrb position={narrow ? [0, 2.1, -3.5] : [-2.3, 1.45, -1.2]} scale={narrow ? 0.6 : 0.64} />
        </>
      );
    case "admin":
      return (
        <>
          <Galaxy count={narrow ? 1500 : 3000} radius={8} position={[1.5, -3.2, -6]} />
          <Globe position={narrow ? [1.6, 2.4, -5] : [4.2, 0.6, -4]} />
          <Rings position={narrow ? [1.6, 2.4, -5] : [4.2, 0.6, -4]} scale={0.95} />
        </>
      );
    case "notfound":
      return (
        <>
          <Galaxy count={narrow ? 2500 : 4000} position={[0, -2.8, -5]} />
          <Suspense fallback={null}>
            <Word text="404" position={[0, 1.4, -1]} size={narrow ? 0.9 : 1.5} />
          </Suspense>
          <Rings position={[0, 1.4, -2]} scale={narrow ? 0.8 : 1.2} />
          <Shards />
        </>
      );
    default:
      return (
        <>
          <Galaxy count={narrow ? 3000 : 6000} />
          <Blob position={narrow ? [0.9, -0.6, -1] : [2.2, 0.1, 0]} />
          <Rings position={narrow ? [0.9, -0.6, -1] : [2.2, 0.1, 0]} scale={narrow ? 0.75 : 1} />
          <Knot position={narrow ? [-1.8, 2.2, -2] : [-2.9, 1.1, -1.2]} />
          <Shards />
          <Suspense fallback={null}>
            <Word text="BLOG" position={narrow ? [0, -3.4, -2.5] : [0.4, -3.6, -1.5]} size={narrow ? 0.6 : 0.9} color="#67e8f9" />
          </Suspense>
        </>
      );
  }
}

export default function Scene3D({ variant = "home" }) {
  const scroll = useScrollProgress();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = window.innerWidth < 720;
  // Lazy-mounted canvas can miss its first size measurement; nudge it once.
  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    return () => clearTimeout(id);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, narrow ? 1.5 : 1.75]}
      frameloop={reduceMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={document.body}
      eventPrefix="client"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#22d3ee" />
      <pointLight position={[4, 2, 2]} intensity={25} color="#f472b6" />
      <Stars radius={60} depth={40} count={narrow ? 1500 : 3000} factor={3} fade speed={1} />
      <Sparkles count={narrow ? 50 : 100} scale={[12, 8, 6]} size={2.5} speed={0.4} color="#c4b5fd" />
      <Rig scroll={scroll}>
        <Objects variant={variant} narrow={narrow} />
      </Rig>
    </Canvas>
  );
}
