import React, { useEffect, useRef, useState } from "react";

const MAX_ENTRIES = 500;
const LABEL_DISPLAY_LIMIT = 58;
const SIWRSOA_LOGO_SRC = "/logo.png";

const STORAGE_KEY = "siwrsoa_roleta_data";

const COLOR_PALETTE = [
  "#3AA7D6",
  "#2F8CC4",
  "#1F6FB2",
  "#1E5AA6",
  "#1F4E9A",
  "#4FB6E5",
  "#6CC6EC",
  "#2B7FB8",
  "#1D4A8F",
  "#5ABBE8",
];

const DEFAULT_ENTRIES = [
"ABROX Water Refilling Station",
"AguaSol Water Refilling Station",
"ALJUNS Water Refilling Station",
"Aqua Doz Water Refilling Station",
"Aqua King Water Refilling Station",
"AQUA PISCES Water Refilling Station",
"Aqua Star Refilling Station",
"Aqua-Cris Water Refueling Station",
"Aquajam Water Refilling Station",
"Bhon-Bhon Refilling Station",
"Cherith Water Refilling Station",
"D'Lordia Water Refilling Station",
"Don2 Lan Water Refilling Station",
"EC Brothers",
"Gabrean Water Refilling Station",
"God's Gift Water Refilling Station",
"Grains Multipurpose Cooperative",
"H2O Pure Water Refilling Station",
"Hidden Ridge Water Refilling Station",
"HYDROMZ Water Refilling Station",
"Island Fresh Water Refilling Station",
"Island Crystallyn Water Refilling Station",
"Jamillo Water Refilling Station",
"Jecking Ozone Pure Alkaline Purified Mineral Water",
"Jerah Refilling Station",
"John Carl Water Refilling Station",
"Joshshine Water Refilling Station",
"JRP Aquaclear Water Refilling Station",
"JS Water Refilling Station",
"Jungle Spring Water Refilling Station",
"Khing's Water Purification",
"Kiwi Water Refilling Station",
"La Jumilla Water Refilling Station",
"LASSAH Water Refilling Station",
"Purely Hydrated Water Refilling Station",
"R & A Cabunita Refilling",
"Rich Water Refilling Station",
"Rock Mountain Drops Water Refilling Station",
"Rubin Water Refilling Station",
"Shaira Water Refilling Station",
"Snowpi Water Refilling Station",
"Titing Catubig Water Refilling Station",
"WATER MED Refilling Station",
"Yuan Water Refilling Station",
"Zion's Dew Water Refilling Station",
"Adjivani, Salima B.",
"Boston, Dondon",
"Talicud Living Water",
"Dagcuta, Patrick",
"Doctolero, Donald M.",
"JCJ Refilling Station",
"Daymoy Water Refilling Station",
"TOMNET Water Refilling Station",
"Jayelou Water Refilling Station",
"Villa-abrille, Joseph Brian Luz",
"Salima Adilani",
"Montebon, Carmenchita",
"Precious Drop Refilling Station"
];

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clampItems(items) {
  return items.map((item) => item.trim()).filter(Boolean).slice(0, MAX_ENTRIES);
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function getWinningIndex(rotation, count) {
  const normalized = ((rotation % 360) + 360) % 360;
  const slice = 360 / count;
  const pointerAngle = (360 - normalized) % 360;
  return Math.floor(pointerAngle / slice) % count;
}

function Wheel({ items, rotation }) {
  const size = 420;
  const radius = 190;
  const center = size / 2;
  const sliceAngle = 360 / items.length;

  return (
    <div className="relative w-full max-w-[460px] aspect-square">
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[18px] border-r-[18px] border-t-[34px] border-l-transparent border-r-transparent border-t-black" />
      </div>

      <div
        style={{ transform: `rotate(${rotation}deg)`, transition: "transform 5s ease-out" }}
      >
        <svg viewBox={`0 0 ${size} ${size}`}>
          {items.map((item, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            return (
              <path
                key={i}
                d={describeSlice(center, center, radius, startAngle, endAngle)}
                fill={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                stroke="#fff"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  const saved = loadFromStorage();

  const [entries, setEntries] = useState(saved?.entries || DEFAULT_ENTRIES);
  const [bulkText, setBulkText] = useState((saved?.entries || DEFAULT_ENTRIES).join("\\n"));
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState("");
  const [lastWinnerIndex, setLastWinnerIndex] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    saveToStorage({ entries });
  }, [entries]);

  function syncEntries(next) {
    const clean = clampItems(next);
    setEntries(clean);
    setBulkText(clean.join("\n"));
  }

  function spinWheel() {
    if (isSpinning || entries.length < 2) return;

    setIsSpinning(true);
    const count = entries.length;
    const selectedIndex = Math.floor(Math.random() * count);

    const sliceAngle = 360 / count;
    const center = selectedIndex * sliceAngle + sliceAngle / 2;
    const target = 360 - center;
    const nextRotation = rotation + 360 * 5 + target;

    setRotation(nextRotation);

    timeoutRef.current = window.setTimeout(() => {
      const finalIndex = getWinningIndex(nextRotation, count);
      setWinner(entries[finalIndex]);
      setLastWinnerIndex(finalIndex);
      setIsSpinning(false);
    }, 5000);
  }

  function removeWinner() {
    if (lastWinnerIndex === null) return;
    const next = entries.filter((_, i) => i !== lastWinnerIndex);
    syncEntries(next);
    setWinner("");
    setLastWinnerIndex(null);
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">4th SIWRSOA General Assembly Grand Raffle</h1>

      <Wheel items={entries} rotation={rotation} />

      <button onClick={spinWheel} className="mt-4 bg-white text-black px-4 py-2">Spin</button>

      <div className="mt-4 text-xl">Winner: {winner}</div>

      {winner && (
        <button onClick={removeWinner} className="mt-2 bg-red-500 px-4 py-2">
          Remove Winner
        </button>
      )}

      <textarea
        className="w-full mt-4 text-black"
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
      />

      <button onClick={() => syncEntries(bulkText.split("\n"))} className="mt-2 bg-white text-black px-4 py-2">
        Apply List
      </button>
    </div>
  );
}
