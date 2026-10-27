"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Listing = {
  id: number;
  kind: "donation" | "need";
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
  latitude?: number;
  longitude?: number;
};

type Coordinates = { latitude: number; longitude: number };

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

function distanceInKm(from: Coordinates, to: Coordinates) {
  const toRadians = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  { id: 1, kind: "need", userId: "lucia", title: "Abrigo para este invierno", category: "Ropa", place: "Godoy Cruz", distance: "1,2 km", detail: "Frazadas y camperas en buen estado", icon: "🧣", tone: "peach", posted: "Hace 2 h", latitude: -32.93, longitude: -68.85 },
  { id: 2, kind: "need", userId: "diego", title: "Libros para seguir aprendiendo", category: "Educación", place: "Ciudad de Mendoza", distance: "2,4 km", detail: "Libros de primaria y cuentos infantiles", icon: "📚", tone: "blue", posted: "Hace 5 h", latitude: -32.89, longitude: -68.84 },
  { id: 3, kind: "need", userId: "sofia", title: "Una mano para equipar el comedor", category: "Hogar", place: "Las Heras", distance: "3,1 km", detail: "Vajilla, ollas y utensilios de cocina", icon: "🍲", tone: "yellow", posted: "Ayer", latitude: -32.85, longitude: -68.83 },
  { id: 4, kind: "need", userId: "mateo", title: "Materiales para el taller de arte", category: "Educación", place: "Guaymallén", distance: "4,6 km", detail: "Lápices, témperas y hojas para dibujar", icon: "🎨", tone: "lilac", posted: "Ayer", latitude: -32.88, longitude: -68.79 },
  { id: 5, kind: "need", userId: "manos-abiertas", title: "Una compra compartida", category: "Alimentos", place: "Ciudad de Mendoza", distance: "2,8 km", detail: "Alimentos para una familia esta semana", icon: "🥕", tone: "yellow", posted: "Hace 3 h", latitude: -32.89, longitude: -68.84 },
  { id: 6, kind: "need", userId: "valentina", title: "Una compu para seguir estudiando", category: "Tecnología", place: "Maipú", distance: "5,2 km", detail: "Notebook en funcionamiento para estudiar", icon: "💻", tone: "blue", posted: "Ayer", latitude: -32.98, longitude: -68.79 },
  { id: 7, kind: "donation", userId: "martina", title: "Campera abrigada para compartir", category: "Ropa", place: "Godoy Cruz", distance: "1,1 km", detail: "Campera en buen estado, talle M", icon: "🧥", tone: "peach", posted: "Hoy", latitude: -32.94, longitude: -68.86 },
  { id: 8, kind: "donation", userId: "diego", title: "Lote de libros infantiles", category: "Educación", place: "Ciudad de Mendoza", distance: "2,1 km", detail: "Cuentos y libros de primaria para donar", icon: "📖", tone: "blue", posted: "Hoy", latitude: -32.89, longitude: -68.84 },
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
  const [listingKindFilter, setListingKindFilter] = useState<"all" | "donation" | "need">("all");
  const [activeNav, setActiveNav] = useState("inicio");
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newListingKind, setNewListingKind] = useState<"donation" | "need">("need");
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [sortNearest, setSortNearest] = useState(false);
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
        const savedListings = (JSON.parse(storedListings) as Listing[]).map((item) => ({ ...item, kind: item.kind === "donation" ? "donation" as const : "need" as const }));
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
    const matchesKind = listingKindFilter === "all" || item.kind === listingKindFilter;
    return matchesCategory && matchesQuery && matchesSaved && matchesKind;
  }).sort((a, b) => {
    if (!sortNearest || !userPosition) return 0;
    const aDistance = a.latitude === undefined || a.longitude === undefined ? Number.POSITIVE_INFINITY : distanceInKm(userPosition, { latitude: a.latitude, longitude: a.longitude });
    const bDistance = b.latitude === undefined || b.longitude === undefined ? Number.POSITIVE_INFINITY : distanceInKm(userPosition, { latitude: b.latitude, longitude: b.longitude });
    return aDistance - bDistance;
  }), [items, category, query, activeNav, listingKindFilter, sortNearest, userPosition]);

  const matches = useMemo(() => {
    const needs = items.filter((item) => item.kind === "need");
    const donations = items.filter((item) => item.kind === "donation");
    return needs.flatMap((need) => donations
      .filter((donation) => donation.category === need.category && donation.userId !== need.userId)
      .map((donation) => ({ need, donation, distance: need.latitude === undefined || need.longitude === undefined || donation.latitude === undefined || donation.longitude === undefined ? null : distanceInKm({ latitude: need.latitude, longitude: need.longitude }, { latitude: donation.latitude, longitude: donation.longitude }) })))
      .filter((match) => match.distance === null || match.distance <= 50)
      .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));
  }, [items]);

  function openPublishForm(kind: "donation" | "need" = "need") {
    setNewListingKind(kind);
    setShowCreate(true);
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setNotice("Tu navegador no ofrece geolocalización.");
      return;
    }
    setNotice("Solicitando permiso para usar tu ubicación…");
    navigator.geolocation.getCurrentPosition((position) => {
      setUserPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setSortNearest(true);
      setNotice("Ubicación activada. Mostramos primero las publicaciones más cercanas.");
      window.setTimeout(() => setNotice(""), 4200);
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED ? "No se autorizó el acceso a tu ubicación." : "No pudimos obtener tu ubicación. Podés volver a intentarlo.";
      setNotice(message);
      window.setTimeout(() => setNotice(""), 4200);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  function listingDistance(item: Listing) {
    if (userPosition && item.latitude !== undefined && item.longitude !== undefined) {
      return `${distanceInKm(userPosition, { latitude: item.latitude, longitude: item.longitude }).toFixed(1).replace(".", ",")} km`;
    }
    return item.distance;
  }

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
    const includeLocation = form.get("includeLocation") === "on" && Boolean(userPosition);
    if (!title || !place) return;
    const newListing: Listing = {
      id: Date.now(), userId: currentUser.id, kind: newListingKind, title, category: kind, place,
      distance: includeLocation ? "0 km" : "Sin ubicación precisa", detail: detail || "Una nueva oportunidad para ayudar",
      icon: newListingKind === "donation" ? "🎁" : "💛", tone: "peach", posted: "Ahora", images: newPhotos,
      ...(includeLocation && userPosition ? userPosition : {}),
    };
    const nextItems = [newListing, ...items];
    try {
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(nextItems));
    } catch {
      setNotice("No pudimos guardar la publicación. Probá con menos fotos.");
      return;
    }
    setItems(nextItems);
    setCategory("Todo");
    setListingKindFilter("all");
    setActiveNav("inicio");
    setShowCreate(false);
    setNewPhotos([]);
    setPhotoError("");
    setNotice(`¡Listo! Tu ${newListingKind === "donation" ? "donación" : "necesidad"} quedó publicada en este navegador.`);
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
        <button type="button" className="side-location" onClick={requestLocation} aria-label="Activar geolocalización"><span className="location-icon"><PinIcon /></span><span><small>{userPosition ? "Ubicación activa" : "Tu ubicación"}</small><strong>{userPosition ? "Cerca de vos" : `${currentUser.place}, Argentina`}</strong></span><span className="chevron">⌄</span></button>
        <div className="side-label">MENÚ</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {navItems.map((item) => <button key={item.id} className={`side-nav-item ${activeNav === item.id ? "selected" : ""}`} onClick={() => selectNav(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}
        </nav>
        <button className="publish-menu-button" onClick={() => openPublishForm()}><span>＋</span> Publicar <b>+</b></button>
        <div className="side-promo">
          <div className="promo-mascot"><Image src="/helpi-heart.svg" alt="Helpi, el corazón que conecta" width={84} height={84} /></div>
          <strong>Un gesto puede<br />cambiar un día.</strong>
          <p>Encontrá algo que puedas compartir hoy.</p>
          <button onClick={() => openPublishForm("donation")}>Publicar una donación <span>↗</span></button>
        </div>
        <button className="profile-mini" onClick={() => { setSelectedUser(currentUser); setShowProfile(true); }}><Avatar user={currentUser} /><span className="profile-copy"><strong>{currentUser.name}</strong><small>Cuenta personal</small></span><span className="more">···</span></button>
      </aside>

      <section className="workspace">
        <header className="app-topbar">
          <div className="mobile-brand"><Brand /></div>
          <button type="button" className="mobile-location" onClick={requestLocation} aria-label="Activar geolocalización"><PinIcon /><span>{userPosition ? "Cerca de vos" : currentUser.place}</span><b>⌄</b></button>
          <div className="topbar-right"><button className="top-icon" aria-label="Notificaciones" onClick={() => setNotice("Los avisos por email requieren conectar un servicio de correo.")}>♧<i /></button><button className="top-avatar" onClick={() => { setSelectedUser(currentUser); setShowProfile(true); }}>{currentUser.initials}</button></div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div><div className="hello-overline">MARTES, 27 DE OCTUBRE <span>· {currentUser.place.toLocaleUpperCase("es")}</span></div><h1>Hola, {currentUser.name.split(" ")[0]} <span className="wave">✳</span></h1><p>Hoy puede ser el día en que algo encuentre a alguien.</p></div>
            <button className="post-button" onClick={() => openPublishForm("donation")}><span>＋</span> Publicar donación</button>
          </div>

          <section className="welcome-card">
            <div className="welcome-text"><span className="tiny-tag"><span>♥</span> LA COMUNIDAD HELPi</span><h2>Lo que a vos te sobra,<br /><span>a alguien le puede cambiar la vida.</span></h2><p>Un montón de cosas esperan un nuevo hogar.<br className="desktop-break" /> Capaz la próxima es justo lo que alguien necesita.</p><button onClick={() => selectNav("explorar")}>Explorar necesidades <span>→</span></button></div>
            <div className="welcome-image"><span className="image-glow"/><Image src="/helpi-heart.svg" alt="Helpi, la mascota corazón de la comunidad" width={226} height={226} priority /><span className="bubble bubble-one">¡Hola, Martina!</span><span className="bubble bubble-two">♥</span><span className="image-caption">UN ENCUENTRO<br />PUEDE EMPEZAR ACÁ</span></div>
            <span className="welcome-spark spark-one">✳</span><span className="welcome-spark spark-two">✦</span>
          </section>

          <div className="quick-stats"><div className="stat-icon stat-coral">♥</div><span><strong>{items.filter((item) => item.kind === "need").length}</strong><small>necesidades abiertas</small></span><i className="stat-separator"/><div className="stat-icon stat-blue">↗</div><span><strong>{items.filter((item) => item.kind === "donation").length}</strong><small>donaciones publicadas</small></span><a href="#explorar" onClick={() => selectNav("explorar")}>Ver oportunidades <span>→</span></a></div>

          {matches.length > 0 && <section className="matching-section" aria-labelledby="matching-title"><div className="section-title"><div><span className="section-kicker">DONACIONES QUE PUEDEN CUBRIR UNA NECESIDAD</span><h2 id="matching-title">Coincidencias posibles</h2></div></div><div className="matching-grid">{matches.slice(0, 3).map(({ need, donation, distance }) => { const requester = usersById.get(need.userId) || currentUser; const donor = usersById.get(donation.userId) || currentUser; const target = need.userId === currentUser.id ? donation : need; return <article className="matching-card" key={`${need.id}-${donation.id}`}><span className="matching-category">{need.category}{distance !== null && ` · ${distance.toFixed(1).replace(".", ",")} km entre publicaciones`}</span><h3>{donation.title}</h3><p>puede ayudar con</p><h3>{need.title}</h3><div className="matching-people"><span>Ofrece <strong>{donor.name}</strong></span><span>Necesita <strong>{requester.name}</strong></span></div><button type="button" onClick={() => showContactForm(target)}>Ver coincidencia <span>→</span></button></article>; })}</div></section>}

          <section className="discover" id="explorar">
            <div className="section-title"><div><span className="section-kicker">ENCUENTROS QUE PUEDEN PASAR</span><h2>Publicaciones cerca tuyo</h2></div><button className="text-action" onClick={() => { setCategory("Todo"); setListingKindFilter("all"); setActiveNav("explorar"); }}>Ver todas <span>→</span></button></div>
            <div className="search-row"><label className="search-box"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿Qué te gustaría encontrar?" aria-label="Buscar publicaciones" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="1.5"/><circle cx="15" cy="12" r="1.5"/></svg><span>Filtros</span></button></div>
            {showFilters && <div className="listing-filters" role="group" aria-label="Filtrar publicaciones"><span>Tipo de publicación</span><button type="button" className={listingKindFilter === "all" ? "active" : ""} onClick={() => setListingKindFilter("all")}>Todas</button><button type="button" className={listingKindFilter === "donation" ? "active" : ""} onClick={() => setListingKindFilter("donation")}>Donaciones</button><button type="button" className={listingKindFilter === "need" ? "active" : ""} onClick={() => setListingKindFilter("need")}>Necesidades</button><button type="button" className="clear-filters" onClick={() => { setCategory("Todo"); setListingKindFilter("all"); setQuery(""); }}>Limpiar</button></div>}
            <div className="category-row" role="tablist" aria-label="Categorías">
              {categories.map((entry, index) => <button key={entry} role="tab" aria-selected={category === entry} className={`category-chip ${category === entry ? "active" : ""}`} onClick={() => setCategory(entry)}><span className={`category-dot dot-${index}`} />{entry}{entry === "Todo" && <small>12</small>}</button>)}
            </div>
            <div className="results-heading"><span>{activeNav === "guardados" ? "TUS GUARDADOS" : listingKindFilter === "donation" ? "DONACIONES" : listingKindFilter === "need" ? "NECESIDADES" : "PARA VOS"}</span><button onClick={() => { if (!userPosition) requestLocation(); else setSortNearest((value) => !value); }}>{sortNearest ? "Más cercanas ✓" : "Más cercanas"} <span>⌄</span></button></div>
            <div className="listing-grid">
              {visibleItems.map((item) => <article className="listing-card" key={item.id}>
                <div className={`listing-art art-${item.tone}`}>
                  {item.images?.length ? <Image className="listing-photo" src={item.images[carouselIndexes[item.id] || 0]} alt={`${item.title}, foto ${(carouselIndexes[item.id] || 0) + 1}`} fill sizes="(max-width: 760px) 50vw, 300px" unoptimized /> : <span className="item-emoji" aria-hidden="true">{item.icon}</span>}
                  <span className="art-category">{item.category}</span><span className={`listing-kind-badge kind-${item.kind}`}>{item.kind === "donation" ? "Donación" : "Necesidad"}</span>
                  {item.images && item.images.length > 1 && <><button className="carousel-arrow carousel-prev" onClick={() => changeCarousel(item.id, -1, item.images!.length)} aria-label="Foto anterior">‹</button><button className="carousel-arrow carousel-next" onClick={() => changeCarousel(item.id, 1, item.images!.length)} aria-label="Foto siguiente">›</button><span className="carousel-count">{(carouselIndexes[item.id] || 0) + 1}/{item.images.length}</span></>}
                  <button className={`save-button ${item.saved ? "is-saved" : ""}`} onClick={() => toggleSaved(item.id)} aria-label={item.saved ? "Quitar de guardados" : "Guardar necesidad"}>{item.saved ? "♥" : "♡"}</button><span className="art-lines" />
                </div>
                <div className="listing-info"><div className="listing-place"><PinIcon />{item.place}<span>·</span>{listingDistance(item)}</div><h3>{item.title}</h3><p>{item.detail}</p><div className="listing-owner"><button onClick={() => { setSelectedUser(usersById.get(item.userId) || currentUser); setShowProfile(true); }}><Avatar user={usersById.get(item.userId) || currentUser} small /><span className="owner-copy"><strong>{(usersById.get(item.userId) || currentUser).name}</strong><small>{item.posted}{(usersById.get(item.userId) || currentUser).verified && <i aria-label="Perfil verificado"> ✓</i>}</small></span><span className="owner-arrow">↗</span></button></div><button className="contact-button" onClick={() => showContactForm(item)}>Contactar <span>↗</span></button></div>
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

      <nav className="mobile-nav" aria-label="Navegación móvil">{mobileNavItems.map((item) => <button key={item.id} onClick={() => item.id === "publicar" ? openPublishForm() : selectNav(item.id)} className={`${activeNav === item.id ? "active" : ""} ${item.id === "publicar" ? "mobile-publish" : ""}`} aria-label={item.label}><span>{item.icon}</span><small>{item.label}</small></button>)}</nav>

      {notice && <div role="status" className="toast"><span>♥</span>{notice}<button onClick={() => setNotice("")} aria-label="Cerrar">×</button></div>}

      {showCreate && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><button className="modal-close" onClick={() => setShowCreate(false)} aria-label="Cerrar">×</button><span className="modal-mark">＋</span><span className="section-kicker">HACÉ QUE ALGO BUENO PASE</span><h2 id="create-title">{newListingKind === "donation" ? "Publicá una donación" : "Publicá una necesidad"}</h2><p>{newListingKind === "donation" ? "Contale a la comunidad qué querés compartir." : "Contale a la comunidad qué estás buscando."}</p><div className="publish-kind-selector" role="group" aria-label="Tipo de publicación"><button type="button" className={newListingKind === "donation" ? "active" : ""} onClick={() => setNewListingKind("donation")}>Ofrecer donación</button><button type="button" className={newListingKind === "need" ? "active" : ""} onClick={() => setNewListingKind("need")}>Pedir ayuda</button></div><form onSubmit={createListing}><label>{newListingKind === "donation" ? "¿Qué querés donar?" : "¿Qué necesitás?"}<input name="title" required placeholder={newListingKind === "donation" ? "Ej. Libros infantiles en buen estado" : "Ej. Abrigo para este invierno"} /></label><div className="form-row"><label>Categoría<select name="category">{categories.slice(1).map((entry) => <option key={entry}>{entry}</option>)}</select></label><label>Zona<input name="place" required defaultValue={currentUser.place} placeholder="Ej. Godoy Cruz" /></label></div><label>Un poco más de detalle<textarea name="detail" rows={3} placeholder={newListingKind === "donation" ? "Describí el estado y disponibilidad…" : "Contanos qué te serviría y para quién es…"} /></label><label className="photo-upload">Fotos de la publicación<input type="file" accept="image/*" multiple onChange={addPhotos} /><small>Hasta 4 imágenes; se optimizan para esta demo local.</small></label>{newPhotos.length > 0 && <div className="photo-preview-grid">{newPhotos.map((photo, index) => <div className="photo-preview" key={`${photo.slice(-24)}-${index}`}><Image src={photo} alt={`Vista previa ${index + 1}`} width={88} height={72} unoptimized /><button type="button" onClick={() => setNewPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Quitar foto ${index + 1}`}>×</button></div>)}</div>}{photoError && <small className="photo-error" role="alert">{photoError}</small>}<label className="location-consent"><input type="checkbox" name="includeLocation" disabled={!userPosition} /><span>Incluir mi ubicación precisa en esta publicación.</span></label>{!userPosition && <button type="button" className="location-request" onClick={requestLocation}>Activar ubicación para ordenar por distancia</button>}<button className="submit-button" type="submit">Publicar {newListingKind === "donation" ? "donación" : "necesidad"} <span>→</span></button><small>Queda guardada en este navegador; todavía no se comparte en línea.</small></form></section></div>}

      {contactTarget && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setContactTarget(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="contact-title"><button className="modal-close" onClick={() => setContactTarget(null)} aria-label="Cerrar">×</button><span className="modal-mark">↗</span><span className="section-kicker">UN ENCUENTRO PUEDE EMPEZAR ACÁ</span><h2 id="contact-title">Contactar a {(usersById.get(contactTarget.userId) || currentUser).name}</h2><p>Sobre <strong>{contactTarget.title}</strong>. Contale quién sos y por qué te interesa.</p><form onSubmit={createContactRequest}><label>Tu nombre<input name="senderName" required minLength={2} maxLength={80} defaultValue={currentUser.name} autoComplete="name" /></label><label>Tu email<input name="senderEmail" type="email" required maxLength={254} defaultValue={currentUser.email || ""} placeholder="vos@ejemplo.com" autoComplete="email" /></label><label>Mensaje<textarea name="message" rows={4} required minLength={10} maxLength={1000} placeholder="Hola, me interesa esta publicación…" /></label><small className="contact-disclaimer">Demo local: la solicitud queda guardada en este navegador. El destinatario todavía no recibe el mensaje.</small><button className="submit-button" type="submit">Guardar solicitud <span>→</span></button></form></section></div>}

      {showEditProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowEditProfile(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><button className="modal-close" onClick={() => setShowEditProfile(false)} aria-label="Cerrar">×</button><span className="modal-mark">◉</span><span className="section-kicker">TU CUENTA</span><h2 id="edit-profile-title">Editar perfil</h2><p>Actualizá los datos que usás en esta demo. Quedan guardados solo en este navegador.</p><form onSubmit={saveProfile}><label>Nombre<input name="profileName" required minLength={2} maxLength={80} defaultValue={profile.name} autoComplete="name" /></label><label>Email de contacto<input name="profileEmail" type="email" required maxLength={254} defaultValue={profile.email || ""} placeholder="vos@ejemplo.com" autoComplete="email" /></label><label>Localidad<input name="profilePlace" required maxLength={100} defaultValue={profile.place} autoComplete="address-level2" /></label><small className="contact-disclaimer">El email no se publica en las tarjetas. La app todavía no tiene cuentas ni sincronización entre dispositivos.</small><button className="submit-button" type="submit">Guardar perfil <span>→</span></button></form></section></div>}

      {showProfile && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProfile(false); }}><section className="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button className="modal-close" onClick={() => setShowProfile(false)} aria-label="Cerrar">×</button><Avatar user={selectedUser} /><span className="section-kicker">{selectedUser.id === currentUser.id ? "TU CUENTA" : selectedUser.verified ? "PERFIL DE LA COMUNIDAD · VERIFICADO" : "PERFIL DE LA COMUNIDAD"}</span><h2 id="profile-title">{selectedUser.name}</h2><p>{selectedUser.place}, Mendoza · {selectedUser.id === "manos-abiertas" ? "Organización" : "Cuenta personal"}</p>{selectedUser.id === currentUser.id && selectedUser.email && <p className="profile-email">{selectedUser.email}</p>}<div className="profile-summary"><span><strong>{selectedUser.id === currentUser.id ? items.filter((item) => item.saved).length : selectedUser.helped}</strong><small>{selectedUser.id === currentUser.id ? "guardados" : "ayudas compartidas"}</small></span><i/><span><strong>{items.filter((item) => item.userId === selectedUser.id).length}</strong><small>publicaciones</small></span></div><p className="profile-activity">Última actividad: {selectedUser.activity.toLocaleLowerCase("es")}</p>{selectedUser.id === currentUser.id && <>{contactRequests.length > 0 && <div className="contact-outbox"><strong>Solicitudes preparadas ({contactRequests.length})</strong><small>Guardadas en este navegador; aún no notificadas.</small><ul>{contactRequests.slice(0, 3).map((request) => <li key={request.id}><span>{request.listingTitle}</span><small>Para {request.recipientName} · {request.createdAt}</small></li>)}</ul></div>}<button className="submit-button" onClick={() => { setShowProfile(false); setShowEditProfile(true); }}>Editar mi perfil <span>→</span></button></>}</section></div>}
    </main>
  );
}
