"use client";

import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/utils/cn";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "span";
}

export default function ScrollReveal({
  children,
  className,
  stagger = false,
  delay = 0,
  as: Tag = "div",
}: ScrollRevealProps) {
  const [ref, inView] = useInView<HTMLElement>({ once: false });

  if (stagger) {
    return createElement(
      Tag,
      {
        ref,
        className: cn("reveal-stagger group", className),
        "data-visible": inView ? "true" : "false",
      },
      Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        return cloneElement(child as ReactElement<{ style?: React.CSSProperties; className?: string }>, {
          className: cn("reveal", (child as ReactElement<{ className?: string }>).props.className, inView && "is-visible"),
          style: {
            ...(child as ReactElement<{ style?: React.CSSProperties }>).props.style,
            ["--stagger" as string]: index + delay,
          },
        });
      })
    );
  }

  return createElement(
    Tag,
    {
      ref,
      className: cn("reveal", inView && "is-visible", className),
      style: { ["--stagger" as string]: delay },
    },
    children
  );
}
