"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
  images?: string[];
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
  email?: string;
};

type ContactRequest = {
  id: string;
  listingTitle: string;
  recipientName: string;
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
};

const CONTACT_REQUESTS_KEY = "helpi:contact-requests";
const PROFILE_KEY = "helpi:profile";
const LISTINGS_KEY = "helpi:listings";

async function optimizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / bitmap.width, 1280 / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo procesar la imagen.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.82);
}

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
const defaultUser = mockUsers[0];

const navItems = [
  { id: "inicio", label: "Inicio", icon: "⌂" },
  { id: "explorar", label: "Explorar", icon: "⌕" },
  { id: "guardados", label: "Guardados", icon: "♡" },
  { id: "perfil", label: "Mi perfil", icon: "◉" },
];

const mobileNavItems = [
  navItems[0], navItems[1], { id: "publicar", label: "Publicar", icon: "+" }, navItems[2], navItems[3],
];

function Avatar({ user, small = false }: { user: MockUser; small?: boolean }) {
  return <span className={`user-avatar avatar-${user.tone} ${small ? "avatar-small" : ""}`} aria-label={user.name}>{user.initials}</span>;
}

function Brand() {
  return <a className="brand-lockup" href="#inicio" aria-label="HELPi, Compartir nos conecta"><span className="brand"><span className="brand-word">HELP</span><span className="brand-i">i</span></span><span className="brand-tagline">Compartir nos conecta.</span></a>;
}

function PinIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 4.3 4.3"/></svg>; }

export default function Home() {
  const [items, setItems] = useState(starterListings);
  const [profile, setProfile] = useState<MockUser>(defaultUser);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todo");
  const [activeNav, setActiveNav] = useState("inicio");
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [contactTarget, setContactTarget] = useState<Listing | null>(null);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [carouselIndexes, setCarouselIndexes] = useState<Record<number, number>>({});
  const [selectedUser, setSelectedUser] = useState<MockUser>(defaultUser);
  const [notice, setNotice] = useState("");
  const currentUser = profile;
  const usersById = useMemo(() => new Map(mockUsers.map((user) => [user.id, user.id === profile.id ? profile : user])), [profile]);

  useEffect(() => {
    try {
      const storedRequests = window.localStorage.getItem(CONTACT_REQUESTS_KEY);
      if (storedRequests) setContactRequests(JSON.parse(storedRequests) as ContactRequest[]);
      const storedProfile = window.localStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        const savedProfile = { ...defaultUser, ...JSON.parse(storedProfile) } as MockUser;
        setProfile(savedProfile);
        setSelectedUser(savedProfile);
      }
      const storedListings = window.localStorage.getItem(LISTINGS_KEY);
      if (storedListings) {
        const savedListings = JSON.parse(storedListings) as Listing[];
        if (Array.isArray(savedListings)) {
          const savedIds = new Set(savedListings.map((item) => item.id));
          setItems([...savedListings, ...starterListings.filter((item) => !savedIds.has(item.id))]);
        }
      }
    } catch {
      setNotice("No pudimos cargar todos los datos guardados en este navegador.");
    }
  }, []);

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
    const nextItems = items.map((item) => item.id === id ? { ...item, saved: !item.saved } : item);
    setItems(nextItems);
    try { window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextItems)); } catch { /* Saving favorites is optional in this local demo. */ }
  }

  async function addPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    setPhotoError("");
    if (files.length === 0) return;

    const availableSlots = 4 - newPhotos.length;
    if (availableSlots <= 0) {
      setPhotoError("Podés agregar hasta 4 fotos por publicación.");
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots).filter((file) => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024);
    if (files.length > availableSlots) setPhotoError("Se agregaron hasta 4 fotos. Quitá alguna para sumar otras.");
    if (acceptedFiles.length < Math.min(files.length, availableSlots)) {
      setPhotoError("Aceptamos imágenes de hasta 8 MB cada una.");
    }

    try {
      const optimizedPhotos = await Promise.all(acceptedFiles.map(optimizeImage));
      setNewPhotos((current) => [...current, ...optimizedPhotos].slice(0, 4));
    } catch {
      setPhotoError("No pudimos procesar una de las imágenes. Probá con JPG, PNG o WebP.");
    }
  }

  function createListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const place = String(form.get("place") || "").trim();
    const detail = String(form.get("detail") || "").trim();
    const kind = String(form.get("category") || "Hogar");
    if (!title || !place) return;
    const newListing: Listing = { id: Date.now(), userId: currentUser.id, title, category: kind, place, distance: "Cerca tuyo", detail: detail || "Una nueva oportunidad para ayudar", icon: "💛", tone: "peach", posted: "Ahora", images: newPhotos };
    const nextItems = [newListing, ...items];
    try {
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextItems));
    } catch {
      setNotice("No pudimos guardar la publicación. Probá con menos fotos.");
      return;
    }
    setItems(nextItems);
    setCategory("Todo");
    setActiveNav("inicio");
    setShowCreate(false);
    setNewPhotos([]);
    setPhotoError("");
    setNotice("¡Listo! Tu publicación quedó guardada en este navegador.");
    window.setTimeout(() => setNotice(""), 3600);
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("profileName") || "").trim();
    const place = String(form.get("profilePlace") || "").trim();
    const email = String(form.get("profileEmail") || "").trim();
    if (!name || !place || !email) return;
    const updatedProfile: MockUser = {
      ...profile,
      name,
      place,
      email,
      initials: name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("es"),
    };
    setProfile(updatedProfile);
    setSelectedUser(updatedProfile);
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    } catch {
      setNotice("El perfil se actualizó, pero no pudimos guardarlo para la próxima visita.");
    }
    setShowEditProfile(false);
    setShowProfile(true);
  }

  function showContactForm(item: Listing) {
    setContactTarget(item);
    setShowCreate(false);
  }

  function changeCarousel(listingId: number, delta: number, imageCount: number) {
    setCarouselIndexes((current) => ({
      ...current,
      [listingId]: ((current[listingId] || 0) + delta + imageCount) % imageCount,
    }));
  }

  function createContactRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactTarget) return;

    const form = new FormData(event.currentTarget);
    const senderName = String(form.get("senderName") || "").trim();
    const senderEmail = String(form.get("senderEmail") || "").trim();
    const message = String(form.get("message") || "").trim();
    if (!senderName || !senderEmail || !message) return;

    const recipient = usersById.get(contactTarget.userId) || currentUser;
    const request: ContactRequest = {
      id: `${Date.now()}`,
      listingTitle: contactTarget.title,
      recipientName: recipient.name,
      senderName,
      senderEmail,
      message,
      createdAt: new Date().toLocaleString("es-AR"),
    };
    const nextRequests = [request, ...contactRequests];
    setContactRequests(nextRequests);
    try {
      window.localStorage.setItem(CONTACT_REQUESTS_KEY, JSON.stringify(nextRequests));
    } catch {
      setNotice("No pudimos guardar la solicitud en este navegador.");
      return;
    }

    setContactTarget(null);
    setNotice(`Solicitud guardada en este navegador. ${recipient.name} todavía no recibió el mensaje.`);
    window.setTimeout(() => setNotice(""), 5200);
  }

  return (
    <main className="app-shell" id="inicio">
      <aside className="sidebar">
        <Brand />
        <div className="side-location"><span className="location-icon"><PinIcon /></span><span><small>Tu ubicación</small><strong>{currentUser.place}, Argentina</strong></span><span className="chevron">⌄</span></div>
        <div className="side-label">MENÚ</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {navItems.map((item) => <button key={item.id} className={`side-nav-item ${activeNav === item.id ? "selected" : ""}`} onClick={() => selectNav(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}
        </nav>
        <button className="publish-menu-button" onClick={() => setShowCreate(true)}><span>＋</span> Publicar <b>+</b></button>
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
          <div className="mobile-location"><PinIcon /><span>{currentUser.place}</span><b>⌄</b></div>
          <div className="topbar-right"><button className="top-icon" aria-label="Notificaciones" onClick={() => setNotice("No tenés notificaciones nuevas.")}>♧<i /></button><button className="top-avatar" onClick={() => { setSelectedUser(currentUser); setShowProfile(true); }}>{currentUser.initials}</button></div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div><div className="hello-overline">MARTES, 27 DE OCTUBRE <span>· {currentUser.place.toLocaleUpperCase("es")}</span></div><h1>Hola, {currentUser.name.split(" ")[0]} <span className="wave">✳</span></h1><p>Hoy puede ser el día en que algo encuentre a alguien.</p></div>
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
                <div className={`listing-art art-${item.tone}`}>
                  {item.images?.length ? <Image className="listing-photo" src={item.images[carouselIndexes[item.id] || 0]} alt={`${item.title}, foto ${(carouselIndexes[item.id] || 0) + 1}`} fill sizes="(max-width: 760px) 50vw, 300px" unoptimized /> : <span className="item-emoji" aria-hidden="true">{item.icon}</span>}
                  <span className="art-category">{item.category}</span>
                  {item.images && item.images.length > 1 && <><button className="carousel-arrow carousel-prev" onClick={() => changeCarousel(item.id, -1, item.images!.length)} aria-label="Foto anterior">‹</button><button className="carousel-arrow carousel-next" onClick={() => changeCarousel(item.id, 1, item.images!.length)} aria-label="Foto siguiente">›</button><span className="carousel-count">{(carouselIndexes[item.id] || 0) + 1}/{item.images.length}</span></>}
                  <button className={`save-button ${item.saved ? "is-saved" : ""}`} onClick={() => toggleSaved(item.id)} aria-label={item.saved ? "Quitar de guardados" : "Guardar necesidad"}>{item.saved ? "♥" : "♡"}</button><span className="art-lines" />
                </div>
                <div className="listing-info"><div className="listing-place"><PinIcon />{item.place}<span>·</span>{item.distance}</div><h3>{item.title}</h3><p>{item.detail}</p><div className="listing-owner"><button onClick={() => { setSelectedUser(usersById.get(item.userId) || currentUser); setShowProfile(true); }}><Avatar user={usersById.get(item.userId) || currentUser} small /><span className="owner-copy"><strong>{(usersById.get(item.userId) || currentUser).name}</strong><small>{item.posted}{(usersById.get(item.userId) || currentUser).verified && <i aria-label="Perfil verificado"> ✓</i>}</small></span><span className="owner-arrow">↗</span></button></div><button className="contact-button" onClick={() => showContactForm(item)}>Contactar <span>↗</span></button></div>
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

      <nav className="mobile-nav" aria-label="Navegación móvil">{mobileNavItems.map((item) => <button key={item.id} onClick={() => item.id === "publicar" ? setShowCreate(true) : selectNav(item.id)} className={`${activeNav === item.id ? "active" : ""} ${item.id === "publicar" ? "mobile-publish" : ""}`} aria-label={item.label}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>

      {notice && <div role="status" className="toast"><span>♥</span>{notice}<button onClick={() => setNotice("")} aria-label="Cerrar">×</button></div>}

      {showCreate && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><button className="modal-close" onClick={() => setShowCreate(false)} aria-label="Cerrar">×</button><span className="modal-mark">＋</span><span className="section-kicker">HACÉ QUE ALGO BUENO PASE</span><h2 id="create-title">Publicá una necesidad</h2><p>Contale a la comunidad qué estás buscando. Alguien cerca puede tenerlo para compartir.</p><form onSubmit={createListing}><label>¿Qué necesitás?<input name="title" required placeholder="Ej. Abrigo para este invierno" /></label><div className="form-row"><label>Categoría<select name="category">{categories.slice(1).map((entry) => <option key={entry}>{entry}</option>)}</select></label><label>Zona<input name="place" required placeholder="Ej. Godoy Cruz" /></label></div><label>Un poco más de detalle<textarea name="detail" rows={3} placeholder="Contanos qué te serviría y para quién es…" /></label><label className="photo-upload">Fotos de la publicación<input type="file" accept="image/*" multiple onChange={addPhotos} /><small>Hasta 4 imágenes. Las optimizamos y guardamos en este navegador.</small></label>{newPhotos.length > 0 && <div className="photo-preview-grid">{newPhotos.map((photo, index) => <div className="photo-preview" key={`${photo.slice(-24)}-${index}`}><Image src={photo} alt={`Vista previa ${index + 1}`} width={88} height={72} unoptimized /><button type="button" onClick={() => setNewPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Quitar foto ${index + 1}`}>×</button></div>)}</div>}{photoError && <small className="photo-error" role="alert">{photoError}</small>}<button className="submit-button" type="submit">Publicar en HELPi <span>→</span></button><small>La publicación queda disponible en esta demo local; todavía no se comparte en línea.</small></form></section></div>}

      {contactTarget && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setContactTarget(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="contact-title"><button className="modal-close" onClick={() => setContactTarget(null)} aria-label="Cerrar">×</button><span className="modal-mark">↗</span><span className="section-kicker">UN ENCUENTRO PUEDE EMPEZAR ACÁ</span><h2 id="contact-title">Contactar a {(usersById.get(contactTarget.userId) || currentUser).name}</h2><p>Sobre <strong>{contactTarget.title}</strong>. Contale quién sos y por qué te interesa.</p><form onSubmit={createContactRequest}><label>Tu nombre<input name="senderName" required minLength={2} maxLength={80} defaultValue={currentUser.name} autoComplete="name" /></label><label>Tu email<input name="senderEmail" type="email" required maxLength={254} defaultValue={currentUser.email || ""} placeholder="vos@ejemplo.com" autoComplete="email" /></label><label>Mensaje<textarea name="message" rows={4} required minLength={10} maxLength={1000} placeholder="Hola, me interesa esta publicación…" /></label><small className="contact-disclaimer">Demo local: la solicitud queda guardada en este navegador. El destinatario todavía no recibe el mensaje.</small><button className="submit-button" type="submit">Guardar solicitud <span>→</span></button></form></section></div>}

      {showEditProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowEditProfile(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><button className="modal-close" onClick={() => setShowEditProfile(false)} aria-label="Cerrar">×</button><span className="modal-mark">◉</span><span className="section-kicker">TU CUENTA</span><h2 id="edit-profile-title">Editar perfil</h2><p>Actualizá los datos que usás en esta demo. Quedan guardados solo en este navegador.</p><form onSubmit={saveProfile}><label>Nombre<input name="profileName" required minLength={2} maxLength={80} defaultValue={profile.name} autoComplete="name" /></label><label>Email de contacto<input name="profileEmail" type="email" required maxLength={254} defaultValue={profile.email || ""} placeholder="vos@ejemplo.com" autoComplete="email" /></label><label>Localidad<input name="profilePlace" required maxLength={100} defaultValue={profile.place} autoComplete="address-level2" /></label><small className="contact-disclaimer">El email no se publica en las tarjetas. La app todavía no tiene cuentas ni sincronización entre dispositivos.</small><button className="submit-button" type="submit">Guardar perfil <span>→</span></button></form></section></div>}

      {showProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProfile(false); }}><section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button className="modal-close" onClick={() => setShowProfile(false)} aria-label="Cerrar">×</button><Avatar user={selectedUser} /><span className="section-kicker">{selectedUser.id === currentUser.id ? "TU CUENTA" : selectedUser.verified ? "PERFIL DE LA COMUNIDAD · VERIFICADO" : "PERFIL DE LA COMUNIDAD"}</span><h2 id="profile-title">{selectedUser.name}</h2><p>{selectedUser.place}, Mendoza · {selectedUser.id === "manos-abiertas" ? "Organización" : "Cuenta personal"}</p>{selectedUser.id === currentUser.id && selectedUser.email && <p className="profile-email">{selectedUser.email}</p>}<div className="profile-summary"><span><strong>{selectedUser.id === currentUser.id ? items.filter((item) => item.saved).length : selectedUser.helped}</strong><small>{selectedUser.id === currentUser.id ? "guardados" : "ayudas compartidas"}</small></span><i/><span><strong>{items.filter((item) => item.userId === selectedUser.id).length}</strong><small>publicaciones</small></span></div><p className="profile-activity">Última actividad: {selectedUser.activity.toLocaleLowerCase("es")}</p>{selectedUser.id === currentUser.id && <>{contactRequests.length > 0 && <div className="contact-outbox"><strong>Solicitudes preparadas ({contactRequests.length})</strong><small>Guardadas en este navegador; aún no notificadas.</small><ul>{contactRequests.slice(0, 3).map((request) => <li key={request.id}><span>{request.listingTitle}</span><small>Para {request.recipientName} · {request.createdAt}</small></li>)}</ul></div>}<button className="submit-button" onClick={() => { setShowProfile(false); setShowEditProfile(true); }}>Editar mi perfil <span>→</span></button></>}</section></div>}
    </main>
  );
}
