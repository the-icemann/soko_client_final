import { C } from "@/constants/colors";
import { Ic } from "@/constants/crisp-svg";

export const panel = (
  <div>
    {/* Heading */}
    <h2 className="fraunces text-[36px] font-extrabold text-white leading-[1.1] tracking-[-0.3px] mb-4">
      Join Uganda's
      <br />
      <span className="italic" style={{ color: C.emerald }}>
        farming revolution.
      </span>
    </h2>
    {/* Subtext */}
    <p className="text-sm leading-[1.8] mb-8" style={{ color: "rgba(255,255,255,.5)" }}>
      Free to join. No hidden fees. Start selling or buying agricultural produce in minutes.
    </p>
    {/* Checklist */}
    <div className="flex flex-col gap-4">
      {[
        { text: "List produce for free — no listing fees" },
        { text: "Reach buyers across all 135 districts" },
        { text: "AI-powered price intelligence built in" },
        { text: "Direct chat & call with counterparties" },
        { text: "Verified badge boosts your credibility" },
        { text: "KYC protection for every transaction" },
      ].map((f) => (
        <div key={f.text} className="flex items-center gap-2.5">
          {/* Check bubble */}
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${C.emerald}25` }}
          >
            <Ic n="check" s={12} c={C.emerald} w={3} />
          </div>
          {/* Text */}
          <span className="text-[13px]" style={{ color: "rgba(255,255,255,.65)" }}>
            {f.text}
          </span>
        </div>
      ))}
    </div>
  </div>
);
