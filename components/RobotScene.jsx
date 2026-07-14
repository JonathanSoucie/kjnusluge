"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";

/* ---------- palette (light scene, UR-style cobot) ---------- */
const PAINT = "#e9ebee";     // painted aluminium links
const PAINT2 = "#dfe3e7";    // joint housings
const CAP = "#23272d";       // dark joint end caps
const GLOW = "#0e9cbe";      // status ring
const DARK = "#33435a";      // pedestal / conveyor frame
const BELT = "#26344a";
const STEEL = "#8f979f";     // shafts, flange, drum ends
const ROLLER = "#b3bac1";    // galvanized roller tube
const RUBBER = "#2a2d31";    // suction cup rubber
const CARD_A = "#c99e63";    // cardboard
const CARD_B = "#b3874e";
const TAPE = "#d8cfb2";

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

/* pick height = cup lips just kissing the carton top (belt top 0.45 + box 0.22) */
const PICK = [1.5, 0.658, -0.85];
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

/* ---------- shared materials ---------- */
const paintMat = <meshPhysicalMaterial color={PAINT} roughness={0.38} metalness={0.12} clearcoat={0.55} clearcoatRoughness={0.35} />;
const housingMat = <meshPhysicalMaterial color={PAINT2} roughness={0.42} metalness={0.12} clearcoat={0.45} clearcoatRoughness={0.4} />;
const capMat = <meshStandardMaterial color={CAP} roughness={0.55} metalness={0.2} />;
const darkMat = <meshStandardMaterial color={DARK} roughness={0.55} metalness={0.25} />;
const steelMat = <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.3} />;
const rollerMat = <meshStandardMaterial color={ROLLER} metalness={0.65} roughness={0.35} />;
const rubberMat = <meshStandardMaterial color={RUBBER} roughness={0.92} />;
const cableMat = <meshStandardMaterial color="#23282e" roughness={0.9} />;

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

/* a link tube along +X with rounded collar ends and a dressed cable run */
function LinkTube({ len, r, z = 0, cable = true, ...props }) {
  return (
    <group {...props}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[len / 2, 0, z]} castShadow>
        <cylinderGeometry args={[r, r, len, 32]} />{paintMat}
      </mesh>
      <mesh position={[0.02, 0, z]} castShadow><sphereGeometry args={[r * 1.06, 24, 24]} />{paintMat}</mesh>
      <mesh position={[len - 0.02, 0, z]} castShadow><sphereGeometry args={[r * 1.06, 24, 24]} />{paintMat}</mesh>
      {cable && (
        <>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[len / 2, r + 0.004, z]}>
            <cylinderGeometry args={[0.015, 0.015, len - 0.28, 12]} />{cableMat}
          </mesh>
          {[0.3, 0.7].map((u) => (
            <mesh key={u} rotation={[0, Math.PI / 2, 0]} position={[len * u, 0, z]}>
              <torusGeometry args={[r + 0.014, 0.008, 8, 28]} />{capMat}
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/* bellows suction cup — origin at the mounting plate, cup hangs down; scaled in Y to "compress" */
function SuctionCup({ cupRef, ...props }) {
  return (
    <group ref={cupRef} {...props}>
      {[-0.008, -0.022].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.026, 0.011, 10, 24]} />{rubberMat}
        </mesh>
      ))}
      <mesh position={[0, -0.034, 0]}>
        <cylinderGeometry args={[0.019, 0.019, 0.014, 18]} />{rubberMat}
      </mesh>
      <mesh position={[0, -0.042, 0]}>
        <cylinderGeometry args={[0.023, 0.04, 0.011, 22]} />{rubberMat}
      </mesh>
    </group>
  );
}

/* welded H-leg with levelling feet */
function ConveyorLeg({ h = 0.36, w = 0.56, ...props }) {
  return (
    <group {...props}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0, h / 2 + 0.02, (s * w) / 2]} castShadow>
            <boxGeometry args={[0.045, h, 0.045]} />{darkMat}
          </mesh>
          <mesh position={[0, 0.012, (s * w) / 2]}>
            <cylinderGeometry args={[0.036, 0.044, 0.024, 16]} />{capMat}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.04, 0.04, w]} />{darkMat}
      </mesh>
    </group>
  );
}

const IDLER_XS = [1.8, 2.35, 2.9];
const GRAV_XS = Array.from({ length: 14 }, (_, i) => 3.72 + i * 0.22);

function Cell() {
  const yawR = useRef(), shR = useRef(), elR = useRef(), wrR = useRef();
  const cups = useRef([]);
  const ledMat = useRef();
  const beltLines = useRef([]);
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

    /* vacuum on: bellows compress, status LED goes green */
    const vac = tc > T_GRIP && tc < T_RELEASE;
    const squash = vac ? 0.72 : 1;
    cups.current.forEach((c) => { if (c) c.scale.y += (squash - c.scale.y) * Math.min(1, dt * 12); });
    if (ledMat.current) {
      ledMat.current.emissive.set(vac ? "#35d07f" : "#d5482f");
      ledMat.current.emissiveIntensity = vac ? 1.7 : 0.55;
    }

    /* belt lacing seams travel with the belt (belt runs toward -X at 0.5 m/s) */
    const span = 2.1;
    beltLines.current.forEach((m, i) => {
      if (m) m.position.x = 1.35 + ((((i * span) / 6 - t * 0.5) % span) + span) % span;
    });

    const order = S.st.map((b, i) => ({ b, i })).filter(o => o.b.s === "conv").sort((a, c) => a.b.x - c.b.x);
    let minX = 1.55;
    order.forEach(({ b }) => { b.x = Math.max(minX, b.x - dt * 0.5); minX = b.x + 0.62; });

    S.st.forEach((b, i) => {
      const m = boxes.current[i]; if (!m) return;
      if (b.s === "conv") m.position.set(b.x, 0.56, -0.85);
      else if (b.s === "held") m.position.set(tip[0], tip[1] - 0.098, tip[2]);
      else m.position.set(b.x, 0.25, b.z);
    });
  });

  const boxColors = useMemo(() => [CARD_A, CARD_B, CARD_A, CARD_A, CARD_B], []);

  return (
    <group>
      {/* ---- pedestal with anchor flange ---- */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.56, 0.58, 0.04, 44]} />{darkMat}
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.5, 0.048, Math.sin(a) * 0.5]}>
            <cylinderGeometry args={[0.017, 0.017, 0.018, 6]} />{steelMat}
          </mesh>
        );
      })}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.48, 0.28, 44]} />{darkMat}
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.3, 0.36, 0.06, 44]} />{capMat}
      </mesh>
      {/* e-stop box on the pedestal face */}
      <group position={[0, 0.17, 0.445]}>
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.11, 0.03]} />
          <meshStandardMaterial color="#e8c11c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.014, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.026, 18]} />
          <meshStandardMaterial color="#c8322e" roughness={0.5} />
        </mesh>
      </group>
      {/* floor cable duct feeding the base */}
      <mesh position={[-0.85, 0.023, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.045, 0.14]} />
        <meshStandardMaterial color="#7d8894" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* ---- UR-style arm ---- */}
      <group ref={yawR} position={[0, 0.34, 0]}>
        {/* base column */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.185, 0.21, 0.28, 36]} />{housingMat}
        </mesh>
        {/* base status ring */}
        <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.205, 0.011, 10, 52]} />
          <meshStandardMaterial color={"#0a3541"} emissive={GLOW} emissiveIntensity={1.35} />
        </mesh>

        <group ref={shR} position={[0, H - 0.34, 0]}>
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
                <cylinderGeometry args={[0.062, 0.062, 0.03, 26]} />{steelMat}
              </mesh>

              {/* ---- vacuum gripper ---- */}
              {/* venturi / manifold body */}
              <mesh position={[0, -0.255, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.055, 0.05, 28]} />{capMat}
              </mesh>
              {/* vacuum status LED (red idle / green when gripping) */}
              <mesh position={[0.038, -0.243, 0.038]}>
                <sphereGeometry args={[0.0085, 12, 12]} />
                <meshStandardMaterial ref={ledMat} color="#1a1d20" emissive="#d5482f" emissiveIntensity={0.55} />
              </mesh>
              {/* brass air fitting + flexible hose looping up to the wrist */}
              <mesh position={[0.07, -0.252, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.011, 0.011, 0.035, 12]} />
                <meshStandardMaterial color="#c9a24b" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0.088, -0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <torusGeometry args={[0.052, 0.0075, 8, 22, Math.PI]} />
                <meshStandardMaterial color="#46618a" roughness={0.65} />
              </mesh>
              {/* cup mounting plate */}
              <mesh position={[0, -0.287, 0]} castShadow>
                <boxGeometry args={[0.21, 0.014, 0.21]} />{capMat}
              </mesh>
              {/* four bellows cups, kept inside the carton footprint */}
              {[[-0.062, -0.062], [0.062, -0.062], [-0.062, 0.062], [0.062, 0.062]].map(([cx, cz], i) => (
                <SuctionCup key={i} cupRef={(el) => (cups.current[i] = el)} position={[cx, -0.294, cz]} />
              ))}
            </group>
          </group>
        </group>
      </group>

      {/* ---- belt conveyor (drums, idlers, motor) ---- */}
      <group>
        {/* belt: top run + return run */}
        <mesh position={[2.4, 0.44, -0.85]} receiveShadow>
          <boxGeometry args={[2.2, 0.02, 0.56]} />
          <meshStandardMaterial color={BELT} roughness={0.88} />
        </mesh>
        <mesh position={[2.4, 0.36, -0.85]}>
          <boxGeometry args={[2.2, 0.012, 0.56]} />
          <meshStandardMaterial color={"#1f2b3e"} roughness={0.9} />
        </mesh>
        {/* travelling lacing seams — sells the belt motion */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} ref={(el) => (beltLines.current[i] = el)} position={[1.35 + i * 0.35, 0.4515, -0.85]}>
            <boxGeometry args={[0.022, 0.004, 0.55]} />
            <meshStandardMaterial color="#1a2739" roughness={0.9} />
          </mesh>
        ))}
        {/* head & tail drums */}
        {[1.3, 3.5].map((x) => (
          <mesh key={x} position={[x, 0.402, -0.85]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.048, 0.048, 0.6, 28]} />{steelMat}
          </mesh>
        ))}
        {/* carrying idlers under the top run */}
        {IDLER_XS.map((x) => (
          <mesh key={x} position={[x, 0.4, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.027, 0.027, 0.6, 20]} />{rollerMat}
          </mesh>
        ))}
        {/* side plates */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[2.4, 0.405, -0.85 + s * 0.337]} castShadow>
            <boxGeometry args={[2.36, 0.1, 0.024]} />{darkMat}
          </mesh>
        ))}
        {/* drum shaft caps + idler bearing bolts on the plate faces */}
        {[1.3, 3.5].flatMap((x) => [-1, 1].map((s) => (
          <mesh key={`d${x}${s}`} position={[x, 0.402, -0.85 + s * 0.353]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.016, 6]} />{steelMat}
          </mesh>
        )))}
        {IDLER_XS.flatMap((x) => [-1, 1].map((s) => (
          <mesh key={`b${x}${s}`} position={[x, 0.4, -0.85 + s * 0.352]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.012, 6]} />{steelMat}
          </mesh>
        )))}
        {/* drive motor + gearbox on the head drum */}
        <group position={[1.3, 0.402, -0.46]}>
          <mesh castShadow><boxGeometry args={[0.11, 0.13, 0.09]} />{capMat}</mesh>
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.052, 0.052, 0.15, 20]} />
            <meshStandardMaterial color="#5c6a76" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.052, 0.022, 20]} />
            <meshStandardMaterial color="#49555e" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.08, 0.12]}><boxGeometry args={[0.05, 0.03, 0.06]} />{capMat}</mesh>
        </group>
        {/* legs */}
        <ConveyorLeg position={[1.7, 0, -0.85]} />
        <ConveyorLeg position={[2.55, 0, -0.85]} />
        <ConveyorLeg position={[3.4, 0, -0.85]} />
        {/* photo-eye pair at the pick point */}
        {[-1, 1].map((s) => (
          <group key={s} position={[1.34, 0, -0.85 + s * 0.358]}>
            <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.018, 0.13, 0.018]} />{darkMat}</mesh>
            <mesh position={[0, 0.56, 0]} castShadow><boxGeometry args={[0.045, 0.055, 0.035]} />{capMat}</mesh>
            <mesh position={[0, 0.56, -s * 0.021]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.011, 0.011, 0.007, 14]} />
              <meshStandardMaterial color="#062b33" emissive={GLOW} emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- gravity roller infeed section ---- */}
      <group>
        {/* transition plate off the tail drum */}
        <mesh position={[3.6, 0.446, -0.85]}>
          <boxGeometry args={[0.1, 0.008, 0.56]} />{steelMat}
        </mesh>
        {/* side rails */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[5.22, 0.435, -0.85 + s * 0.31]} castShadow>
            <boxGeometry args={[3.16, 0.06, 0.02]} />{darkMat}
          </mesh>
        ))}
        {/* rollers with through-shafts */}
        {GRAV_XS.map((x) => (
          <group key={x} position={[x, 0.42, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.56, 22]} />{rollerMat}
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 0.66, 8]} />{steelMat}
            </mesh>
          </group>
        ))}
        {/* end stop */}
        <mesh position={[6.74, 0.47, -0.85]} castShadow>
          <boxGeometry args={[0.025, 0.09, 0.64]} />
          <meshStandardMaterial color="#e0862e" roughness={0.6} />
        </mesh>
        <ConveyorLeg h={0.39} position={[4.0, 0, -0.85]} />
        <ConveyorLeg h={0.39} position={[6.5, 0, -0.85]} />
      </group>

      {/* ---- pallet (slatted deck, stringers, bottom boards) ---- */}
      <group position={[1.35, 0, 1.05]}>
        {[-0.38, -0.19, 0, 0.19, 0.38].map((x) => (
          <mesh key={`t${x}`} position={[x, 0.13, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.14, 0.02, 0.95]} />
            <meshStandardMaterial color={"#b9a684"} roughness={0.85} />
          </mesh>
        ))}
        {[-0.35, 0, 0.35].map((z) => (
          <mesh key={`s${z}`} position={[0, 0.075, z]}>
            <boxGeometry args={[0.95, 0.09, 0.12]} />
            <meshStandardMaterial color={"#a8977a"} roughness={0.9} />
          </mesh>
        ))}
        {[-0.38, 0, 0.38].map((x) => (
          <mesh key={`b${x}`} position={[x, 0.015, 0]}>
            <boxGeometry args={[0.14, 0.03, 0.95]} />
            <meshStandardMaterial color={"#a08f73"} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ---- cartons ---- */}
      {boxColors.map((c, i) => (
        <group key={i} ref={(el) => (boxes.current[i] = el)}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color={c} roughness={0.82} />
          </mesh>
          {/* packing tape along the top seam */}
          <mesh position={[0, 0.1105, 0]}>
            <boxGeometry args={[0.055, 0.003, 0.222]} />
            <meshStandardMaterial color={TAPE} roughness={0.55} />
          </mesh>
          {/* shipping label */}
          <mesh position={[0, 0.015, 0.1105]}>
            <boxGeometry args={[0.09, 0.055, 0.002]} />
            <meshStandardMaterial color="#eae6dc" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ---- floor ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.13} />
      </mesh>
      <gridHelper args={[30, 60, "#c9d4de", "#e2e8ee"]} position={[0, 0.002, 0]} />
      {/* safety floor marking around the cell */}
      {[
        [0.5, -1.75, 3.9, 0.05], [0.5, 1.95, 3.9, 0.05],
      ].map(([x, z, w, d], i) => (
        <mesh key={`h${i}`} position={[x, 0.004, z]}>
          <boxGeometry args={[w, 0.003, d]} />
          <meshStandardMaterial color="#e3b341" roughness={0.9} />
        </mesh>
      ))}
      {[[-1.4, 0.1], [2.4, 0.1]].map(([x, z], i) => (
        <mesh key={`v${i}`} position={[x, 0.004, z]}>
          <boxGeometry args={[0.05, 0.003, 3.75]} />
          <meshStandardMaterial color="#e3b341" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Rig() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const a = Math.sin(t * 0.08) * 0.16;
    camera.position.set(4.9 * Math.cos(a * 0.4), 2.55 + Math.sin(t * 0.06) * 0.1, 5.45 + Math.sin(a) * 0.55);
    camera.lookAt(0.7, 0.68, 0.08);
  });
  return null;
}

export default function RobotScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [4.9, 2.55, 5.45], fov: 38 }}
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
