"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Listing = {
  id: number;
  title: string;
  category: string;
  place: string;
  distance: string;
  detail: string;
  icon: string;
  tone: string;
  posted: string;
  userId: string;
  saved?: boolean;
};

type MockUser = {
  id: string;
  name: string;
  initials: string;
  place: string;
  activity: string;
  helped: number;
  tone: string;
  verified?: boolean;
};

const mockUsers: MockUser[] = [
  { id: "martina", name: "Martina López", initials: "M", place: "Godoy Cruz", activity: "Compartió libros", helped: 3, tone: "rose", verified: true },
  { id: "lucia", name: "Lucía Torres", initials: "L", place: "Godoy Cruz", activity: "Busca abrigo", helped: 5, tone: "peach", verified: true },
  { id: "diego", name: "Diego Molina", initials: "D", place: "Ciudad", activity: "Donó libros", helped: 8, tone: "blue" },
  { id: "sofia", name: "Sofía Ríos", initials: "S", place: "Las Heras", activity: "Armó un comedor", helped: 12, tone: "lilac", verified: true },
  { id: "mateo", name: "Mateo Quiroga", initials: "M", place: "Guaymallén", activity: "Comparte materiales", helped: 4, tone: "green" },
  { id: "valentina", name: "Valentina Paz", initials: "V", place: "Maipú", activity: "Busca una notebook", helped: 2, tone: "yellow", verified: true },
  { id: "manos-abiertas", name: "Manos Abiertas", initials: "MA", place: "Ciudad", activity: "Organización comunitaria", helped: 38, tone: "blue", verified: true },
];

const starterListings: Listing[] = [
  { id: 1, userId: "lucia", title: "Abrigo para este invierno", category: "Ropa", place: "Godoy Cruz", distance: "1,2 km", detail: "Frazadas y camperas en buen estado", icon: "🧣", tone: "peach", posted: "Hace 2 h" },
  { id: 2, userId: "diego", title: "Libros para seguir aprendiendo", category: "Educación", place: "Ciudad de Mendoza", distance: "2,4 km", detail: "Libros de primaria y cuentos infantiles", icon: "📚", tone: "blue", posted: "Hace 5 h" },
  { id: 3, userId: "sofia", title: "Una mano para equipar el comedor", category: "Hogar", place: "Las Heras", distance: "3,1 km", detail: "Vajilla, ollas y utensilios de cocina", icon: "🍲", tone: "yellow", posted: "Ayer" },
  { id: 4, userId: "mateo", title: "Materiales para el taller de arte", category: "Educación", place: "Guaymallén", distance: "4,6 km", detail: "Lápices, témperas y hojas para dibujar", icon: "🎨", tone: "lilac", posted: "Ayer" },
  { id: 5, userId: "manos-abiertas", title: "Una compra compartida", category: "Alimentos", place: "Ciudad de Mendoza", distance: "2,8 km", detail: "Alimentos para una familia esta semana", icon: "🥕", tone: "yellow", posted: "Hace 3 h" },
  { id: 6, userId: "valentina", title: "Una compu para seguir estudiando", category: "Tecnología", place: "Maipú", distance: "5,2 km", detail: "Notebook en funcionamiento para estudiar", icon: "💻", tone: "blue", posted: "Ayer" },
];

const categories = ["Todo", "Ropa", "Hogar", "Educación", "Alimentos", "Tecnología"];
const currentUser = mockUsers[0];
const usersById = new Map(mockUsers.map((user) => [user.id, user]));

const navItems = [
  { id: "inicio", label: "Inicio", icon: "⌂" },
  { id: "explorar", label: "Explorar", icon: "⌕" },
  { id: "publicar", label: "Publicar", icon: "+" },
  { id: "guardados", label: "Guardados", icon: "♡" },
  { id: "perfil", label: "Mi perfil", icon: "◉" },
];

function Avatar({ user, small = false }: { user: MockUser; small?: boolean }) {
  return <span className={`user-avatar avatar-${user.tone} ${small ? "avatar-small" : ""}`} aria-label={user.name}>{user.initials}</span>;
}

function Brand() {
  return <a className="brand" href="#inicio" aria-label="HELPi, inicio"><span className="brand-word">HELP</span><span className="brand-i">i</span><span className="brand-heart">♥</span></a>;
}

function PinIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.3 4.3"/></svg>; }

export default function Home() {
  const [items, setItems] = useState(starterListings);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todo");
  const [activeNav, setActiveNav] = useState("inicio");
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUser>(currentUser);
  const [notice, setNotice] = useState("");

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesCategory = category === "Todo" || item.category === category;
    const searchText = `${item.title} ${item.category} ${item.place} ${item.detail}`.toLocaleLowerCase("es");
    const matchesQuery = searchText.includes(query.trim().toLocaleLowerCase("es"));
    const matchesSaved = activeNav !== "guardados" || item.saved;
    return matchesCategory && matchesQuery && matchesSaved;
  }), [items, category, query, activeNav]);

  function selectNav(id: string) {
    setActiveNav(id);
    if (id === "publicar") { setShowCreate(true); return; }
    if (id === "perfil") { setShowProfile(true); return; }
    if (id === "explorar") document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth" });
    if (id === "inicio") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleSaved(id: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, saved: !item.saved } : item));
  }

  function createListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const place = String(form.get("place") || "").trim();
    const detail = String(form.get("detail") || "").trim();
    const kind = String(form.get("category") || "Hogar");
    if (!title || !place) return;
    setItems((current) => [{ id: Date.now(), userId: currentUser.id, title, category: kind, place, distance: "Cerca tuyo", detail: detail || "Una nueva oportunidad para ayudar", icon: "💛", tone: "peach", posted: "Ahora" }, ...current]);
    setCategory("Todo");
    setActiveNav("inicio");
    setShowCreate(false);
    setNotice("¡Listo! Tu publicación ya está en HELPi.");
    window.setTimeout(() => setNotice(""), 3600);
  }

  return (
    <main className="app-shell" id="inicio">
      <aside className="sidebar">
        <Brand />
        <div className="side-location"><span className="location-icon"><PinIcon /></span><span><small>Tu ubicación</small><strong>Mendoza, Argentina</strong></span><span className="chevron">⌄</span></div>
        <div className="side-label">MENÚ</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {navItems.map((item) => <button key={item.id} className={`side-nav-item ${activeNav === item.id ? "selected" : ""} ${item.id === "publicar" ? "publish-nav" : ""}`} onClick={() => selectNav(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}{item.id === "publicar" && <span className="nav-plus">+</span>}</button>)}
        </nav>
        <div className="side-promo">
          <div className="promo-mascot"><Image src="/helpi-heart.svg" alt="Helpi, el corazón que conecta" width={84} height={84} /></div>
          <strong>Un gesto puede<br />cambiar un día.</strong>
          <p>Encontrá algo que puedas compartir hoy.</p>
          <button onClick={() => setShowCreate(true)}>Publicar una donación <span>↗</span></button>
        </div>
        <button className="profile-mini" onClick={() => { setSelectedUser(currentUser); setShowProfile(true); }}><Avatar user={currentUser} /><span className="profile-copy"><strong>{currentUser.name}</strong><small>Cuenta personal</small></span><span className="more">···</span></button>
      </aside>

      <section className="workspace">
        <header className="app-topbar">
          <div className="mobile-brand"><Brand /></div>
          <div className="mobile-location"><PinIcon /><span>Mendoza</span><b>⌄</b></div>
          <div className="topbar-right"><button className="top-icon" aria-label="Notificaciones" onClick={() => setNotice("No tenés notificaciones nuevas.")}>♧<i /></button><button className="top-avatar" onClick={() => { setSelectedUser(currentUser); setShowProfile(true); }}>{currentUser.initials}</button></div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div><div className="hello-overline">MARTES, 27 DE OCTUBRE <span>· MENDOZA</span></div><h1>Hola, Martina <span className="wave">✳</span></h1><p>Hoy puede ser el día en que algo encuentre a alguien.</p></div>
            <button className="post-button" onClick={() => setShowCreate(true)}><span>＋</span> Publicar donación</button>
          </div>

          <section className="welcome-card">
            <div className="welcome-text"><span className="tiny-tag"><span>♥</span> LA COMUNIDAD HELPi</span><h2>Lo que a vos te sobra,<br /><span>a alguien le puede cambiar la vida.</span></h2><p>Un montón de cosas esperan un nuevo hogar.<br className="desktop-break" /> Capaz la próxima es justo lo que alguien necesita.</p><button onClick={() => selectNav("explorar")}>Explorar necesidades <span>→</span></button></div>
            <div className="welcome-image"><span className="image-glow"/><Image src="/helpi-heart.svg" alt="Helpi, la mascota corazón de la comunidad" width={226} height={226} priority /><span className="bubble bubble-one">¡Hola, Martina!</span><span className="bubble bubble-two">♥</span><span className="image-caption">UN ENCUENTRO<br />PUEDE EMPEZAR ACÁ</span></div>
            <span className="welcome-spark spark-one">✳</span><span className="welcome-spark spark-two">✦</span>
          </section>

          <div className="quick-stats"><div className="stat-icon stat-coral">♥</div><span><strong>24</strong><small>nuevas necesidades</small></span><i className="stat-separator"/><div className="stat-icon stat-blue">↗</div><span><strong>8</strong><small>cerca de vos</small></span><a href="#explorar" onClick={() => selectNav("explorar")}>Ver oportunidades <span>→</span></a></div>

          <section className="discover" id="explorar">
            <div className="section-title"><div><span className="section-kicker">ENCUENTROS QUE PUEDEN PASAR</span><h2>Necesidades cerca tuyo</h2></div><button className="text-action" onClick={() => { setCategory("Todo"); setActiveNav("explorar"); }}>Ver todas <span>→</span></button></div>
            <div className="search-row"><label className="search-box"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿Qué te gustaría encontrar?" aria-label="Buscar donaciones" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => setNotice("Elegí una categoría para filtrar las necesidades.")}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="1.5"/><circle cx="15" cy="12" r="1.5"/></svg><span>Filtros</span></button></div>
            <div className="category-row" role="tablist" aria-label="Categorías">
              {categories.map((entry, index) => <button key={entry} role="tab" aria-selected={category === entry} className={`category-chip ${category === entry ? "active" : ""}`} onClick={() => setCategory(entry)}><span className={`category-dot dot-${index}`} />{entry}{entry === "Todo" && <small>12</small>}</button>)}
            </div>
            <div className="results-heading"><span>{activeNav === "guardados" ? "TUS GUARDADOS" : "PARA VOS"}</span><button onClick={() => setNotice("Mostrando primero lo más cercano a Mendoza.")}>Más cercanas <span>⌄</span></button></div>
            <div className="listing-grid">
              {visibleItems.map((item) => <article className="listing-card" key={item.id}>
                <div className={`listing-art art-${item.tone}`}><span className="art-category">{item.category}</span><span className="item-emoji" aria-hidden="true">{item.icon}</span><button className={`save-button ${item.saved ? "is-saved" : ""}`} onClick={() => toggleSaved(item.id)} aria-label={item.saved ? "Quitar de guardados" : "Guardar necesidad"}>{item.saved ? "♥" : "♡"}</button><span className="art-lines" /></div>
                <div className="listing-info"><div className="listing-place"><PinIcon />{item.place}<span>·</span>{item.distance}</div><h3>{item.title}</h3><p>{item.detail}</p><div className="listing-owner"><button onClick={() => { setSelectedUser(usersById.get(item.userId) || currentUser); setShowProfile(true); }}><Avatar user={usersById.get(item.userId) || currentUser} small /><span className="owner-copy"><strong>{(usersById.get(item.userId) || currentUser).name}</strong><small>{item.posted}{(usersById.get(item.userId) || currentUser).verified && <i aria-label="Perfil verificado"> ✓</i>}</small></span><span className="owner-arrow">↗</span></button></div><button className="contact-button" onClick={() => setNotice(`Pronto vas a poder conectar con ${(usersById.get(item.userId) || currentUser).name}.`)}>Ver necesidad <span>↗</span></button></div>
              </article>)}
              {visibleItems.length === 0 && <div className="empty-state"><span>⌕</span><strong>{activeNav === "guardados" ? "Todavía no guardaste nada" : "No encontramos coincidencias"}</strong><p>{activeNav === "guardados" ? "Guardá una necesidad con el corazón para tenerla a mano." : "Probá otra búsqueda o elegí una categoría diferente."}</p><button onClick={() => { setQuery(""); setCategory("Todo"); setActiveNav("inicio"); }}>Ver todas las necesidades</button></div>}
            </div>
          </section>

          <section className="community-section" aria-labelledby="community-title">
            <div className="section-title"><div><span className="section-kicker">GENTE QUE HACE QUE PASE</span><h2 id="community-title">Personas cerca tuyo</h2></div><button className="text-action" onClick={() => setNotice("La comunidad sigue creciendo en Mendoza.")}>Ver comunidad <span>→</span></button></div>
            <div className="community-grid">{mockUsers.slice(1).map((user) => <button className="community-card" key={user.id} onClick={() => { setSelectedUser(user); setShowProfile(true); }}><Avatar user={user} /><span className="community-copy"><strong>{user.name}{user.verified && <i aria-label="Perfil verificado">✓</i>}</strong><small>{user.activity}</small><small className="community-place"><PinIcon />{user.place}</small></span><span className="community-arrow">↗</span></button>)}</div>
          </section>

          <footer className="app-footer"><span><span className="footer-heart">♥</span> Hacemos que las cosas buenas se encuentren.</span><a href="#ayuda">¿Necesitás ayuda? <b>→</b></a><small>HELPi · Mendoza, Argentina</small></footer>
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Navegación móvil">{navItems.map((item) => <button key={item.id} onClick={() => selectNav(item.id)} className={`${activeNav === item.id ? "active" : ""} ${item.id === "publicar" ? "mobile-publish" : ""}`} aria-label={item.label}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>

      {notice && <div role="status" className="toast"><span>♥</span>{notice}<button onClick={() => setNotice("")} aria-label="Cerrar">×</button></div>}

      {showCreate && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><button className="modal-close" onClick={() => setShowCreate(false)} aria-label="Cerrar">×</button><span className="modal-mark">＋</span><span className="section-kicker">HACÉ QUE ALGO BUENO PASE</span><h2 id="create-title">Publicá una necesidad</h2><p>Contale a la comunidad qué estás buscando. Alguien cerca puede tenerlo para compartir.</p><form onSubmit={createListing}><label>¿Qué necesitás?<input name="title" required placeholder="Ej. Abrigo para este invierno" /></label><div className="form-row"><label>Categoría<select name="category">{categories.slice(1).map((entry) => <option key={entry}>{entry}</option>)}</select></label><label>Zona<input name="place" required placeholder="Ej. Godoy Cruz" /></label></div><label>Un poco más de detalle<textarea name="detail" rows={3} placeholder="Contanos qué te serviría y para quién es…" /></label><button className="submit-button" type="submit">Publicar en HELPi <span>→</span></button><small>Tu publicación será visible para la comunidad de Mendoza.</small></form></section></div>}

      {showProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProfile(false); }}><section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button className="modal-close" onClick={() => setShowProfile(false)} aria-label="Cerrar">×</button><Avatar user={selectedUser} /><span className="section-kicker">{selectedUser.id === currentUser.id ? "TU CUENTA" : selectedUser.verified ? "PERFIL DE LA COMUNIDAD · VERIFICADO" : "PERFIL DE LA COMUNIDAD"}</span><h2 id="profile-title">{selectedUser.name}</h2><p>{selectedUser.place}, Mendoza · {selectedUser.id === "manos-abiertas" ? "Organización" : "Cuenta personal"}</p><div className="profile-summary"><span><strong>{selectedUser.id === currentUser.id ? items.filter((item) => item.saved).length : selectedUser.helped}</strong><small>{selectedUser.id === currentUser.id ? "guardados" : "ayudas compartidas"}</small></span><i/><span><strong>{items.filter((item) => item.userId === selectedUser.id).length}</strong><small>publicaciones</small></span></div><p className="profile-activity">Última actividad: {selectedUser.activity.toLocaleLowerCase("es")}</p>{selectedUser.id === currentUser.id && <button className="submit-button" onClick={() => { setShowProfile(false); setNotice("La edición de perfil estará disponible pronto."); }}>Editar mi perfil <span>→</span></button>}</section></div>}
    </main>
  );
}
