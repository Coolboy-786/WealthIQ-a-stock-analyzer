import { type ComponentPropsWithoutRef, type CSSProperties, type FC } from "react";
import { cn } from "@/lib/utils";

interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={{ ["--shiny-width" as string]: `${shimmerWidth}px` } as CSSProperties}
      className={cn(
        "animate-shiny-text bg-[length:var(--shiny-width)_100%] bg-clip-text bg-[position:0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
