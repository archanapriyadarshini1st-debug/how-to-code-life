import { useRef, useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { RoundedBox, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion, useIsMobile } from '../../lib/hooks';

/* ════════════════════════════════════════════════════════════
   A physical object, not a gimmick.
   Scroll → the board disassembles; the YOU key stays.
   ════════════════════════════════════════════════════════════ */

const ROWS: { keys: string[]; w?: number[] }[] = [
  { keys: ['c', 'o', 'n', 's', 't', '', 'l', 'i', 'f', 'e'] },
  { keys: ['c', 'h', 'o', 'i', 'c', 'e', 's', ',', '', ''] },
  { keys: ['h', 'a', 'b', 'i', 't', 's', ',', '', '', ''] },
  { keys: ['f', 'a', 'i', 'l', 'u', 'r', 'e', 's', '', ''] },
];


/* ── Keycap legends drawn to a canvas texture: zero network, zero font
      loading, crisp at any DPR. Cached per (label,color) pair. ── */
const labelCache = new Map<string, THREE.CanvasTexture>();
function useLabelTexture(label: string, color: string, wide: boolean) {
  return useMemo(() => {
    if (!label) return null;
    const key = `${label}|${color}|${wide}`;
    const hit = labelCache.get(key);
    if (hit) return hit;
    const S = 256;
    const cv = document.createElement('canvas');
    cv.width = wide ? S * 2 : S;
    cv.height = S;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const size = label.length > 1 ? 100 : 128;
    ctx.font = `500 ${size}px "JetBrains Mono Variable", ui-monospace, monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (label.length > 1) ctx.letterSpacing = '14px';
    ctx.fillText(label, cv.width / 2, cv.height / 2 + 4);
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    labelCache.set(key, tex);
    return tex;
  }, [label, color, wide]);
}

const U = 0.5;        // 1 unit key
const GAP = 0.055;
const PITCH = U + GAP;

type KeyDef = {
  id: string; label: string; x: number; z: number; w: number;
  accent?: boolean; you?: boolean; row: number; col: number;
};

function buildLayout(): KeyDef[] {
  const keys: KeyDef[] = [];
  ROWS.forEach((row, r) => {
    row.keys.forEach((label, c) => {
      if (!label) return;
      keys.push({
        id: `${r}-${c}`, label, row: r, col: c,
        x: (c - (ROWS[0].keys.length - 1) / 2) * PITCH,
        z: (r - (ROWS.length - 1) / 2) * PITCH,
        w: U,
        accent: r === 0 && c < 5,
      });
    });
  });
  // The YOU key — deliberately oversized, offset, unmissable.
  keys.push({
    id: 'you', label: 'YOU', row: 4, col: 0,
    x: -1.1, z: ((4 - (ROWS.length - 1) / 2) * PITCH),
    w: U * 2.1, you: true, accent: true,
  });
  keys.push({
    id: 'space', label: '', row: 4, col: 1,
    x: 0.95, z: ((4 - (ROWS.length - 1) / 2) * PITCH),
    w: U * 3.2,
  });
  return keys;
}

/* ── A single keycap. Sculpted top, physical press. ── */
function Keycap({
  def, progress, pressed, hovered, onPress, onHover, reduced,
}: {
  def: KeyDef; progress: number; pressed: boolean; hovered: boolean;
  onPress: (id: string) => void; onHover: (id: string | null) => void; reduced: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);
  const explodeDir = useMemo(
    () => new THREE.Vector3(def.x * 0.55 + (Math.random() - 0.5) * 0.4, 0.6 + Math.random() * 1.7, def.z * 0.5 + (Math.random() - 0.5) * 0.4),
    [def.x, def.z],
  );

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    const p = progress;

    // Phase 1 (0→.45): selected keys rise. Phase 2 (.45→1): disassembly.
    const rise = def.accent ? THREE.MathUtils.smoothstep(p, 0.05, 0.42) * 0.3 : 0;
    const ex = THREE.MathUtils.smoothstep(p, 0.45, 1);
    // The YOU key resists the explosion — it stays.
    const exFactor = def.you ? 0.06 : 1;

    const press = pressed ? -0.09 : hovered ? 0.045 : 0;
    const float = reduced ? 0 : Math.sin(t * 0.9 + seed) * 0.012 * (1 - ex);

    g.current.position.x = def.x + explodeDir.x * ex * exFactor;
    g.current.position.y = 0.13 + rise + press + float + explodeDir.y * ex * exFactor;
    g.current.position.z = def.z + explodeDir.z * ex * exFactor;

    if (!reduced) {
      g.current.rotation.x = ex * exFactor * (seed % 1) * 0.9;
      g.current.rotation.z = ex * exFactor * ((seed * 1.7) % 1 - 0.5) * 1.1;
    }
    const s = def.you ? 1 + THREE.MathUtils.smoothstep(p, 0.5, 1) * 0.22 : 1;
    g.current.scale.setScalar(s);
  });

  const isDark = def.accent;
  const labelColor = def.you ? '#FFF3EA' : isDark ? '#D8D2C6' : '#3A3733';
  const labelTex = useLabelTexture(def.you ? 'YOU' : def.label, labelColor, !!def.you);

  const color = def.you
    ? '#C75824'
    : isDark ? '#26231F' : '#EDE9E1';

  return (
    <group ref={g}>
      <RoundedBox
        args={[def.w, 0.15, U]}
        radius={0.028}
        smoothness={3}
        castShadow
        receiveShadow
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(def.id); }}
        onPointerOut={() => onHover(null)}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPress(def.id); }}
      >
        <meshPhysicalMaterial
          color={color}
          roughness={def.you ? 0.34 : 0.62}
          metalness={0.02}
          clearcoat={def.you ? 0.55 : 0.14}
          clearcoatRoughness={0.5}
          emissive={def.you ? '#C75824' : '#000000'}
          emissiveIntensity={def.you && hovered ? 0.28 : def.you ? 0.1 : 0}
        />
      </RoundedBox>
      {labelTex && (
        <mesh position={[0, 0.0765, def.you ? 0 : 0.008]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[def.you ? 0.46 : 0.2, def.you ? 0.23 : 0.2]} />
          <meshBasicMaterial map={labelTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function Board({ progress, transformed, onYou, reduced, quality }: {
  progress: number; transformed: boolean; onYou: () => void; reduced: boolean; quality: 'low' | 'high';
}) {
  const layout = useMemo(buildLayout, []);
  const [hover, setHover] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const root = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const press = useCallback((id: string) => {
    setPressed(id);
    window.setTimeout(() => setPressed(null), 170);
    if (id === 'you') onYou();
  }, [onYou]);

  useFrame((_state, dt) => {
    if (!root.current) return;
    const p = progress;
    // Camera-ish orbit expressed on the object (cheaper, more controllable)
    const targetRotY = -0.32 + p * 1.05 + (reduced ? 0 : pointer.x * 0.14);
    const targetRotX = 0.52 - p * 0.3 + (reduced ? 0 : -pointer.y * 0.08);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetRotY, 3.4, dt);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetRotX, 3.4, dt);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, 0.05 + p * 0.45, 3, dt);
    const s = 0.86 - p * 0.06;
    root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, s, 3, dt));
  });

  const caseLift = THREE.MathUtils.smoothstep(progress, 0.5, 1);

  return (
    <group ref={root} rotation={[0.52, -0.32, 0]}>
      {/* CASE */}
      <group position={[0, -caseLift * 0.85, 0]}>
        <RoundedBox args={[6.05, 0.34, 2.85]} radius={0.07} smoothness={4} position={[0, -0.02, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={transformed ? '#1B1916' : '#DAD5CB'} roughness={0.48} metalness={0.35} clearcoat={0.3} />
        </RoundedBox>
        {/* plate */}
        <RoundedBox args={[5.8, 0.06, 2.62]} radius={0.02} smoothness={2} position={[0, 0.15, 0]} receiveShadow>
          <meshStandardMaterial color={transformed ? '#2C2824' : '#B9B3A7'} roughness={0.7} metalness={0.5} />
        </RoundedBox>
        {/* accent strip — the one bit of ember on the hardware */}
        <mesh position={[0, 0.02, 1.44]}>
          <boxGeometry args={[6.05, 0.05, 0.02]} />
          <meshStandardMaterial color="#C75824" emissive="#C75824" emissiveIntensity={transformed ? 1.4 : 0.35} toneMapped={false} />
        </mesh>
      </group>

      {/* PCB layer revealed during disassembly */}
      {quality === 'high' && caseLift > 0.01 && (
        <group position={[0, -0.05, 0]} scale={[1, 1, 1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5.7, 2.5]} />
            <meshStandardMaterial color="#1F2B24" roughness={0.85} transparent opacity={caseLift * 0.9} />
          </mesh>
        </group>
      )}

      {layout.map((k) => (
        <Keycap
          key={k.id}
          def={k}
          progress={progress}
          pressed={pressed === k.id}
          hovered={hover === k.id}
          onPress={press}
          onHover={setHover}
          reduced={reduced}
        />
      ))}
    </group>
  );
}

export default function Keyboard({
  progress, transformed, onYouPress,
}: { progress: number; transformed: boolean; onYouPress: () => void }) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const quality: 'low' | 'high' = isMobile ? 'low' : 'high';

  return (
    <Canvas
      dpr={isMobile ? [1, 1.4] : [1, 1.9]}
      shadows={!isMobile}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
      style={{ touchAction: 'pan-y' }}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 3.1, 9.4]}
        rotation={[-Math.atan(3.1 / 9.4), 0, 0]}
        fov={isMobile ? 42 : 31}
      />
      <Suspense fallback={null}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 7, 4]} intensity={1.5} castShadow={!isMobile}
          shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
        <directionalLight position={[-5, 3, -2]} intensity={0.45} color="#E2946A" />
        <Board progress={progress} transformed={transformed} onYou={onYouPress} reduced={reduced} quality={quality} />
        {!isMobile && (
          <ContactShadows position={[0, -0.95, 0]} opacity={0.32} scale={11} blur={2.6} far={4} resolution={512} color="#12110F" />
        )}
      </Suspense>
    </Canvas>
  );
}
