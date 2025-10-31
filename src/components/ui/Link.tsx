import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "./Button";
import type { VariantProps } from "class-variance-authority";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  asButton?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  prefetch?: boolean;
}


export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, asButton, variant, size, prefetch, children, ...props }, ref) => {
    // Aplicar estilos de botón si asButton=true
    const linkClassName = asButton
      ? cn(buttonVariants({ variant, size, className }))
      : cn("text-primary hover:underline", className);

    return (
      <a
        ref={ref}
        href={href}
        className={linkClassName}
        data-astro-prefetch={prefetch ? "tap" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = "Link";

export default Link;
