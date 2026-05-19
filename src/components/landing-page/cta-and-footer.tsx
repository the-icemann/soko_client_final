import { useNavigate } from "@tanstack/react-router";

import { Icon, type IconName } from "@/components/landing-page/icon";
import { Logo } from "@/components/landing-page/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ── CTA Banner ── */
export function CTABanner() {
  const navigate = useNavigate();
  return (
    <section className="px-6 pb-24 bg-background">
      <div className="max-w-300 mx-auto">
        <div
          className="rounded-[32px] text-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--shamba-forest) 0%, var(--shamba-forest-mid) 50%, var(--shamba-forest) 100%)`,
            padding: "clamp(40px,6vw,72px) clamp(32px,5vw,64px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 20% 50%, rgba(0,196,113,0.12), transparent 40%), radial-gradient(circle at 80% 30%, rgba(200,131,58,0.08), transparent 40%)",
            }}
          />

          <div className="relative">
            <Badge
              variant="outline"
              className="mb-6 font-body text-xs font-semibold rounded-full px-3.5 py-1"
              style={{
                background: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              🌾 Start Growing Today
            </Badge>
            <h2
              className="font-display font-black text-white leading-[1.1] tracking-tight mb-5"
              style={{ fontSize: "clamp(32px,5vw,56px)" }}
            >
              Uganda's farms deserve
              <br />
              <em style={{ color: "var(--shamba-emerald)" }}>a world-class market</em>
            </h2>
            <p
              className="leading-[1.7] mx-auto mb-10"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, maxWidth: 500 }}
            >
              Join 12,400+ farmers already transforming their agricultural business. Free to sign
              up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <Button
                onClick={() => navigate({ to: "/auth/sign-up" })}
                className="hover:-translate-y-0.5 transition-all gap-2 font-body font-bold"
                style={{
                  background: "var(--shamba-emerald)",
                  color: "var(--shamba-forest)",
                  padding: "16px 40px",
                  fontSize: 17,
                  borderRadius: 18,
                  height: "auto",
                }}
              >
                Sign Up Free <Icon name="arrow" size={20} color="var(--shamba-forest)" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/marketplace" })}
                className="hover:border-(--shamba-emerald) hover:bg-white/[0.07] transition-all font-body"
                style={{
                  background: "transparent",
                  color: "white",
                  borderColor: "rgba(255,255,255,0.25)",
                  padding: "16px 32px",
                  fontSize: 16,
                  borderRadius: 18,
                  height: "auto",
                }}
              >
                Explore Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
const COLS = [
  {
    title: "Platform",
    links: ["Marketplace", "Blog", "Price Intelligence", "Soko AI", "Sell Produce"],
  },
  { title: "Company", links: ["About", "Careers", "Press", "Partners", "Contact"] },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Farmer Agreement"],
  },
];

export function Footer() {
  return (
    <footer className="px-6 pt-16 pb-8 bg-sidebar">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo dark />
            <p
              className="text-sm leading-[1.8] mt-4"
              style={{ color: "rgba(255,255,255,0.45)", maxWidth: 280 }}
            >
              Uganda's premier agricultural marketplace. Connecting farmers with buyers across 135
              districts.
            </p>
            <div className="flex gap-3 mt-5">
              {(["globe", "phone", "mail"] as IconName[]).map((ic) => (
                <button
                  key={ic}
                  className="w-9.5 h-9.5 rounded-xl flex items-center justify-center bg-white/[0.07] border border-white/10 hover:bg-white/12 transition-all cursor-pointer"
                >
                  <Icon name={ic} size={16} color="rgba(255,255,255,0.6)" />
                </button>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p
                className="text-[13px] font-bold tracking-[1px] uppercase mb-4 font-body"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {col.title}
              </p>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm transition-colors duration-200 hover:text-(--shamba-emerald) no-underline"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator style={{ background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} Soko Technologies Ltd. All rights reserved. Built with much
            Love for Ugandan farmers.
          </p>
          <p className="font-data text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            v2.4.1 · Kampala, Uganda
          </p>
        </div>
      </div>
    </footer>
  );
}
