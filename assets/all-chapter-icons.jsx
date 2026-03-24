import { useState } from "react";

/* ═══════════════════════════════════════════════════════════
   ALL 20 CHAPTER ICONS for edu.kimsh.kr
   
   PART I — Mathematics (10 chapters)
   01 Banach–Tarski: F₂ on S²         ✅ existing
   02 Can You Hear the Shape of a Drum? ✅ existing
   03 The Mathematics of Sound          ✅ existing
   04 Living in a Hyperbolic Space      ✅ existing
   05 Why do the polls look the same?   ✅ existing (CLT)
   06 Shapes Have Memories              🆕 homology
   07 Through the Symplectic Looking-Glass 🆕 symplectic
   08 Can You Measure Everything?       🆕 measure
   09 Making the Sun from a Single Bean 🆕 banach-tarski-2
   20 Searching for Perfect Illusions   🆕 projective geometry / vision
   
   PART II — Mathematics of ML (10 chapters)
   10 Does a Machine Think?             🆕 think
   11 Does a Machine See?               🆕 see
   12 Does a Machine Speak?             🆕 speak
   13 How Does Information Spread?      ✅ existing (diffusion1)
   14 Does a Machine Dream?             ✅ existing (diffusion2)
   15 Does a Machine Remember?          🆕 remember
   16 Does a Machine Understand?        ✅ existing (transformer)
   17 Does a Machine Imagine?           🆕 imagine
   18 Does a Machine Judge?             🆕 judge
   19 Does a Machine Suffer?            🆕 suffer
   ═══════════════════════════════════════════════════════════ */

const C = {
  space: "#6C9BFF",
  flow: "#FFB86C",
  sense: "#50FA7B",
  machine: "#FF79C6",
};

/* ─── 01 Banach–Tarski ─── */
function Icon01({ size = 56, color = C.space }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="15" stroke={color} strokeWidth="1" opacity="0.2" strokeDasharray="2.5 2.5" />
      <circle cx="20" cy="28" r="13" stroke={color} strokeWidth="1.3" fill={`${color}08`} />
      <ellipse cx="20" cy="28" rx="13" ry="5" stroke={color} strokeWidth="0.6" opacity="0.25" />
      <circle cx="37" cy="28" r="13" stroke={color} strokeWidth="1.3" fill={`${color}08`} />
      <ellipse cx="37" cy="28" rx="13" ry="5" stroke={color} strokeWidth="0.6" opacity="0.25" />
      <path d="M28 13 L28 43" stroke={color} strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2.5" />
    </svg>
  );
}

/* ─── 02 Shape of a Drum ─── */
function Icon02({ size = 56, color = C.sense }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="22" stroke={color} strokeWidth="1.4" fill={`${color}05`} />
      <line x1="28" y1="6" x2="28" y2="50" stroke={color} strokeWidth="1.1" opacity="0.5" />
      <circle cx="28" cy="28" r="13.5" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
      <text x="19" y="22" textAnchor="middle" fill={color} fontSize="8" fontFamily="serif" opacity="0.2">+</text>
      <text x="37" y="22" textAnchor="middle" fill={color} fontSize="8" fontFamily="serif" opacity="0.2">−</text>
      <text x="19" y="38" textAnchor="middle" fill={color} fontSize="8" fontFamily="serif" opacity="0.2">−</text>
      <text x="37" y="38" textAnchor="middle" fill={color} fontSize="8" fontFamily="serif" opacity="0.2">+</text>
      <circle cx="28" cy="28" r="24" stroke={color} strokeWidth="0.4" opacity="0.12" strokeDasharray="2 2" />
    </svg>
  );
}

/* ─── 03 Mathematics of Sound ─── */
function Icon03({ size = 56, color = C.sense }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d="M3 17 Q10 9 17 17 Q24 25 31 17 Q38 9 45 17 Q52 25 56 17" stroke={color} strokeWidth="1.4" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M3 30 Q6.5 24 10 30 Q13.5 36 17 30 Q20.5 24 24 30 Q27.5 36 31 30 Q34.5 24 38 30 Q41.5 36 45 30 Q48.5 24 52 30 Q55 36 56 30" stroke={color} strokeWidth="1" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M3 42 Q5 39 7 42 Q9 45 11 42 Q13 39 15 42 Q17 45 19 42 Q21 39 23 42 Q25 45 27 42 Q29 39 31 42 Q33 45 35 42 Q37 39 39 42 Q41 45 43 42 Q45 39 47 42 Q49 45 51 42 Q53 39 56 42" stroke={color} strokeWidth="0.7" fill="none" opacity="0.25" strokeLinecap="round" />
      <text x="53" y="52" fill={color} fontSize="7" fontFamily="serif" opacity="0.2">Σ</text>
    </svg>
  );
}

/* ─── 04 Hyperbolic Space ─── */
function Icon04({ size = 56, color = C.space }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="22" stroke={color} strokeWidth="1.4" fill={`${color}05`} />
      {/* Central geodesic triangle — arcs toward center */}
      <path d="M28 10 Q24 27 14 39" stroke={color} strokeWidth="1.1" fill="none" opacity="0.75" />
      <path d="M14 39 Q28 32 42 39" stroke={color} strokeWidth="1.1" fill="none" opacity="0.75" />
      <path d="M42 39 Q32 27 28 10" stroke={color} strokeWidth="1.1" fill="none" opacity="0.75" />
      <path d="M28 10 Q24 27 14 39 Q28 32 42 39 Q32 27 28 10 Z" fill={`${color}10`} />
      {/* Adjacent */}
      <path d="M42 39 Q40 29 48 18" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M48 18 Q36 17 28 10" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M14 39 Q16 29 8 18" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M8 18 Q20 17 28 10" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M14 39 Q21 42 28 48" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M28 48 Q35 42 42 39" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />
    </svg>
  );
}

/* ─── 05 CLT ─── */
function Icon05({ size = 56, color = C.flow }) {
  // e^{-x²/2}, x∈[-4,4]
  const curve = "M4 48 L7 48 L10 47.6 L13 46.4 L16 43.4 L19 37.4 L22 28.2 L25 18.4 L28 14 L31 18.4 L34 28.2 L37 37.4 L40 43.4 L43 46.4 L46 47.6 L49 48 L52 48";
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <path d={curve} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={curve + " L52 49 L4 49 Z"} fill={`${color}12`} />
      <line x1="28" y1="14" x2="28" y2="49" stroke={color} strokeWidth="0.5" opacity="0.2" strokeDasharray="2 2.5" />
      <line x1="4" y1="49" x2="52" y2="49" stroke={color} strokeWidth="0.4" opacity="0.15" />
    </svg>
  );
}

/* ─── 06 Shapes Have Memories (Homology) 🆕 ─── */
function Icon06({ size = 56, color = C.space }) {
  // Torus with two fundamental cycles highlighted (H₁ generators)
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Torus body — outer ellipse */}
      <ellipse cx="28" cy="28" rx="23" ry="14" stroke={color} strokeWidth="1.2" fill={`${color}05`} />
      {/* Torus hole — inner ellipse */}
      <ellipse cx="28" cy="28" rx="9" ry="5" stroke={color} strokeWidth="1" opacity="0.4" />
      {/* Top surface curve */}
      <path d="M5 28 Q12 18 28 18 Q44 18 51 28" stroke={color} strokeWidth="0.6" fill="none" opacity="0.2" />
      {/* Meridian cycle (α) — vertical loop around tube, highlighted */}
      <ellipse cx="40" cy="28" rx="5" ry="11" stroke={color} strokeWidth="1.8" opacity="0.7" strokeDasharray="0" />
      {/* Longitude cycle (β) — horizontal loop through hole, highlighted */}
      <ellipse cx="28" cy="30" rx="16" ry="8" stroke={color} strokeWidth="1.4" opacity="0.45" strokeDasharray="3 2" />
      {/* Labels */}
      <text x="47" y="22" fill={color} fontSize="6" fontFamily="serif" opacity="0.5" fontStyle="italic">α</text>
      <text x="11" y="42" fill={color} fontSize="6" fontFamily="serif" opacity="0.4" fontStyle="italic">β</text>
    </svg>
  );
}

/* ─── 07 Symplectic Looking-Glass 🆕 ─── */
function Icon07({ size = 56, color = C.space }) {
  // Phase space: Hamiltonian flow — concentric orbits + mirror axis
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Phase portrait — elliptical orbits (Hamiltonian conserves energy) */}
      <ellipse cx="20" cy="28" rx="12" ry="16" stroke={color} strokeWidth="0.9" fill="none" opacity="0.6" transform="rotate(-15 20 28)" />
      <ellipse cx="20" cy="28" rx="8" ry="11" stroke={color} strokeWidth="0.7" fill="none" opacity="0.45" transform="rotate(-15 20 28)" />
      <ellipse cx="20" cy="28" rx="4" ry="6" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" transform="rotate(-15 20 28)" />
      {/* Fixed point */}
      <circle cx="20" cy="28" r="1.5" fill={color} opacity="0.5" />
      {/* Mirror axis — the looking glass */}
      <line x1="28" y1="4" x2="28" y2="52" stroke={color} strokeWidth="0.8" opacity="0.25" strokeDasharray="2 2" />
      {/* Reflected / dual side — mirror symmetry */}
      <ellipse cx="36" cy="28" rx="12" ry="16" stroke={color} strokeWidth="0.9" fill="none" opacity="0.3" transform="rotate(15 36 28)" />
      <ellipse cx="36" cy="28" rx="8" ry="11" stroke={color} strokeWidth="0.7" fill="none" opacity="0.2" transform="rotate(15 36 28)" />
      <ellipse cx="36" cy="28" rx="4" ry="6" stroke={color} strokeWidth="0.5" fill="none" opacity="0.12" transform="rotate(15 36 28)" />
      <circle cx="36" cy="28" r="1.5" fill={color} opacity="0.2" />
      {/* ω symbol */}
      <text x="9" y="52" fill={color} fontSize="6.5" fontFamily="serif" opacity="0.25" fontStyle="italic">ω</text>
    </svg>
  );
}

/* ─── 08 Can You Measure Everything? 🆕 ─── */
function Icon08({ size = 56, color = C.space }) {
  // Unit interval with non-measurable gaps — Vitali-style
  // Full bar on top, then fragmented/impossible bars below
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Complete measurable interval [0,1] */}
      <rect x="8" y="10" width="40" height="5" rx="2" fill={color} opacity="0.5" />
      <text x="6" y="14" fill={color} fontSize="5" fontFamily="serif" opacity="0.3">0</text>
      <text x="49" y="14" fill={color} fontSize="5" fontFamily="serif" opacity="0.3">1</text>
      {/* Arrow down — decomposition */}
      <path d="M28 18 L28 23" stroke={color} strokeWidth="0.7" opacity="0.25" />
      <path d="M26 21 L28 24 L30 21" stroke={color} strokeWidth="0.7" fill="none" opacity="0.25" />
      {/* Fragmented pieces — non-measurable set */}
      <rect x="8" y="27" width="6" height="4" rx="1" fill={color} opacity="0.35" />
      <rect x="17" y="27" width="3" height="4" rx="1" fill={color} opacity="0.25" />
      <rect x="23" y="27" width="8" height="4" rx="1" fill={color} opacity="0.35" />
      <rect x="34" y="27" width="2" height="4" rx="1" fill={color} opacity="0.2" />
      <rect x="39" y="27" width="5" height="4" rx="1" fill={color} opacity="0.3" />
      <rect x="47" y="27" width="1" height="4" rx="0.5" fill={color} opacity="0.15" />
      {/* Question mark — can you measure this? */}
      <text x="28" y="45" textAnchor="middle" fill={color} fontSize="14" fontFamily="serif" opacity="0.25">?</text>
      {/* μ = ??? */}
      <text x="28" y="53" textAnchor="middle" fill={color} fontSize="5.5" fontFamily="serif" opacity="0.2" fontStyle="italic">μ = ???</text>
    </svg>
  );
}

/* ─── 09 Making the Sun from a Single Bean 🆕 ─── */
function Icon09({ size = 56, color = C.space }) {
  // Tiny bean shape → arrow → enormous sun/star
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Tiny bean (left) */}
      <ellipse cx="10" cy="30" rx="4" ry="5.5" stroke={color} strokeWidth="1" fill={`${color}15`} transform="rotate(-20 10 30)" />
      <path d="M8 26 Q10 29 8 33" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />
      {/* Arrow — transformation */}
      <path d="M17 30 L27 30" stroke={color} strokeWidth="0.8" opacity="0.3" strokeDasharray="1.5 1.5" />
      <path d="M25 28 L28 30 L25 32" stroke={color} strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
      {/* Sun (right) — large radiant circle */}
      <circle cx="40" cy="28" r="12" stroke={color} strokeWidth="1.3" fill={`${color}10`} />
      {/* Rays */}
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const rad = a * Math.PI / 180;
        const x1 = 40 + 13 * Math.cos(rad);
        const y1 = 28 + 13 * Math.sin(rad);
        const x2 = 40 + 17 * Math.cos(rad);
        const y2 = 28 + 17 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i%2===0?"1":"0.6"} opacity={i%2===0?0.4:0.2} strokeLinecap="round" />;
      })}
      {/* ∞ inside sun */}
      <text x="40" y="31" textAnchor="middle" fill={color} fontSize="8" fontFamily="serif" opacity="0.3">∞</text>
    </svg>
  );
}

/* ─── 10 Does a Machine Think? 🆕 ─── */
function Icon10({ size = 56, color = C.machine }) {
  // Single perceptron / logic gate: inputs → weighted sum → activation → output
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Input nodes */}
      <circle cx="8" cy="14" r="3" fill={`${color}25`} stroke={color} strokeWidth="0.7" />
      <circle cx="8" cy="28" r="3" fill={`${color}25`} stroke={color} strokeWidth="0.7" />
      <circle cx="8" cy="42" r="3" fill={`${color}25`} stroke={color} strokeWidth="0.7" />
      {/* Input labels */}
      <text x="8" y="16" textAnchor="middle" fill={color} fontSize="4" fontFamily="monospace" opacity="0.4">0</text>
      <text x="8" y="30" textAnchor="middle" fill={color} fontSize="4" fontFamily="monospace" opacity="0.4">1</text>
      <text x="8" y="44" textAnchor="middle" fill={color} fontSize="4" fontFamily="monospace" opacity="0.4">1</text>
      {/* Connections with weights */}
      <line x1="11" y1="14" x2="25" y2="28" stroke={color} strokeWidth="0.5" opacity="0.3" />
      <line x1="11" y1="28" x2="25" y2="28" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="11" y1="42" x2="25" y2="28" stroke={color} strokeWidth="1" opacity="0.5" />
      {/* Neuron body — summation */}
      <circle cx="28" cy="28" r="6" stroke={color} strokeWidth="1.3" fill={`${color}12`} />
      <text x="28" y="31" textAnchor="middle" fill={color} fontSize="7" fontFamily="serif" opacity="0.5">σ</text>
      {/* Output */}
      <line x1="34" y1="28" x2="44" y2="28" stroke={color} strokeWidth="1" opacity="0.5" />
      <circle cx="48" cy="28" r="3" fill={`${color}45`} stroke={color} strokeWidth="0.9" />
      <text x="48" y="30" textAnchor="middle" fill={color} fontSize="4" fontFamily="monospace" opacity="0.5">1</text>
      {/* Step/sigmoid hint */}
      <path d="M39 38 L42 38 Q43 38 43 35 L43 34 Q43 31 44 31 L47 31" stroke={color} strokeWidth="0.6" fill="none" opacity="0.2" />
    </svg>
  );
}

/* ─── 11 Does a Machine See? 🆕 ─── */
function Icon11({ size = 56, color = C.machine }) {
  // Convolution kernel scanning over a pixel grid — edge detection
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Pixel grid (5×5) */}
      {[0,1,2,3,4].map(r => [0,1,2,3,4].map(c => {
        // Gradient: darker in a diagonal band (an "edge")
        const onEdge = Math.abs(r - c) <= 0.5;
        const near = Math.abs(r - c) <= 1.5;
        const op = onEdge ? 0.5 : near ? 0.25 : 0.08;
        return <rect key={`${r}${c}`} x={6+c*7} y={6+r*7} width={6} height={6} rx={1} fill={color} opacity={op} />;
      }))}
      {/* 3×3 Convolution kernel overlay */}
      <rect x="12.5" y="12.5" width="21" height="21" rx={2} stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* Kernel weights hint */}
      <text x="17" y="20" textAnchor="middle" fill={color} fontSize="4.5" fontFamily="monospace" opacity="0.4">-1</text>
      <text x="23" y="27" textAnchor="middle" fill={color} fontSize="5" fontFamily="monospace" opacity="0.5">8</text>
      <text x="30" y="31" textAnchor="middle" fill={color} fontSize="4.5" fontFamily="monospace" opacity="0.4">-1</text>
      {/* Output feature arrow */}
      <path d="M44 28 L50 28" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <path d="M48 26 L51 28 L48 30" stroke={color} strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
      {/* Output pixel */}
      <rect x="46" y="14" width="6" height="6" rx={1} fill={color} opacity="0.45" />
    </svg>
  );
}

/* ─── 12 Does a Machine Speak? 🆕 ─── */
function Icon12({ size = 56, color = C.machine }) {
  // Waveform → spectrogram: time-domain to frequency-domain
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Waveform (top) */}
      <path d="M4 16 Q7 10 10 16 Q13 22 16 16 Q18 12 20 16 Q23 22 26 14 Q28 10 30 16 Q33 22 36 16 Q38 12 40 16 Q43 20 46 16 Q48 13 50 16" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
      {/* Transform arrow */}
      <path d="M28 24 L28 30" stroke={color} strokeWidth="0.7" opacity="0.25" />
      <text x="32" y="28" fill={color} fontSize="4.5" fontFamily="serif" opacity="0.2" fontStyle="italic">F</text>
      {/* Spectrogram bars (bottom) — frequency bins */}
      {[
        [6, 0.7], [10, 0.4], [14, 0.9], [18, 0.3], [22, 0.5],
        [26, 0.8], [30, 0.6], [34, 0.35], [38, 0.75], [42, 0.2], [46, 0.55],
      ].map(([x, h], i) => (
        <rect key={i} x={x} y={48 - h * 16} width={3} height={h * 16} rx={1}
          fill={color} opacity={0.15 + h * 0.35} />
      ))}
      {/* Axis labels */}
      <text x="3" y="17" fill={color} fontSize="3.5" fontFamily="serif" opacity="0.15" fontStyle="italic">t</text>
      <text x="3" y="45" fill={color} fontSize="3.5" fontFamily="serif" opacity="0.15" fontStyle="italic">f</text>
    </svg>
  );
}

/* ─── 13 Diffusion I (existing) ─── */
function Icon13({ size = 56, color = C.flow }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="2.5" fill={color} opacity="0.7" />
      <circle cx="28" cy="28" r="7" stroke={color} strokeWidth="1.3" opacity="0.55" />
      <circle cx="28" cy="28" r="12" stroke={color} strokeWidth="1.1" opacity="0.4" />
      <circle cx="28" cy="28" r="17" stroke={color} strokeWidth="0.9" opacity="0.25" />
      <circle cx="28" cy="28" r="22" stroke={color} strokeWidth="0.7" opacity="0.13" />
      <text x="28" y="54" textAnchor="middle" fill={color} fontSize="6" fontFamily="serif" opacity="0.2">∂t</text>
    </svg>
  );
}

/* ─── 14 Diffusion II (existing) ─── */
function Icon14({ size = 56, color = C.machine }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {[[5,8],[9,5],[4,13],[10,12],[7,18],[12,20],[4,24],[9,27],[5,32],[10,34],[8,40],[4,44],[9,48],[12,15],[7,10]]
        .map(([x,y],i) => <circle key={i} cx={x} cy={y} r={1} fill={color} opacity={0.1+(i%5)*0.04} />)}
      <path d="M18 28 L38 28" stroke={color} strokeWidth="0.9" opacity="0.3" strokeDasharray="2 2" />
      <path d="M36 26 L39 28 L36 30" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" strokeLinecap="round" />
      <circle cx="46" cy="20" r="6.5" stroke={color} strokeWidth="1.3" fill={`${color}12`} opacity="0.8" />
      <path d="M40 42 L46 31 L52 42 Z" stroke={color} strokeWidth="1.1" fill={`${color}08`} opacity="0.6" />
      <text x="28" y="54" textAnchor="middle" fill={color} fontSize="5" fontFamily="serif" opacity="0.2">∇ log p</text>
    </svg>
  );
}

/* ─── 15 Does a Machine Remember? 🆕 ─── */
function Icon15({ size = 56, color = C.machine }) {
  // Hopfield network: recurrent connections — nodes in a loop with full connectivity
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Ring of nodes — recurrent memory */}
      {[0,1,2,3,4,5].map(i => {
        const a = (i * 60 - 90) * Math.PI / 180;
        const x = 28 + 16 * Math.cos(a);
        const y = 28 + 16 * Math.sin(a);
        return <circle key={`n${i}`} cx={x} cy={y} r="4" fill={`${color}30`} stroke={color} strokeWidth="0.8" />;
      })}
      {/* Full recurrent connections (selected for clarity) */}
      {[[0,2],[0,3],[1,3],[1,4],[2,4],[2,5],[3,5],[0,4],[1,5]].map(([a,b], i) => {
        const a1 = (a * 60 - 90) * Math.PI / 180;
        const a2 = (b * 60 - 90) * Math.PI / 180;
        return <line key={i}
          x1={28 + 16 * Math.cos(a1)} y1={28 + 16 * Math.sin(a1)}
          x2={28 + 16 * Math.cos(a2)} y2={28 + 16 * Math.sin(a2)}
          stroke={color} strokeWidth="0.5" opacity={0.15 + (i%3)*0.07} />;
      })}
      {/* Self-loop arrow on one node — recurrence */}
      <path d="M28 8 Q22 2 18 8" stroke={color} strokeWidth="0.7" fill="none" opacity="0.35" />
      <path d="M19 6 L18 9 L21 8" stroke={color} strokeWidth="0.5" fill="none" opacity="0.35" strokeLinecap="round" />
      {/* Energy well hint */}
      <text x="28" y="31" textAnchor="middle" fill={color} fontSize="6" fontFamily="serif" opacity="0.25" fontStyle="italic">E</text>
    </svg>
  );
}

/* ─── 16 Transformer (existing) ─── */
function Icon16({ size = 56, color = C.machine }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {[0,1,2,3,4].map(i => (
        <g key={`t${i}`}>
          <rect x={13+i*7.5} y={5} width={5.5} height={4} rx={1} fill={color} opacity={0.2+i*0.05} />
          <rect x={4} y={13+i*7.5} width={5.5} height={4} rx={1} fill={color} opacity={0.2+i*0.05} />
        </g>
      ))}
      {[
        [0,0,0.9],[0,1,0.15],[0,2,0.1],[0,3,0.05],[0,4,0.05],
        [1,0,0.3],[1,1,0.7],[1,2,0.2],[1,3,0.1],[1,4,0.05],
        [2,0,0.1],[2,1,0.2],[2,2,0.5],[2,3,0.4],[2,4,0.1],
        [3,0,0.05],[3,1,0.1],[3,2,0.3],[3,3,0.6],[3,4,0.3],
        [4,0,0.05],[4,1,0.05],[4,2,0.1],[4,3,0.3],[4,4,0.8],
      ].map(([r,c,w]) => (
        <rect key={`a${r}${c}`} x={13+c*7.5} y={13+r*7.5} width={5.5} height={5.5} rx={1} fill={color} opacity={w*0.55} />
      ))}
      <text x="50" y="54" textAnchor="end" fill={color} fontSize="5" fontFamily="serif" opacity="0.2">QKᵀ</text>
    </svg>
  );
}

/* ─── 17 Does a Machine Imagine? 🆕 ─── */
function Icon17({ size = 56, color = C.machine }) {
  // GAN: Generator (G) and Discriminator (D) in adversarial tension
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Generator side */}
      <circle cx="14" cy="28" r="10" stroke={color} strokeWidth="1.2" fill={`${color}08`} />
      <text x="14" y="31" textAnchor="middle" fill={color} fontSize="9" fontFamily="serif" opacity="0.5" fontStyle="italic">G</text>
      {/* Discriminator side */}
      <circle cx="42" cy="28" r="10" stroke={color} strokeWidth="1.2" fill={`${color}08`} />
      <text x="42" y="31" textAnchor="middle" fill={color} fontSize="9" fontFamily="serif" opacity="0.5" fontStyle="italic">D</text>
      {/* Adversarial arrows — pushing against each other */}
      <path d="M25 24 L31 24" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M29 22 L32 24 L29 26" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M31 32 L25 32" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M27 30 L24 32 L27 34" stroke={color} strokeWidth="0.8" fill="none" opacity="0.5" strokeLinecap="round" />
      {/* Output: generated image (small star/shape emerging) */}
      <path d="M14 12 L15.5 8 L17 12 L20 10 L18 13.5 L22 14 L18 16 L20 19 L17 17 L15.5 21 L14 17 L11 19 L13 16 L9 14 L13 13.5 L11 10 Z"
        stroke={color} strokeWidth="0.5" fill={`${color}20`} opacity="0.4" />
      {/* min max */}
      <text x="28" y="50" textAnchor="middle" fill={color} fontSize="4.5" fontFamily="serif" opacity="0.2">min max V(G,D)</text>
    </svg>
  );
}

/* ─── 18 Does a Machine Judge? 🆕 ─── */
function Icon18({ size = 56, color = C.machine }) {
  // Balance scale with decision boundary — algorithmic fairness
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Fulcrum */}
      <path d="M24 44 L28 38 L32 44" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
      {/* Balance beam — tilted slightly to show imbalance */}
      <line x1="10" y1="30" x2="46" y2="26" stroke={color} strokeWidth="1.3" opacity="0.6" />
      {/* Pivot */}
      <circle cx="28" cy="28" r="2" fill={color} opacity="0.4" />
      {/* Left pan — dots (group A) */}
      <path d="M6 30 L10 30 Q10 36 8 36 L6 30 Z" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />
      {[
        [7, 33], [9, 32], [8, 35],
      ].map(([x,y], i) => <circle key={`a${i}`} cx={x} cy={y} r="1.2" fill={color} opacity="0.4" />)}
      {/* Right pan — dots (group B) */}
      <path d="M42 26 L46 26 Q46 32 44 32 L42 26 Z" stroke={color} strokeWidth="0.6" fill="none" opacity="0.3" />
      {[
        [43, 28], [45, 29], [44, 31],
      ].map(([x,y], i) => <circle key={`b${i}`} cx={x} cy={y} r="1.2" fill={color} opacity="0.4" />)}
      {/* Decision boundary line across the top */}
      <line x1="8" y1="14" x2="48" y2="14" stroke={color} strokeWidth="0.7" opacity="0.2" strokeDasharray="2 2" />
      {/* Dots above/below boundary — classified */}
      {[[12,10],[18,11],[24,8],[34,17],[40,18],[46,16],[14,18],[28,17],[38,9],[44,10]].map(([x,y],i) => (
        <circle key={`d${i}`} cx={x} cy={y} r="1.5" fill={color} opacity={y < 14 ? 0.4 : 0.15} />
      ))}
      {/* ≠ fairness tension */}
      <text x="28" y="52" textAnchor="middle" fill={color} fontSize="5" fontFamily="serif" opacity="0.2">P(ŷ|a) ≠ P(ŷ|b)?</text>
    </svg>
  );
}

/* ─── 19 Does a Machine Suffer? 🆕 ─── */
function Icon19({ size = 56, color = C.machine }) {
  // A single blood drop — simple, visceral, unanswerable
  // The drop shape: teardrop/blood drop via cubic bezier
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Blood drop */}
      <path
        d="M28 8 C28 8 16 26 16 34 C16 40.6 21.4 46 28 46 C34.6 46 40 40.6 40 34 C40 26 28 8 28 8 Z"
        stroke={color} strokeWidth="1.4" fill={`${color}15`}
      />
      {/* Inner highlight — a small reflection to give it volume */}
      <path
        d="M24 32 C24 28 28 18 28 18 C28 18 22 30 22 34 C22 37 24.5 39.5 28 39.5"
        stroke={color} strokeWidth="0.6" fill="none" opacity="0.2"
      />
    </svg>
  );
}

/* ─── 20 Searching for Perfect Illusions 🆕 ─── */
function Icon20({ size = 56, color = C.sense }) {
  // Perspective grid converging to a vanishing point — an eye at the apex
  // Projective geometry: 3D → 2D projection, the mathematics of vision
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Vanishing point — pupil */}
      <circle cx="28" cy="22" r="2" fill={color} opacity="0.6" />

      {/* Perspective lines radiating from vanishing point downward */}
      <line x1="28" y1="22" x2="4" y2="50" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="28" y1="22" x2="52" y2="50" stroke={color} strokeWidth="0.9" opacity="0.4" />
      <line x1="28" y1="22" x2="12" y2="50" stroke={color} strokeWidth="0.6" opacity="0.25" />
      <line x1="28" y1="22" x2="44" y2="50" stroke={color} strokeWidth="0.6" opacity="0.25" />
      <line x1="28" y1="22" x2="20" y2="50" stroke={color} strokeWidth="0.5" opacity="0.18" />
      <line x1="28" y1="22" x2="36" y2="50" stroke={color} strokeWidth="0.5" opacity="0.18" />
      <line x1="28" y1="22" x2="28" y2="50" stroke={color} strokeWidth="0.7" opacity="0.3" />

      {/* Receding floor grid — horizontal lines */}
      <line x1="18" y1="34" x2="38" y2="34" stroke={color} strokeWidth="0.5" opacity="0.15" />
      <line x1="13" y1="39" x2="43" y2="39" stroke={color} strokeWidth="0.5" opacity="0.18" />
      <line x1="8" y1="44" x2="48" y2="44" stroke={color} strokeWidth="0.5" opacity="0.2" />

      {/* Eye shape around vanishing point — the observer's eye */}
      <path d="M16 22 Q22 14 28 12 Q34 14 40 22" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />
      <path d="M16 22 Q22 30 28 32 Q34 30 40 22" stroke={color} strokeWidth="1.2" fill="none" opacity="0.55" />

      {/* Iris */}
      <circle cx="28" cy="22" r="5.5" stroke={color} strokeWidth="0.7" fill="none" opacity="0.3" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   ICON MAP
   ═══════════════════════════════════════════ */

const allIcons = {
  "01": Icon01, "02": Icon02, "03": Icon03, "04": Icon04, "05": Icon05,
  "06": Icon06, "07": Icon07, "08": Icon08, "09": Icon09,
  "10": Icon10, "11": Icon11, "12": Icon12, "13": Icon13, "14": Icon14,
  "15": Icon15, "16": Icon16, "17": Icon17, "18": Icon18, "19": Icon19,
  "20": Icon20,
};

const chapters = [
  { part: "I", partTitle: "Mathematics", items: [
    { num: "01", title: "Banach–Tarski: F₂ on S²", sub: "One ball becomes two" },
    { num: "02", title: "Can You Hear the Shape of a Drum?", sub: "Spectral geometry made audible" },
    { num: "03", title: "The Mathematics of Sound", sub: "Pythagoras to your smartphone" },
    { num: "04", title: "Living in a Hyperbolic Space", sub: "Beyond the parallel postulate" },
    { num: "05", title: "Why Do the Polls Look the Same?", sub: "The inevitable bell curve" },
    { num: "06", title: "Shapes Have Memories", sub: "Holes, loops, and homology", tag: "NEW" },
    { num: "07", title: "Through the Symplectic Looking-Glass", sub: "Phase space and mirror symmetry", tag: "NEW" },
    { num: "08", title: "Can You Measure Everything?", sub: "The paradox of volume", tag: "NEW" },
    { num: "09", title: "Making the Sun from a Single Bean", sub: "Banach–Tarski retold", tag: "NEW" },
    { num: "20", title: "Searching for Perfect Illusions", sub: "Projective geometry and the mathematics of vision", tag: "NEW" },
  ]},
  { part: "II", partTitle: "Mathematics of Machine Learning", items: [
    { num: "10", title: "Does a Machine Think?", sub: "From logic gates to neural networks", tag: "NEW" },
    { num: "11", title: "Does a Machine See?", sub: "Convolution and computer vision", tag: "NEW" },
    { num: "12", title: "Does a Machine Speak?", sub: "Fourier transforms to speech synthesis", tag: "NEW" },
    { num: "13", title: "How Does Information Spread?", sub: "Diffusion Part 1/2" },
    { num: "14", title: "Does a Machine Dream?", sub: "Diffusion Part 2/2" },
    { num: "15", title: "Does a Machine Remember?", sub: "Hopfield networks & associative memory", tag: "NEW" },
    { num: "16", title: "Does a Machine Understand?", sub: "The Transformer, made visible" },
    { num: "17", title: "Does a Machine Imagine?", sub: "GANs and adversarial creation", tag: "NEW" },
    { num: "18", title: "Does a Machine Judge?", sub: "Algorithmic fairness & impossibility", tag: "NEW" },
    { num: "19", title: "Does a Machine Suffer?", sub: "Consciousness & integrated information", tag: "NEW" },
  ]},
];

const partColors = { "I": C.space, "II": C.machine };

/* ═══════════════════════════════════════════
   GALLERY VIEW
   ═══════════════════════════════════════════ */

function ChapterCard({ ch, partColor }) {
  const [h, setH] = useState(false);
  const Icon = allIcons[ch.num];
  return (
    <div
      onPointerEnter={() => setH(true)}
      onPointerLeave={() => setH(false)}
      style={{
        display: "flex", gap: 14, alignItems: "center",
        background: h ? `${partColor}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${h ? `${partColor}30` : "rgba(255,255,255,0.05)"}`,
        borderRadius: 16, padding: "10px 14px", cursor: "pointer",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        transform: h ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{
        flexShrink: 0, width: 60, height: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: h ? `${partColor}12` : `${partColor}06`,
        borderRadius: 14, border: `1px solid ${h ? `${partColor}22` : `${partColor}10`}`,
        transition: "all 0.3s",
      }}>
        {Icon && <Icon size={54} color={partColor} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{
            fontSize: 10, color: `${partColor}60`, fontFamily: "monospace",
          }}>{ch.num}</span>
          <span style={{
            fontSize: 13.5, fontWeight: 600, color: "#e4e4e4",
            fontFamily: "'Newsreader','Georgia',serif",
          }}>{ch.title}</span>
          {ch.tag && <span style={{
            fontSize: 8, padding: "1px 5px", borderRadius: 6,
            background: `${partColor}20`, color: partColor,
            fontFamily: "monospace", fontWeight: 600,
          }}>{ch.tag}</span>}
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4,
          fontFamily: "-apple-system,sans-serif",
        }}>{ch.sub}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={{
      minHeight: "100vh", background: "#08080a",
      display: "flex", justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 480, width: "100%" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 300, margin: "0 0 4px",
          fontFamily: "'Newsreader',serif", color: "#f0f0f0",
          lineHeight: 1.15, letterSpacing: "-0.03em",
        }}>
          Interactive <span style={{ fontWeight: 500, fontStyle: "italic" }}>Mathematics</span>
        </h1>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,0.2)",
          fontFamily: "monospace", marginBottom: 32,
          letterSpacing: "0.1em",
        }}>ALL 20 CHAPTER ICONS</div>

        {chapters.map(part => (
          <div key={part.part} style={{ marginBottom: 36 }}>
            <div style={{
              display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14,
              borderBottom: `1px solid ${partColors[part.part]}18`,
              paddingBottom: 8,
            }}>
              <span style={{
                fontSize: 13, fontFamily: "monospace",
                color: partColors[part.part], opacity: 0.6,
              }}>Part {part.part}</span>
              <span style={{
                fontSize: 16, fontFamily: "'Newsreader',serif",
                color: partColors[part.part], fontWeight: 500,
              }}>{part.partTitle}</span>
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.2)",
                fontFamily: "monospace",
              }}>{part.items.length} ch.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {part.items.map(ch => (
                <ChapterCard key={ch.num} ch={ch} partColor={partColors[part.part]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
