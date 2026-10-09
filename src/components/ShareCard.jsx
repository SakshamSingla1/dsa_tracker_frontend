import { useEffect, useRef, useState } from "react";
import { FiCopy, FiDownload, FiShare2 } from "react-icons/fi";
import { fetchProgressSummary } from "../api/client.js";
import { computeSheetStats } from "./dashboard/date-utils.js";
import { LoadingState, ErrorState } from "./InlineState.jsx";
import { ACCENTS, DEFAULT_ACCENT } from "../theme/accents.js";
import { initials, computeLevel } from "./profileIdentity.js";
import { Button, Modal } from "./ui/index.js";

const WIDTH = 1200;
const HEIGHT = 630;

// Canvas can't read CSS custom properties, so the card's palette is a fixed dark theme
// lifted straight from index.css's dark tokens (easy/medium/hard). The accent, though, must
// match the *actual* accent the user has the app set to -- not an unrelated identity color --
// or the card looks like it's from a different app than the one they're using. Pull the exact
// dark-mode hex for their chosen accent (see draw()) rather than the light-mode `swatch` value,
// which is what the picker UI shows but not what's rendered anywhere in the app's dark theme.
const PALETTE = {
  bgFrom: "#0a0a0b",
  bgTo: "#16161a",
  ink: "#f4f4f5",
  inkSoft: "#9ca3af",
  easy: "#4ade80",
  medium: "#fbbf24",
  hard: "#f87171",
  line: "#27272a",
};

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [37, 99, 235];
}

function draw(canvas, { stats, user, accent }) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // The exact hex this accent renders as in the app's own dark theme -- not the lighter
  // `swatch` value the accent picker shows -- so the card matches what the user actually sees.
  const accentTheme = ACCENTS[accent]?.dark ?? ACCENTS[DEFAULT_ACCENT].dark;
  const accentHex = accentTheme.accent;
  const [ar, ag, ab] = hexToRgb(accentHex);
  const accentRgba = (a) => `rgba(${ar},${ag},${ab},${a})`;

  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, PALETTE.bgFrom);
  bg.addColorStop(1, PALETTE.bgTo);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle dot-grid texture for a less flat, more premium background.
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let y = 20; y < HEIGHT; y += 28) {
    for (let x = 20; x < WIDTH; x += 28) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const glow = ctx.createRadialGradient(WIDTH - 120, 100, 20, WIDTH - 120, 100, 460);
  glow.addColorStop(0, accentRgba(0.28));
  glow.addColorStop(1, accentRgba(0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Personalized accent-colored frame.
  ctx.strokeStyle = accentRgba(0.55);
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, WIDTH - 12, HEIGHT - 12);

  ctx.fillStyle = PALETTE.inkSoft;
  ctx.font = "600 20px 'Inter', sans-serif";
  ctx.fillText("DSA PROBLEM TRACKER · OVERALL PROGRESS", 64, 70);

  // Avatar circle + initials.
  const avatarCx = 96;
  const avatarCy = 148;
  ctx.beginPath();
  ctx.arc(avatarCx, avatarCy, 40, 0, Math.PI * 2);
  ctx.fillStyle = accentHex;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 30px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials(user?.displayName || user?.email) || "?", avatarCx, avatarCy + 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Name + level badge.
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 40px 'Inter', sans-serif";
  ctx.fillText(user?.displayName || "Anonymous solver", 156, 140);

  const level = computeLevel(stats.done).title;
  ctx.font = "700 20px 'Inter', sans-serif";
  const levelWidth = ctx.measureText(level).width;
  const badgeX = 156;
  const badgeY = 158;
  ctx.fillStyle = accentRgba(0.18);
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, levelWidth + 28, 34, 17);
  ctx.fill();
  ctx.fillStyle = accentHex;
  ctx.fillText(level, badgeX + 14, badgeY + 24);

  // Big solved/total number.
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "800 120px 'JetBrains Mono', monospace";
  ctx.fillText(`${stats.done}`, 64, 350);
  const doneWidth = ctx.measureText(`${stats.done}`).width;
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.font = "500 46px 'JetBrains Mono', monospace";
  ctx.fillText(`/ ${stats.total} solved`, 64 + doneWidth + 16, 350);

  // Streak badge.
  ctx.fillStyle = accentHex;
  ctx.font = "700 32px 'JetBrains Mono', monospace";
  ctx.fillText(`\u{1F525} ${stats.currentStreak}-day streak`, 64, 418);
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.font = "500 22px 'Inter', sans-serif";
  ctx.fillText(`longest streak ${stats.longestStreak} days · ${stats.bookmarked} bookmarked`, 64, 450);

  // Difficulty breakdown bars.
  const barY = 500;
  const barGap = 200;
  const diffs = [
    { key: "EASY", label: "Easy", color: PALETTE.easy },
    { key: "MEDIUM", label: "Medium", color: PALETTE.medium },
    { key: "HARD", label: "Hard", color: PALETTE.hard },
  ];
  diffs.forEach((d, i) => {
    const x = 64 + i * barGap;
    const bd = stats.byDifficulty?.[d.key] ?? { done: 0, total: 0 };
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = "600 18px 'Inter', sans-serif";
    ctx.fillText(d.label.toUpperCase(), x, barY);
    ctx.fillStyle = PALETTE.line;
    ctx.fillRect(x, barY + 14, 160, 10);
    const pct = bd.total === 0 ? 0 : bd.done / bd.total;
    ctx.fillStyle = d.color;
    ctx.fillRect(x, barY + 14, 160 * pct, 10);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = "600 16px 'JetBrains Mono', monospace";
    ctx.fillText(`${bd.done}/${bd.total}`, x, barY + 46);
  });

  ctx.fillStyle = PALETTE.inkSoft;
  ctx.font = "500 18px 'Inter', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("built with the DSA Problem Tracker", WIDTH - 64, HEIGHT - 40);
  ctx.textAlign = "left";
}

export default function ShareCard({ user, accent, onClose }) {
  const canvasRef = useRef(null);
  const [copyState, setCopyState] = useState("idle"); // idle | copied | unsupported
  const [allStats, setAllStats] = useState(null);
  const [error, setError] = useState(null);
  const clipboardSupported = typeof window !== "undefined" && "ClipboardItem" in window && navigator.clipboard?.write;
  const nativeShareSupported = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const load = () => {
    setError(null);
    fetchProgressSummary("all")
      .then((topics) => setAllStats(computeSheetStats(topics)))
      .catch(() => setError("Couldn't load your progress."));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (canvasRef.current && allStats) draw(canvasRef.current, { stats: allStats, user, accent });
  }, [allStats, user, accent]);

  const toBlob = () => new Promise((resolve) => canvasRef.current.toBlob(resolve));

  const handleDownload = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dsa-progress.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!clipboardSupported) {
      setCopyState("unsupported");
      return;
    }
    const blob = await toBlob();
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("unsupported");
    }
  };

  const handleNativeShare = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], "dsa-progress.png", { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "My DSA progress" });
    } catch {
      /* user cancelled the share sheet -- not an error */
    }
  };

  return (
    <Modal open onClose={onClose} title="Share your progress" size="lg">
      <div className="rounded-lg overflow-hidden bg-ink/[0.03] flex items-center justify-center min-h-[200px]">
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !allStats ? (
          <LoadingState label="Building your card…" />
        ) : (
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full h-auto" />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {allStats && clipboardSupported && (
          <Button variant="secondary" size="sm" icon={<FiCopy className="h-3.5 w-3.5" />} onClick={handleCopy}>
            {copyState === "copied" ? "Copied!" : "Copy image"}
          </Button>
        )}
        {allStats && nativeShareSupported && (
          <Button variant="secondary" size="sm" icon={<FiShare2 className="h-3.5 w-3.5" />} onClick={handleNativeShare}>
            Share&hellip;
          </Button>
        )}
        {allStats && (
          <Button variant="primary" size="sm" icon={<FiDownload className="h-3.5 w-3.5" />} onClick={handleDownload}>
            Download PNG
          </Button>
        )}
      </div>
      {copyState === "unsupported" && (
        <p className="text-[12px] text-ink-soft mt-2">Copy-to-clipboard isn't supported in this browser — try downloading instead.</p>
      )}
    </Modal>
  );
}
