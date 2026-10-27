const requests = [
  {
    category: "HOGAR",
    title: "Un invierno más abrigado para 12 familias",
    place: "Godoy Cruz, Mendoza",
    needed: "Frazadas y ropa de abrigo",
    progress: 68,
    initials: "FA",
    color: "coral",
  },
  {
    category: "EDUCACIÓN",
    title: "Mochilas listas para volver a clases",
    place: "Las Heras, Mendoza",
    needed: "Útiles escolares y mochilas",
    progress: 42,
    initials: "BM",
    color: "lilac",
  },
  {
    category: "ALIMENTOS",
    title: "Una mesa compartida cada semana",
    place: "Ciudad de Mendoza",
    needed: "Alimentos no perecederos",
    progress: 81,
    initials: "CC",
    color: "yellow",
  },
];

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <header className="topbar wrap">
        <a className="brand" href="#inicio" aria-label="HELPi inicio">
          HELP<span>i</span><span className="brand-dot">.</span>
        </a>
        <nav className="nav-links" aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#necesidades">Necesidades</a>
          <a href="#nosotros">Quiénes somos</a>
        </nav>
        <div className="nav-actions">
          <a className="login" href="#ingresar">Ingresar</a>
          <a className="button button-dark button-small" href="#publicar">Quiero ayudar <ArrowIcon /></a>
        </div>
        <button className="menu-button" aria-label="Abrir menú">☰</button>
      </header>

      <section className="hero wrap" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-mark">✳</span> DAR Y RECIBIR, MÁS CERCA</div>
          <h1>Lo que te sobra,<br />puede cambiar <span>una vida.</span></h1>
          <p className="hero-text">Conectamos lo que alguien puede dar con lo que otra persona necesita. Así de simple. Así de humano.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#necesidades">Encontrar dónde ayudar <ArrowIcon /></a>
            <a className="button button-light" href="#publicar">Necesito algo <span aria-hidden="true">→</span></a>
          </div>
          <div className="hero-proof"><div className="avatar-stack"><i>V</i><i>M</i><i>J</i><i>+</i></div><span><strong>Una comunidad que se encuentra.</strong><br />Cada pequeño gesto puede mucho.</span></div>
        </div>
        <div className="hero-art" aria-label="Ilustración de una comunidad que comparte">
          <div className="art-sun" />
          <div className="art-note note-top"><span>✳</span> Lo bueno<br />se comparte</div>
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-person person-left"><div className="person-head" /><div className="person-body" /><div className="person-arm" /></div>
          <div className="art-person person-right"><div className="person-head" /><div className="person-body" /><div className="person-arm" /></div>
          <div className="gift"><div className="gift-bow">♡</div><div className="gift-box"><span /></div></div>
          <div className="art-note note-bottom">un gesto <b>→</b> un encuentro</div>
          <div className="spark spark-a">✦</div><div className="spark spark-b">✳</div><div className="spark spark-c">·</div>
        </div>
        <div className="hero-bottom"><span>01 — 03</span><span>DESLIZÁ PARA DESCUBRIR <b>↓</b></span><span>MENDOZA, ARGENTINA</span></div>
      </section>

      <section className="intro-section" id="como-funciona">
        <div className="wrap intro-grid">
          <div><div className="eyebrow eyebrow-muted">UNA IDEA QUE NOS UNE</div><h2>Dar también es<br /><span>encontrarse.</span></h2></div>
          <div className="intro-body"><p>Hay cosas que ya no usamos. Y hay personas para quienes pueden ser justo lo que necesitan. HELPi hace que ese encuentro suceda.</p><a className="text-link" href="#nosotros">Conocé cómo funciona <span>↗</span></a></div>
          <div className="intro-stats"><div><strong>01</strong><span>Publicá lo que<br />necesitás o querés dar</span></div><div><strong>02</strong><span>Conectá con alguien<br />cerca tuyo</span></div><div><strong>03</strong><span>Coordiná y hacé<br />que pase</span></div></div>
        </div>
      </section>

      <section className="requests-section wrap" id="necesidades">
        <div className="section-heading"><div><div className="eyebrow eyebrow-muted">OPORTUNIDADES PARA HACER LA DIFERENCIA</div><h2>Hay alguien que<br /><span>te está esperando.</span></h2></div><a className="text-link all-link" href="#explorar">Ver todas las necesidades <span>↗</span></a></div>
        <div className="filter-row"><button className="filter active">Todas <span>12</span></button><button className="filter">Hogar</button><button className="filter">Educación</button><button className="filter">Alimentos</button><button className="filter">Ropa</button><span className="nearby">⌖ &nbsp; Cerca de mí</span></div>
        <div className="request-grid">
          {requests.map((request) => <article className="request-card" key={request.title}>
            <div className={`card-visual ${request.color}`}><span className="category">{request.category}</span><span className="card-illustration" aria-hidden="true">{request.color === "coral" ? "⌂" : request.color === "lilac" ? "✎" : "♡"}</span><span className="card-heart">♡</span></div>
            <div className="card-content"><div className="card-location">⌖ &nbsp;{request.place}</div><h3>{request.title}</h3><div className="need-label">ESTÁN BUSCANDO</div><div className="need-pill">{request.needed}</div><div className="progress-meta"><span>{request.progress}% cubierto</span><span>Falta un poquito</span></div><div className="progress-track"><span style={{ width: `${request.progress}%` }} /></div><a className="card-link" href="#publicar">Quiero colaborar <span>↗</span></a></div>
          </article>)}
        </div>
      </section>

      <section className="cta-section" id="publicar"><div className="wrap cta-content"><div className="cta-symbol">✳</div><div className="eyebrow">CADA GESTO CUENTA</div><h2>Lo que hoy no necesitás,<br />mañana puede ser <span>todo.</span></h2><p>Publicá una necesidad o encontrá a quién ayudar.<br />El primer paso es encontrarnos.</p><div className="hero-actions"><a className="button button-dark" href="#necesidades">Quiero donar <ArrowIcon /></a><a className="button button-outline" href="#contacto">Necesito ayuda <span>→</span></a></div></div><div className="cta-decoration deco-one">✳</div><div className="cta-decoration deco-two">♡</div></section>

      <footer className="footer wrap" id="nosotros"><a className="brand" href="#inicio">HELP<span>i</span><span className="brand-dot">.</span></a><span>Lo que a vos te sobra, a alguien le puede cambiar la vida.</span><div className="footer-links"><a href="#contacto">Contacto</a><a href="#instagram">Instagram ↗</a></div><small>© 2026 HELPi · Hecho con cariño en Mendoza</small></footer>
    </main>
  );
}
