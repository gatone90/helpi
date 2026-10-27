"use client";

import { useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { FloatingActionButton } from "./HelpiButton";
import "./UiPrimitives.css";

export type IconName = "home" | "search" | "plus" | "heart" | "bookmark" | "user" | "bell" | "pin" | "sliders";

export function SystemIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.7" /><path d="m16 16 4.3 4.3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.8 4.8 0 0 1 8.8-2.4 4.8 4.8 0 0 1 8.8 2.4Z" />,
    bookmark: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="10" cy="18" r="1.5" /></>,
  };

  return <svg className="system-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function TextField({
  label,
  error,
  hint,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className={`ui-field ${className}`.trim()}>
      <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <input {...props} id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={error || hint ? messageId : undefined} />
      {(error || hint) && <small id={messageId} className={error ? "ui-field-error" : "ui-field-hint"}>{error || hint}</small>}
    </div>
  );
}

export function SelectField({
  label,
  options,
  error,
  className = "",
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  options: string[];
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={`ui-field ${className}`.trim()}>
      <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <select {...props} id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? errorId : undefined}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <small id={errorId} className="ui-field-error">{error}</small>}
    </div>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className={`ui-field ${className}`.trim()}>
      <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <textarea {...props} id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={error || hint ? messageId : undefined} />
      {(error || hint) && <small id={messageId} className={error ? "ui-field-error" : "ui-field-hint"}>{error || hint}</small>}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  label = "Buscar en HELPi",
  placeholder = "¿Qué te gustaría encontrar?",
  className = "",
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`ui-search ${className}`.trim()}>
      <label className="helpi-sr-only" htmlFor={id}>{label}</label>
      <SystemIcon name="search" size={18} />
      <input id={id} type="search" value={value} onChange={onChange} placeholder={placeholder} />
      <kbd aria-hidden="true">⌘ K</kbd>
    </div>
  );
}

export function CategoryChip({
  label,
  selected,
  count,
  dotClassName = "",
  onClick,
  className = "",
}: {
  label: string;
  selected: boolean;
  count?: number;
  dotClassName?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" aria-pressed={selected} className={`category-chip ${selected ? "active" : ""} ${className}`.trim()} onClick={onClick}>
      <span className={`category-dot ${dotClassName}`.trim()} aria-hidden="true" />{label}{count !== undefined && <small>{count}</small>}
    </button>
  );
}

export function InlineAlert({
  children,
  variant = "info",
  onDismiss,
  className = "",
}: {
  children: ReactNode;
  variant?: "success" | "info" | "warning" | "error";
  onDismiss?: () => void;
  className?: string;
}) {
  const role = variant === "error" || variant === "warning" ? "alert" : "status";
  const symbols = { success: "✓", info: "i", warning: "!", error: "×" };
  return (
    <div className={`ui-alert ui-alert--${variant} ${className}`.trim()} role={role} aria-live={role === "alert" ? "assertive" : "polite"}>
      <span className="ui-alert-icon" aria-hidden="true">{symbols[variant]}</span>
      <span className="ui-alert-copy">{children}</span>
      {onDismiss && <button type="button" className="ui-alert-dismiss" onClick={onDismiss} aria-label="Cerrar aviso">×</button>}
    </div>
  );
}

export type NavigationItem = { id: string; label: string; icon: ReactNode };

export function ResponsiveNavigation({
  items,
  activeId,
  onSelect,
  mode,
}: {
  items: NavigationItem[];
  activeId: string;
  onSelect: (id: string) => void;
  mode: "desktop" | "mobile";
}) {
  const mobile = mode === "mobile";
  return (
    <nav className={mobile ? "mobile-nav" : "side-nav"} aria-label={mobile ? "Navegación móvil" : "Navegación principal"}>
      {items.map((item) => {
        const isPublish = item.id === "publicar";
        const active = activeId === item.id;
        if (mobile && isPublish) {
          return <div className="mobile-nav-publish" key={item.id}>
            <FloatingActionButton label={item.label} icon={item.icon} onClick={() => onSelect(item.id)} />
            <small>{item.label}</small>
          </div>;
        }
        return <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`${mobile ? "mobile-nav-item" : "side-nav-item"} ${active ? "selected active" : ""} ${isPublish ? "publish-nav" : ""}`} aria-current={active ? "page" : undefined}>
          <span className={mobile ? "mobile-nav-icon" : "nav-icon"}>{item.icon}</span>{!mobile && item.label}{mobile && <small>{item.label}</small>}
        </button>;
      })}
    </nav>
  );
}

export type ListingCardData = {
  title: string;
  category: string;
  place: string;
  distance: string;
  detail: string;
  icon: string;
  tone: string;
  posted: string;
  saved?: boolean;
};

export function ListingCard({
  item,
  ownerName,
  ownerInitials,
  ownerTone,
  verified,
  onSave,
  onOwnerClick,
  onView,
}: {
  item: ListingCardData;
  ownerName: string;
  ownerInitials: string;
  ownerTone: string;
  verified?: boolean;
  onSave: () => void;
  onOwnerClick: () => void;
  onView: () => void;
}) {
  return (
    <article className="listing-card">
      <div className={`listing-art art-${item.tone}`}>
        <span className="art-category">{item.category}</span>
        <span className="item-emoji" aria-hidden="true">{item.icon}</span>
        <button type="button" className={`save-button ${item.saved ? "is-saved" : ""}`} onClick={onSave} aria-label={item.saved ? "Quitar de guardados" : "Guardar necesidad"} aria-pressed={Boolean(item.saved)}>
          <SystemIcon name="heart" size={17} />
        </button>
        <span className="art-lines" aria-hidden="true" />
      </div>
      <div className="listing-info">
        <div className="listing-place"><SystemIcon name="pin" size={13} />{item.place}<span aria-hidden="true">·</span>{item.distance}</div>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        <div className="listing-owner">
          <button type="button" onClick={onOwnerClick} aria-label={`Ver perfil de ${ownerName}`}>
            <span className={`user-avatar avatar-${ownerTone} avatar-small`} aria-hidden="true">{ownerInitials}</span>
            <span className="owner-copy"><strong>{ownerName}{verified && <span className="verified-mark" aria-label="Perfil verificado">✓</span>}</strong><small>{item.posted}</small></span>
            <span className="owner-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        <button type="button" className="contact-button" onClick={onView}>Ver necesidad <span aria-hidden="true">↗</span></button>
      </div>
    </article>
  );
}
