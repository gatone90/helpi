"use client";

import Link from "next/link";
import { useState } from "react";
import { HelpiButton, IconButton, FloatingActionButton } from "../../components/HelpiButton";
import {
  CategoryChip,
  InlineAlert,
  ListingCard,
  ResponsiveNavigation,
  SearchField,
  SelectField,
  SystemIcon,
  TextAreaField,
  TextField,
} from "../../components/UiPrimitives";
import "./page.css";

const categories = ["Todo", "Ropa", "Hogar", "Educación", "Alimentos", "Tecnología"];
const previewNavigation = [
  { id: "inicio", label: "Inicio", icon: <SystemIcon name="home" /> },
  { id: "explorar", label: "Explorar", icon: <SystemIcon name="search" /> },
  { id: "publicar", label: "Publicar", icon: <SystemIcon name="plus" size={24} /> },
  { id: "guardados", label: "Guardados", icon: <SystemIcon name="bookmark" /> },
  { id: "perfil", label: "Mi perfil", icon: <SystemIcon name="user" /> },
];

const sampleListing = {
  title: "Abrigo para este invierno",
  category: "Ropa",
  place: "Godoy Cruz",
  distance: "1,2 km",
  detail: "Frazadas y camperas en buen estado para compartir.",
  icon: "🧣",
  tone: "peach",
  posted: "Hace 2 h",
};

export default function DesignSystemPage() {
  const [category, setCategory] = useState("Todo");
  const [query, setQuery] = useState("");
  const [nav, setNav] = useState("inicio");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="design-system-preview">
      <header className="ds-header">
        <div>
          <span className="section-kicker">HELPi · SISTEMA VISUAL</span>
          <h1>Compartir nos conecta.</h1>
          <p>Componentes accesibles construidos sobre la interfaz actual.</p>
        </div>
        <Link href="/" className="ds-back-link">Volver a la webapp <span aria-hidden="true">→</span></Link>
      </header>

      <section className="ds-section" aria-labelledby="buttons-title">
        <div className="ds-section-heading"><span className="section-kicker">01 · ACCIONES</span><h2 id="buttons-title">Botones y estados</h2></div>
        <div className="ds-row ds-wrap">
          <HelpiButton onClick={() => setIsLoading(!isLoading)}>Primario</HelpiButton>
          <HelpiButton variant="secondary">Secundario</HelpiButton>
          <HelpiButton variant="outline">Outline</HelpiButton>
          <HelpiButton variant="ghost">Ghost</HelpiButton>
          <IconButton label="Guardar" icon={<SystemIcon name="bookmark" />} />
          <FloatingActionButton label="Publicar" icon={<SystemIcon name="plus" size={24} />} />
        </div>
        <div className="ds-row ds-wrap">
          <HelpiButton disabled>Deshabilitado</HelpiButton>
          <HelpiButton loading={isLoading} onClick={() => setIsLoading(false)}>{isLoading ? "Guardando" : "Cargando"}</HelpiButton>
          <span className="ds-hint">Foco visible con Tab · Enter/Espacio activa</span>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="fields-title">
        <div className="ds-section-heading"><span className="section-kicker">02 · FORMULARIOS</span><h2 id="fields-title">Campos y búsqueda</h2></div>
        <div className="ds-fields-grid">
          <TextField label="Texto" placeholder="Tu nombre" hint="Así te va a ver la comunidad." />
          <TextField label="Campo con error" placeholder="Tu correo" type="email" error="Ingresá un correo válido." aria-invalid="true" />
          <SelectField label="Selector" options={["Seleccionar categoría", ...categories.slice(1)]} />
          <TextAreaField label="Descripción" placeholder="Contanos un poco más…" rows={3} />
          <SearchField value={query} onChange={(event) => setQuery(event.target.value)} className="ds-search" />
        </div>
      </section>

      <section className="ds-section" aria-labelledby="categories-title">
        <div className="ds-section-heading"><span className="section-kicker">03 · CLASIFICACIÓN</span><h2 id="categories-title">Etiquetas de categoría</h2></div>
        <div className="category-row ds-category-row" role="group" aria-label="Vista previa de categorías">
          {categories.map((entry, index) => <CategoryChip key={entry} label={entry} selected={category === entry} count={entry === "Todo" ? 12 : undefined} dotClassName={`dot-${index}`} onClick={() => setCategory(entry)} />)}
        </div>
      </section>

      <section className="ds-section" aria-labelledby="alerts-title">
        <div className="ds-section-heading"><span className="section-kicker">04 · FEEDBACK</span><h2 id="alerts-title">Avisos</h2></div>
        <div className="ds-alert-grid">
          <InlineAlert variant="success">¡Listo! La publicación ya está en línea.</InlineAlert>
          <InlineAlert variant="info">Te avisaremos cuando haya novedades.</InlineAlert>
          <InlineAlert variant="warning">Completá tu perfil para una mejor experiencia.</InlineAlert>
          <InlineAlert variant="error">No se pudo guardar. Intentá de nuevo.</InlineAlert>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="listing-title">
        <div className="ds-section-heading"><span className="section-kicker">05 · COMUNIDAD</span><h2 id="listing-title">Tarjeta de publicación</h2></div>
        <div className="ds-card-preview">
          <ListingCard item={{ ...sampleListing, saved }} ownerName="Lucía Torres" ownerInitials="L" ownerTone="peach" verified onSave={() => setSaved(!saved)} onOwnerClick={() => {}} onView={() => {}} />
        </div>
      </section>

      <section className="ds-section" aria-labelledby="navigation-title">
        <div className="ds-section-heading"><span className="section-kicker">06 · NAVEGACIÓN</span><h2 id="navigation-title">Navegación adaptable</h2></div>
        <div className="ds-nav-preview"><ResponsiveNavigation items={previewNavigation} activeId={nav} onSelect={setNav} mode="desktop" /></div>
        <div className="ds-mobile-nav-preview"><ResponsiveNavigation items={previewNavigation} activeId={nav} onSelect={setNav} mode="mobile" /></div>
      </section>

      <footer className="ds-footer"><span>HELPi · Compartir nos conecta.</span><span>Paleta, tipografía y controles del UI Kit v1</span></footer>
    </main>
  );
}
