import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "./Button";
import type { VariantProps } from "class-variance-authority";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Si es true, el link tendrá apariencia de botón */
  asButton?: boolean;
  /** Variante del botón (solo si asButton=true) */
  variant?: VariantProps<typeof buttonVariants>["variant"];
  /** Tamaño del botón (solo si asButton=true) */
  size?: VariantProps<typeof buttonVariants>["size"];
  /** Prefetch de la página destino para navegación más rápida */
  prefetch?: boolean;
}

/**
 * Componente Link con View Transitions
 *
 * Reemplaza el uso de <Button onClick={() => window.location.href = ...}>
 * con un link semánticamente correcto que mantiene las transiciones.
 *
 * @example
 * // Link simple
 * <Link href="/patients">Ver Pacientes</Link>
 *
 * @example
 * // Link con apariencia de botón
 * <Link href="/patients/new" asButton variant="default">
 *   Nuevo Paciente
 * </Link>
 *
 * @example
 * // Link con prefetch
 * <Link href="/dashboard" prefetch>Dashboard</Link>
 */
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
