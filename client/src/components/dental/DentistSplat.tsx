import { useEffect, useRef } from "react";
import * as THREE from "three";

// A dentist at work, drawn as a cloud of soft gaussian splats: a seated
// clinician leaning over a reclined patient under the operatory light. The
// scene is composed procedurally from ellipsoids and capsules, assembles out of
// a loose cloud when it first comes into view, then drifts slowly and follows
// the pointer like a splat viewer.

type V3 = [number, number, number];

type Splat = { p: V3; c: THREE.Color; s: number; a: number; g: number };

const TARGET = new THREE.Vector3(-0.3, 0.9, 0);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildScene(density: number) {
  const rand = rng(7);
  const splats: Splat[] = [];
  const tmp = new THREE.Color();

  const gauss = () => {
    const u = 1 - rand();
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const unit = (): V3 => {
    const x = gauss(), y = gauss(), z = gauss();
    const l = Math.hypot(x, y, z) || 1;
    return [x / l, y / l, z / l];
  };
  const shell = () => 1 - 0.2 * rand() * rand();

  const push = (p: V3, color: string | ((p: V3) => string), size = 1, alpha = 0.7, group = 0) => {
    // Shader output is not colour-managed, so keep the hex values in sRGB
    tmp.set(typeof color === "function" ? color(p) : color).convertLinearToSRGB();
    const j = (rand() - 0.5) * 0.06;
    splats.push({
      p,
      c: new THREE.Color(tmp.r + j, tmp.g + j, tmp.b + j),
      s: size * (0.6 + rand() * 0.9),
      a: alpha,
      g: group,
    });
  };

  // Ellipsoid surface (with a little depth), optionally rotated about z
  const ellipsoid = (
    c: V3,
    r: V3,
    n: number,
    color: string | ((p: V3, local: V3) => string),
    opts: { rot?: number; size?: number; alpha?: number; group?: number } = {},
  ) => {
    const cos = Math.cos(opts.rot ?? 0), sin = Math.sin(opts.rot ?? 0);
    const count = Math.round(n * density);
    for (let i = 0; i < count; i++) {
      const u = unit();
      const k = shell();
      const lx = u[0] * r[0] * k, ly = u[1] * r[1] * k, lz = u[2] * r[2] * k;
      const p: V3 = [c[0] + lx * cos - ly * sin, c[1] + lx * sin + ly * cos, c[2] + lz];
      push(p, typeof color === "function" ? color(p, u) : color, opts.size, opts.alpha, opts.group);
    }
  };

  const capsule = (
    a: V3,
    b: V3,
    radius: number,
    n: number,
    color: string,
    opts: { size?: number; alpha?: number; group?: number } = {},
  ) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    const len = d.length();
    d.normalize();
    const ref = Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(d, ref).normalize();
    const v = new THREE.Vector3().crossVectors(d, u);
    const count = Math.round(n * density);
    for (let i = 0; i < count; i++) {
      // Spread along the length, with rounded ends
      const t = rand() * (len + radius * 2) - radius;
      const ang = rand() * Math.PI * 2;
      const r = radius * shell();
      const along = Math.max(0, Math.min(len, t));
      const over = t - along; // inside an end cap
      const capScale = Math.sqrt(Math.max(0, 1 - (over / radius) ** 2));
      const P = A.clone()
        .addScaledVector(d, t)
        .addScaledVector(u, Math.cos(ang) * r * capScale)
        .addScaledVector(v, Math.sin(ang) * r * capScale);
      push([P.x, P.y, P.z], color, opts.size, opts.alpha, opts.group);
    }
  };

  // Palette
  const chair = "#dbe4ee";
  const chairDeep = "#c5d2e0";
  const metal = "#aab6c4";
  const skin = "#e9c3a4";
  const skinShade = "#d9ad8c";
  const scrubs = "#3fbfb1";
  const scrubsDeep = "#2e9e93";
  const glove = "#a9d3f2";
  const gown = "#b9b1de";
  const slacks = "#7a86a0";
  const hair = "#4b3b33";

  // Floor shadow, a faint disc that grounds the scene
  ellipsoid([-0.45, 0.005, 0], [1.25, 0.004, 0.6], 900, "#cfd6de", { size: 1.6, alpha: 0.18 });

  // Dental chair
  ellipsoid([0.05, 0.03, 0], [0.34, 0.03, 0.24], 380, metal);
  capsule([0.05, 0.03, 0], [0.05, 0.46, 0], 0.075, 420, metal);
  ellipsoid([0.2, 0.57, 0], [0.34, 0.075, 0.27], 1300, chair);
  ellipsoid([-0.45, 0.72, 0], [0.4, 0.075, 0.27], 1500, chair, { rot: -0.34 });
  ellipsoid([0.78, 0.47, 0], [0.33, 0.065, 0.24], 900, chair, { rot: -0.34 });
  ellipsoid([-0.92, 0.9, 0], [0.13, 0.05, 0.14], 420, chairDeep, { rot: -0.34 });
  // Armrest
  capsule([-0.25, 0.74, 0.3], [0.25, 0.7, 0.3], 0.035, 260, chairDeep);

  // Patient, reclined, face up
  ellipsoid([-0.88, 1.02, 0], [0.1, 0.11, 0.09], 900, (_p, u) => (u[0] < -0.35 || (u[1] < -0.2 && u[0] < 0) ? hair : u[0] > 0.6 ? skinShade : skin));
  ellipsoid([-0.47, 0.86, 0], [0.31, 0.11, 0.19], 1800, gown, { rot: -0.34 });
  ellipsoid([-0.62, 0.95, 0], [0.12, 0.03, 0.15], 320, "#f4f7fa", { rot: -0.34 }); // bib
  capsule([-0.72, 0.95, 0], [-0.8, 0.98, 0], 0.05, 160, skin); // neck
  for (const z of [0.085, -0.085]) {
    capsule([-0.15, 0.72, z], [0.5, 0.67, z], 0.075, 650, slacks);
    capsule([0.5, 0.67, z], [0.94, 0.47, z * 1.1], 0.065, 520, slacks);
    ellipsoid([0.99, 0.5, z * 1.1], [0.05, 0.07, 0.04], 120, "#59647a");
    capsule([-0.66, 0.92, z * 2.4], [-0.32, 0.8, z * 2.6], 0.05, 380, gown);
    capsule([-0.32, 0.8, z * 2.6], [-0.02, 0.76, z * 1.6], 0.042, 300, skin);
  }

  // Dentist's stool
  ellipsoid([-1.38, 0.03, 0.05], [0.24, 0.025, 0.24], 260, metal);
  capsule([-1.38, 0.03, 0.05], [-1.38, 0.46, 0.05], 0.035, 180, metal);
  ellipsoid([-1.38, 0.5, 0.05], [0.2, 0.045, 0.2], 380, "#8b97a8");

  // Dentist, seated at the head of the chair and leaning in
  const D = 1; // group for the parts that move while working
  capsule([-1.36, 0.62, 0.05], [-1.16, 1.1, 0.05], 0.155, 2100, scrubs);
  for (const z of [0.17, -0.07]) {
    capsule([-1.34, 0.6, z], [-1.02, 0.58, z + (z > 0.05 ? 0.04 : -0.04)], 0.08, 520, scrubsDeep);
    capsule([-1.02, 0.58, z + (z > 0.05 ? 0.04 : -0.04)], [-1.02, 0.1, z + (z > 0.05 ? 0.04 : -0.04)], 0.065, 460, scrubsDeep);
    ellipsoid([-0.97, 0.05, z + (z > 0.05 ? 0.04 : -0.04)], [0.09, 0.04, 0.05], 120, "#e8eef3");
  }
  // Head: cap on top, mask over the lower face, a tinted visor across the eyes
  ellipsoid([-1.02, 1.29, 0.05], [0.1, 0.115, 0.1], 1100, (_p, u) =>
    u[1] > 0.25 ? scrubs : u[0] > 0.2 && u[1] < 0.0 ? "#e3f0f8" : u[0] > 0.35 && u[1] < 0.22 ? "#38434f" : skin,
  );
  capsule([-1.08, 1.12, 0.05], [-1.04, 1.19, 0.05], 0.05, 140, skin);
  // Right arm holding the handpiece, left arm holding the mirror
  capsule([-1.16, 1.06, 0.22], [-1.02, 0.9, 0.29], 0.055, 360, scrubs, { group: D });
  capsule([-1.02, 0.9, 0.29], [-0.88, 1.02, 0.12], 0.045, 300, skin, { group: D });
  ellipsoid([-0.86, 1.05, 0.09], [0.04, 0.03, 0.035], 140, glove, { group: D });
  capsule([-1.16, 1.06, -0.12], [-1.02, 0.94, -0.2], 0.055, 360, scrubs, { group: D });
  capsule([-1.02, 0.94, -0.2], [-0.86, 1.05, -0.07], 0.045, 300, skin, { group: D });
  ellipsoid([-0.84, 1.08, -0.05], [0.04, 0.03, 0.035], 140, glove, { group: D });
  // Instruments meeting at the patient's mouth
  capsule([-0.85, 1.07, 0.08], [-0.83, 1.12, 0.01], 0.008, 70, "#c9d2dc", { size: 0.6, group: D });
  capsule([-0.83, 1.09, -0.05], [-0.84, 1.12, 0.0], 0.008, 60, "#c9d2dc", { size: 0.6, group: D });

  // Operatory light on its arm, casting a warm cone onto the patient
  capsule([0.25, 0.04, -0.5], [0.25, 1.95, -0.5], 0.03, 520, metal);
  capsule([0.25, 1.95, -0.5], [-0.35, 1.9, -0.22], 0.025, 260, metal);
  capsule([-0.35, 1.9, -0.22], [-0.62, 1.68, -0.06], 0.022, 200, metal);
  ellipsoid([-0.66, 1.64, -0.03], [0.15, 0.05, 0.1], 420, (_p, u) => (u[1] < -0.3 ? "#fff3d6" : "#eef2f6"), { rot: 0.25 });
  const cone = Math.round(700 * density);
  for (let i = 0; i < cone; i++) {
    const t = rand();
    const spread = 0.04 + t * 0.14;
    const ang = rand() * Math.PI * 2;
    const rr = spread * Math.sqrt(rand());
    push(
      [-0.66 + (-0.84 + 0.66) * t + Math.cos(ang) * rr, 1.6 + (1.1 - 1.6) * t, -0.03 + 0.03 * t + Math.sin(ang) * rr],
      "#ffe2b5",
      3.2,
      0.05,
    );
  }

  // Instrument tray on a swing arm
  capsule([0.25, 1.15, 0.6], [-0.25, 1.08, 0.55], 0.02, 140, metal);
  ellipsoid([-0.32, 1.08, 0.52], [0.18, 0.015, 0.12], 420, "#dfe5ec");
  for (let i = 0; i < 5; i++) {
    const z = 0.45 + i * 0.03;
    capsule([-0.42, 1.1, z], [-0.24, 1.1, z], 0.006, 40, "#b6c0cb", { size: 0.6 });
  }

  return splats;
}

const vert = /* glsl */ `
  attribute vec3 color;
  attribute vec3 scatter;
  attribute float size;
  attribute float alpha;
  attribute float seed;
  attribute float group;
  uniform float uTime;
  uniform float uBuild;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Each splat flies in from its scattered position on its own schedule
    float k = clamp((uBuild - seed * 0.45) / 0.55, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 p = mix(position + scatter, position, k);

    // A slow breath through the whole cloud, plus the clinician's hands at work
    p += 0.0035 * vec3(sin(uTime * 1.3 + seed * 40.0), sin(uTime * 1.1 + seed * 31.0), sin(uTime * 0.9 + seed * 23.0));
    p += group * vec3(0.012 * sin(uTime * 1.6), 0.008 * sin(uTime * 2.3 + 1.0), 0.006 * sin(uTime * 1.2));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uScale / -mv.z;
    vColor = color;
    vAlpha = alpha * mix(0.0, 1.0, k * k);
  }
`;

const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 q = gl_PointCoord * 2.0 - 1.0;
    float d = dot(q, q);
    float a = exp(-d * 3.2) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export function DentistSplat({ className = "", detail = "high" }: { className?: string; detail?: "high" | "low" }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL: the panel keeps its gradient
    }
    const small = window.matchMedia("(max-width: 767px)").matches;
    const density = detail === "low" || small ? 0.55 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

    const splats = buildScene(density);
    const n = splats.length;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const sca = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const alpha = new Float32Array(n);
    const seed = new Float32Array(n);
    const group = new Float32Array(n);
    const r = rng(11);
    const base = 0.042 / Math.sqrt(density);
    splats.forEach((s, i) => {
      pos.set(s.p, i * 3);
      col.set([s.c.r, s.c.g, s.c.b], i * 3);
      // Scatter outward from the scene centre and a little upward
      const dx = s.p[0] - TARGET.x, dy = s.p[1] - TARGET.y, dz = s.p[2] - TARGET.z;
      const m = 0.8 + r() * 1.6;
      sca.set([dx * m + (r() - 0.5) * 1.2, dy * m + r() * 0.9, dz * m + (r() - 0.5) * 1.2], i * 3);
      size[i] = s.s * base;
      alpha[i] = s.a;
      seed[i] = r();
      group[i] = s.g;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("scatter", new THREE.BufferAttribute(sca, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("alpha", new THREE.BufferAttribute(alpha, 1));
    geo.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("group", new THREE.BufferAttribute(group, 1));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const uniforms = {
      uTime: { value: 0 },
      uBuild: { value: reduce ? 1 : 0 },
      uScale: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Fit the scene by width as well as height, so narrow panels never crop it
      const fitH = (2 * Math.atan(Math.tan((40 * Math.PI) / 360) / camera.aspect) * 180) / Math.PI;
      camera.fov = Math.max(30, fitH);
      camera.updateProjectionMatrix();
      uniforms.uScale.value = (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // Pointer nudges the orbit, like dragging in a splat viewer
    let px = 0, py = 0, tx = 0, ty = 0;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * 2;
      ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    let visible = false;
    let started = false;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) t += dt;
      if (started && uniforms.uBuild.value < 1) uniforms.uBuild.value = Math.min(1, uniforms.uBuild.value + dt / 2.6);
      uniforms.uTime.value = t;

      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      const az = 0.62 + Math.sin(t * 0.18) * 0.32 + px * 0.45;
      const el2 = 0.32 + py * -0.12;
      const dist = 4.4;
      camera.position.set(
        TARGET.x + Math.sin(az) * Math.cos(el2) * dist,
        TARGET.y + Math.sin(el2) * dist,
        TARGET.z + Math.cos(az) * Math.cos(el2) * dist,
      );
      camera.lookAt(TARGET);
      renderer.render(scene, camera);
      if (visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          started = true;
          last = performance.now();
          if (!raf) raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    return () => {
      visible = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [detail]);

  return <div ref={host} className={className} aria-label="A dentist treating a patient, rendered as gaussian splats" role="img" />;
}
