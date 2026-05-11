/** Step progress indicator — pill grows on the active step */

interface Props {
  current: number;
  total: number;
}

export function StepDots({ current, total }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "rounded-full transition-all duration-300",
            i === current
              ? "w-6 h-2 bg-primary"
              : i < current
                ? "w-2 h-2 bg-primary/50"
                : "w-2 h-2 bg-muted-foreground/25",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
