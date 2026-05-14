import { useNavigate } from "@tanstack/react-router";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "./icon";

interface HeroProps {
  onSignUp?: () => void;
  onExplore?: () => void;
}

const AVATARS = [
  { i: "OJ", bg: "var(--shamba-emerald)" },
  { i: "NS", bg: "#3B82F6" },
  { i: "TP", bg: "var(--shamba-amber)" },
  { i: "AK", bg: "#EC4899" },
  { i: "RM", bg: "#8B5CF6" },
];

const LISTINGS = [
  {
    emoji: "🍅",
    name: "Fresh Tomatoes",
    farmer: "Nakato Sarah",
    price: "1,200",
    badge: "fresh",
    bc: "var(--shamba-emerald)",
    bb: "rgba(0,196,113,0.2)",
  },
  {
    emoji: "🍯",
    name: "Organic Honey",
    farmer: "Tumuhaise Peter",
    price: "25,000",
    badge: "verified",
    bc: "#60A5FA",
    bb: "rgba(59,130,246,0.2)",
  },
  {
    emoji: "🌽",
    name: "Grade A Maize",
    farmer: "Okello James",
    price: "850",
    badge: "new",
    bc: "var(--shamba-amber)",
    bb: "rgba(200,131,58,0.2)",
  },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <section
        className="relative overflow-hidden flex flex-col min-h-screen bg-forest-texture2"
        style={{ backgroundColor: "var(--shamba-forest)" }}
      >
        <div className="flex-1 flex items-center px-6 pt-25 pb-20 max-w-310 mx-auto w-full gap-14">
          {/* ── Left copy ── */}
          <div className="shrink-0 max-w-145 w-full">
            <div className="mb-6 animate-fade-up">
              <Badge
                variant="outline"
                className="text-xs font-semibold tracking-wide font-body"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.85)",
                  borderRadius: 99,
                  padding: "5px 14px",
                }}
              >
                <span className="mr-1.5" style={{ color: "var(--shamba-emerald)" }}>
                  ●
                </span>
                Uganda's #1 Agricultural Marketplace
              </Badge>
            </div>

            <h1
              className="font-display font-black text-white leading-[1.05] tracking-tight mb-7 animate-fade-up delay-100"
              style={{ fontSize: "clamp(40px,6vw,72px)" }}
            >
              The farm market
              <br />
              <em
                className="not-italic"
                style={{ color: "var(--shamba-emerald)", fontStyle: "italic" }}
              >
                your harvest
              </em>
              <br />
              deserves.
            </h1>

            <p
              className="text-white/65 leading-[1.75] mb-10 animate-fade-up delay-200"
              style={{ fontSize: "clamp(15px,2vw,18px)", maxWidth: 460 }}
            >
              Connect with 12,400 verified Ugandan farmers. Buy and sell fresh produce, track live
              prices, diagnose crop diseases with AI, and grow your income.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 animate-fade-up delay-300">
              <Button
                onClick={() => {
                  navigate({ to: "/auth/sign-up" });
                }}
                className="hover:-translate-y-0.5 transition-all gap-2 font-body font-bold"
                style={{
                  background: "var(--shamba-emerald)",
                  color: "var(--shamba-forest)",
                  padding: "15px 32px",
                  borderRadius: 16,
                  fontSize: 16,
                  height: "auto",
                }}
              >
                Start for Free <Icon name="arrow" size={18} color="var(--shamba-forest)" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigate({ to: "/home" });
                }}
                className="flex justify-between items-center hover:-translate-y-0.5 transition-all gap-2 font-body   h-auto bg-transparent text-[15px] border-r-16"
                style={{ padding: "15px 28px", fontSize: 15 }}
              >
                <Icon name="play" size={18} color="white" /> See How It Works
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 animate-fade-up delay-400">
              <div className="flex">
                {AVATARS.map((av, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center font-display text-[11px] font-bold text-white shrink-0 relative"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: av.bg,
                      border: "2px solid var(--shamba-forest)",
                      marginLeft: i > 0 ? -10 : 0,
                      zIndex: AVATARS.length - i,
                    }}
                  >
                    {av.i}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Trusted by 12,400+ farmers</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Icon key={i} name="star" size={12} color="var(--shamba-amber)" />
                  ))}
                  <span className="text-white/50 text-xs ml-1.5">4.9 / 5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right dashboard card ── */}
          <div className="hidden lg:block flex-1 relative min-h-120 animate-slide-left delay-300">
            <div
              className="rounded-[28px] p-6 backdrop-blur-xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {/* Chart */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-display font-semibold text-white text-base">
                    Live Maize Price · Gulu
                  </span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,196,113,0.2)", color: "var(--shamba-emerald)" }}
                  >
                    ▲ +3.2%
                  </span>
                </div>
                <svg viewBox="0 0 320 80" className="w-full h-20">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--shamba-emerald)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--shamba-emerald)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points="0,60 40,52 80,58 120,44 160,48 200,35 240,38 280,28 320,22 320,80 0,80"
                    fill="url(#cg)"
                    stroke="none"
                  />
                  <polyline
                    className="chart-line"
                    points="0,60 40,52 80,58 120,44 160,48 200,35 240,38 280,28 320,22"
                    fill="none"
                    stroke="var(--shamba-emerald)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="320" cy="22" r="5" fill="var(--shamba-emerald)" />
                  <circle cx="320" cy="22" r="10" fill="var(--shamba-emerald)" opacity="0.2" />
                </svg>
                <p
                  className="font-display text-white mt-2"
                  style={{ fontSize: 28, fontWeight: 800 }}
                >
                  UGX 850<span className="text-sm text-white/50 font-normal ml-1">/kg</span>
                </p>
              </div>

              {/* Listings */}
              <div className="flex flex-col gap-2.5">
                {LISTINGS.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-center rounded-[14px] px-3.5 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-[13px] font-semibold">{item.name}</p>
                      <p className="text-white/45 text-[11px]">{item.farmer}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-display text-sm font-bold"
                        style={{ color: "var(--shamba-emerald)" }}
                      >
                        UGX {item.price}
                      </p>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: item.bb, color: item.bc }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating — users */}
            <div
              className="absolute -top-5 -right-5 animate-float rounded-[18px] p-3.5 bg-background border-border "
              // style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.6)" }}
            >
              <div className="flex gap-2.5 items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--shamba-emerald-soft)" }}
                >
                  <Icon name="users" size={20} color="var(--shamba-emerald)" />
                </div>
                <div>
                  <p
                    className="font-display font-black leading-none"
                    style={{ fontSize: 20, color: "var(--foreground)" }}
                  >
                    12,400+
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--shamba-muted)" }}>
                    Active Farmers
                  </p>
                </div>
              </div>
            </div>

            {/* Floating — AI */}
            <div
              className="absolute bottom-5 -left-8 rounded-[18px] p-3"
              style={{
                background: "var(--shamba-forest)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                animation: "shamba-float 4s ease-in-out 1.5s infinite",
              }}
            >
              <div className="flex gap-2 items-center">
                <span className="text-[22px]">🤖</span>
                <div>
                  <p className="text-[12px] font-semibold text-white">AI Disease Scan</p>
                  <p className="text-[10px]" style={{ color: "var(--shamba-emerald)" }}>
                    ✓ Tomato Late Blight Detected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom path clipper */}
        <div className="absolute -bottom-px inset-x-0 leading-none pointer-events-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-15 block">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
