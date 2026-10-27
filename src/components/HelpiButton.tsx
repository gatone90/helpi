import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./HelpiButton.css";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "icon" | "fab";

type HelpiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

export function HelpiButton({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: HelpiButtonProps) {
  return (
    <button
      {...props}
      className={`helpi-button helpi-button--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <><span className="helpi-button__spinner" aria-hidden="true" /><span className="helpi-sr-only">Cargando…</span></> : children}
    </button>
  );
}

type IconButtonProps = Omit<HelpiButtonProps, "children" | "variant"> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({ label, icon, className = "", ...props }: IconButtonProps) {
  return (
    <HelpiButton
      {...props}
      variant="icon"
      className={className}
      aria-label={label}
      title={label}
    >
      {icon}
    </HelpiButton>
  );
}

type FloatingActionButtonProps = Omit<HelpiButtonProps, "children" | "variant"> & {
  label: string;
  icon: ReactNode;
};

export function FloatingActionButton({ label, icon, className = "", ...props }: FloatingActionButtonProps) {
  return (
    <HelpiButton
      {...props}
      variant="fab"
      className={className}
      aria-label={label}
      title={label}
    >
      {icon}
    </HelpiButton>
  );
}
