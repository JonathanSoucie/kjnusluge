"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";

/* ---------- palette (light scene, UR-style cobot) ---------- */
const PAINT = "#e9ebee";     // painted aluminium links
const PAINT2 = "#dfe3e7";    // joint housings
const CAP = "#23272d";       // dark joint end caps
const GLOW = "#0e9cbe";      // status ring
const DARK = "#33435a";      // pedestal / conveyor
const BELT = "#26344a";
const BOX_A = "#9fb0c0";
const BOX_B = "#1e4e79";

/* ---------- kinematics (unchanged) ---------- */
const H = 0.78, L1 = 1.05, L2 = 0.95, TOOL = 0.34;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function solveIK(tx, ty, tz) {
  const wy = ty + TOOL;
  const yaw = Math.atan2(-tz, tx);
  const r = Math.hypot(tx, tz);
  const dx = r, dy = wy - H;
  let D = clamp(Math.hypot(dx, dy), 0.25, L1 + L2 - 0.02);
  const phi = Math.atan2(dy, dx);
  const a1 = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  const interior = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
  return { yaw, shoulder: phi + a1, elbow: -(Math.PI - interior) };
}
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const PICK = [1.5, 0.62, -0.85];
const HOVER_P = [1.5, 1.3, -0.85];
const T_GRIP = 1.05, T_RELEASE = 4.7;
const SLOTS = [
  [1.19, 0.36, 0.89], [1.51, 0.36, 0.89],
  [1.19, 0.36, 1.21], [1.51, 0.36, 1.21],
];
const hoverOf = (p) => [p[0], 1.35, p[2]];

function tipAt(tc, slot) {
  const place = SLOTS[slot], HQ = hoverOf(place);
  const seg = [
    [0.0, HOVER_P], [0.9, PICK], [1.25, PICK], [1.95, HOVER_P],
    [3.9, HQ], [4.6, place], [4.85, place], [5.45, HQ], [7.4, HOVER_P], [8.0, HOVER_P],
  ];
  for (let i = 1; i < seg.length; i++) {
    if (tc <= seg[i][0]) {
      const [t0, p0] = seg[i - 1], [t1, p1] = seg[i];
      const u = easeInOut((tc - t0) / (t1 - t0 || 1));
      const p = lerp3(p0, p1, u);
      if (i === 4) p[1] += Math.sin(u * Math.PI) * 0.25;
      return p;
    }
  }
  return HOVER_P;
}

/* ---------- realistic cobot pieces ---------- */
const paintMat = <meshPhysicalMaterial color={PAINT} roughness={0.38} metalness={0.12} clearcoat={0.55} clearcoatRoughness={0.35} />;
const housingMat = <meshPhysicalMaterial color={PAINT2} roughness={0.42} metalness={0.12} clearcoat={0.45} clearcoatRoughness={0.4} />;
const capMat = <meshStandardMaterial color={CAP} roughness={0.55} metalness={0.2} />;

/* a UR-style joint: housing cylinder along Z, dark end caps, subtle glow ring on the front face */
function URJoint({ r = 0.16, w = 0.32, ring = true, ...props }) {
  return (
    <group {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, w, 36]} />{housingMat}
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, w / 2 + 0.008]}>
        <cylinderGeometry args={[r * 0.98, r * 0.98, 0.02, 36]} />{capMat}
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -w / 2 - 0.008]}>
        <cylinderGeometry args={[r * 0.98, r * 0.98, 0.02, 36]} />{capMat}
      </mesh>
      {ring && (
        <mesh position={[0, 0, w / 2 - 0.028]}>
          <torusGeometry args={[r * 0.99, 0.011, 10, 48]} />
          <meshStandardMaterial color={"#0a3541"} emissive={GLOW} emissiveIntensity={1.35} />
        </mesh>
      )}
    </group>
  );
}

/* a link tube along +X with rounded collar ends */
function LinkTube({ len, r, z = 0, ...props }) {
  return (
    <group {...props}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[len / 2, 0, z]} castShadow>
        <cylinderGeometry args={[r, r, len, 32]} />{paintMat}
      </mesh>
      <mesh position={[0.02, 0, z]} castShadow><sphereGeometry args={[r * 1.06, 24, 24]} />{paintMat}</mesh>
      <mesh position={[len - 0.02, 0, z]} castShadow><sphereGeometry args={[r * 1.06, 24, 24]} />{paintMat}</mesh>
    </group>
  );
}

function Cell() {
  const yawR = useRef(), shR = useRef(), elR = useRef(), wrR = useRef();
  const fL = useRef(), fR = useRef();
  const boxes = useRef([]);
  const state = useRef({
    prev: 0, slot: 0, carried: -1,
    st: [
      { s: "conv", x: 1.55 }, { s: "conv", x: 2.25 }, { s: "conv", x: 2.95 },
      { s: "conv", x: 3.65 }, { s: "conv", x: 4.35 },
    ],
  });

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const tc = t % 8;
    const S = state.current;
    const crossed = (th) => (S.prev < th && tc >= th) || (S.prev > tc && (tc >= th || S.prev < th));
    if (crossed(T_GRIP) && S.carried === -1) {
      let best = -1, bx = Infinity;
      S.st.forEach((b, i) => { if (b.s === "conv" && b.x < bx) { bx = b.x; best = i; } });
      if (best >= 0 && bx < 1.7) { S.st[best].s = "held"; S.carried = best; }
    }
    if (crossed(T_RELEASE) && S.carried >= 0) {
      const p = SLOTS[S.slot];
      S.st[S.carried] = { s: "placed", x: p[0], z: p[2] };
      S.carried = -1;
      S.slot = (S.slot + 1) % 4;
      if (S.slot === 0) {
        let fx = 4.4;
        S.st.forEach((b) => { if (b.s === "placed") { b.s = "conv"; b.x = fx; fx += 0.7; delete b.z; } });
      }
    }
    S.prev = tc;

    const tip = tipAt(tc, S.slot);
    const ik = solveIK(tip[0], tip[1], tip[2]);
    yawR.current.rotation.y = ik.yaw;
    shR.current.rotation.z = ik.shoulder;
    elR.current.rotation.z = ik.elbow;
    wrR.current.rotation.z = -(ik.shoulder + ik.elbow);

    const closed = tc > T_GRIP && tc < T_RELEASE;
    const target = closed ? 0.112 : 0.175;
    fL.current.position.z += (target - fL.current.position.z) * Math.min(1, dt * 10);
    fR.current.position.z = -fL.current.position.z;

    const order = S.st.map((b, i) => ({ b, i })).filter(o => o.b.s === "conv").sort((a, c) => a.b.x - c.b.x);
    let minX = 1.55;
    order.forEach(({ b }) => { b.x = Math.max(minX, b.x - dt * 0.5); minX = b.x + 0.62; });

    S.st.forEach((b, i) => {
      const m = boxes.current[i]; if (!m) return;
      if (b.s === "conv") m.position.set(b.x, 0.56, -0.85);
      else if (b.s === "held") m.position.set(tip[0], tip[1] - 0.115, tip[2]);
      else m.position.set(b.x, 0.25, b.z);
    });
  });

  const boxColors = useMemo(() => [BOX_A, BOX_B, BOX_A, BOX_A, BOX_B], []);

  return (
    <group>
      {/* ---- pedestal ---- */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.48, 0.28, 44]} />
        <meshStandardMaterial color={DARK} roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.3, 0.36, 0.06, 44]} />{capMat}
      </mesh>

      {/* ---- UR-style arm ---- */}
      <group ref={yawR} position={[0, 0.32, 0]}>
        {/* base column */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.185, 0.21, 0.28, 36]} />{housingMat}
        </mesh>
        {/* base status ring */}
        <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.205, 0.011, 10, 52]} />
          <meshStandardMaterial color={"#0a3541"} emissive={GLOW} emissiveIntensity={1.35} />
        </mesh>

        <group ref={shR} position={[0, H - 0.32, 0]}>
          {/* shoulder joint housing */}
          <URJoint r={0.175} w={0.36} />
          {/* upper arm tube, offset forward like a real UR */}
          <LinkTube len={L1} r={0.115} z={0.115} />
          {/* elbow */}
          <group ref={elR} position={[L1, 0, 0]}>
            <URJoint r={0.145} w={0.3} />
            {/* forearm tube, offset back — the staggered cobot look */}
            <LinkTube len={L2} r={0.095} z={-0.105} />
            {/* wrist stack */}
            <group ref={wrR} position={[L2, 0, 0]}>
              <URJoint r={0.105} w={0.22} />
              {/* wrist-2 housing (vertical) */}
              <mesh position={[0, -0.115, 0]} castShadow>
                <cylinderGeometry args={[0.085, 0.085, 0.13, 30]} />{housingMat}
              </mesh>
              <mesh position={[0, -0.185, 0]}>
                <cylinderGeometry args={[0.083, 0.083, 0.018, 30]} />{capMat}
              </mesh>
              {/* tool flange */}
              <mesh position={[0, -0.215, 0]}>
                <cylinderGeometry args={[0.062, 0.062, 0.03, 26]} />
                <meshStandardMaterial color={"#8f979f"} metalness={0.6} roughness={0.3} />
              </mesh>
              {/* gripper body */}
              <mesh position={[0, -0.265, 0]} castShadow>
                <boxGeometry args={[0.15, 0.075, 0.36]} />{capMat}
              </mesh>
              {/* fingers with pads */}
              <group ref={fL} position={[0, -0.335, 0.175]}>
                <mesh castShadow><boxGeometry args={[0.065, 0.15, 0.03]} />{capMat}</mesh>
                <mesh position={[0, -0.02, -0.019]}><boxGeometry args={[0.055, 0.09, 0.008]} />
                  <meshStandardMaterial color={"#3d454e"} roughness={0.9} /></mesh>
              </group>
              <group ref={fR} position={[0, -0.335, -0.175]}>
                <mesh castShadow><boxGeometry args={[0.065, 0.15, 0.03]} />{capMat}</mesh>
                <mesh position={[0, -0.02, 0.019]}><boxGeometry args={[0.055, 0.09, 0.008]} />
                  <meshStandardMaterial color={"#3d454e"} roughness={0.9} /></mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ---- conveyor ---- */}
      <group>
        <mesh position={[3.1, 0.44, -0.85]} receiveShadow>
          <boxGeometry args={[3.6, 0.05, 0.62]} />
          <meshStandardMaterial color={BELT} roughness={0.85} />
        </mesh>
        <mesh position={[3.1, 0.38, -0.85]}>
          <boxGeometry args={[3.7, 0.09, 0.72]} />
          <meshStandardMaterial color={DARK} metalness={0.25} roughness={0.55} />
        </mesh>
        {[1.6, 2.6, 3.6, 4.6].map((x) => (
          <mesh key={x} position={[x, 0.18, -0.85]}>
            <boxGeometry args={[0.07, 0.38, 0.56]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        ))}
        <mesh position={[1.32, 0.53, -0.85]}>
          <boxGeometry args={[0.03, 0.12, 0.5]} />
          <meshStandardMaterial color={"#0a3541"} emissive={GLOW} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* ---- pallet ---- */}
      <group position={[1.35, 0, 1.05]}>
        <mesh position={[0, 0.09, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.95, 0.05, 0.95]} />
          <meshStandardMaterial color={"#b9a684"} roughness={0.85} />
        </mesh>
        {[-0.3, 0, 0.3].map((z) => (
          <mesh key={z} position={[0, 0.035, z]}>
            <boxGeometry args={[0.95, 0.07, 0.14]} />
            <meshStandardMaterial color={"#a8977a"} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ---- parts ---- */}
      {boxColors.map((c, i) => (
        <mesh key={i} ref={(el) => (boxes.current[i] = el)} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial color={c} roughness={0.45} metalness={0.15} />
        </mesh>
      ))}

      {/* ---- floor ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.13} />
      </mesh>
      <gridHelper args={[30, 60, "#c9d4de", "#e2e8ee"]} position={[0, 0.002, 0]} />
    </group>
  );
}

function Rig() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const a = Math.sin(t * 0.08) * 0.16;
    camera.position.set(4.4 * Math.cos(a * 0.4), 2.45 + Math.sin(t * 0.06) * 0.1, 5.0 + Math.sin(a) * 0.55);
    camera.lookAt(0.3, 0.72, 0.15);
  });
  return null;
}

export default function RobotScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [4.4, 2.45, 5.0], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <hemisphereLight args={["#ffffff", "#cfd8e0", 0.5]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 7, 3]} intensity={1.45} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-6, 3, -5]} intensity={0.3} color="#bfe8f2" />
      <Rig />
      <Cell />
      <fog attach="fog" args={["#f4f6f8", 11, 26]} />
    </Canvas>
  );
}
