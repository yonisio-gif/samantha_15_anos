import React, { useRef, useState, useEffect } from 'react';
import Countdown from './components/Countdown';
import RSVPModal from './components/RSVPModal';

import musicFile from './assets/music.mp3';
import portadaImg from './assets/portada.png';
import castleImg from './assets/castle.png';
import carriageImg from './assets/carriage.png';
import qrPhotosImg from './assets/qr_photos.png';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const audioRef = useRef(null);
  const cardRef = useRef(null);

  // Parse URL Parameters for Personalization
  const [guestName, setGuestName] = useState('');
  const [guestPasses, setGuestPasses] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre');
    const pases = params.get('pases');

    if (nombre) setGuestName(decodeURIComponent(nombre));
    if (pases) setGuestPasses(pases);
  }, []);

  // Scroll Reveal Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const highlights = document.querySelectorAll('.reveal');
    highlights.forEach(el => observer.observe(el));

    return () => highlights.forEach(el => observer.unobserve(el));
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    // Play music when opening
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Playback error", e));
    }

    // Auto scroll down slowly
    setTimeout(() => {
      const scrollableDiv = document.querySelector('.card-content');
      if (scrollableDiv) {
        const maxScroll = scrollableDiv.scrollHeight - scrollableDiv.clientHeight;
        const duration = maxScroll * 15; // Velocidad de bajada lenta
        let startTime = null;
        let animationFrameId;

        const scrollStep = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const currentScroll = Math.min((progress / duration) * maxScroll, maxScroll);

          scrollableDiv.scrollTop = currentScroll;

          if (progress < duration) {
            animationFrameId = window.requestAnimationFrame(scrollStep);
          }
        };

        animationFrameId = window.requestAnimationFrame(scrollStep);

        // Permitir que el usuario detenga el autoscroll si interactúa
        const stopScroll = () => {
          if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        };
        scrollableDiv.addEventListener('wheel', stopScroll, { once: true, passive: true });
        scrollableDiv.addEventListener('touchstart', stopScroll, { once: true, passive: true });
      }
    }, 2500); // Esperar a que la animación termine
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const FairyDust = () => {
    return (
      <div className="fairy-dust-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-20px`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 20}s`
            }}
          />
        ))}
      </div>
    );
  };

  const MagicalDecorations = () => {
    return (
      <>
        {/* Twinkling Stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              '--twinkle-duration': `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        {/* Flying Butterflies */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`butterfly-${i}`}
            className="butterfly-container"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              '--fly-duration': `${Math.random() * 15 + 10}s`,
              animationDelay: `${Math.random() * -20}s`
            }}
          >
            <div className="butterfly-body">
              <div className="wing"></div>
              <div className="wing wing-right"></div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="scene">
      {/* Background Magic */}
      <MagicalDecorations />
      {isOpen && <FairyDust />}

      {/* Background Music */}
      <audio ref={audioRef} src={musicFile} loop />

      {/* ENVELOPE COVER (Replaced entirely by the physical image) */}
      <div className={`envelope-wrapper ${isOpen ? 'is-open' : ''}`}>
        <img
          src={portadaImg}
          alt="Portada"
          className="main-portada-img"
          onClick={handleOpen}
        />
      </div>

      {/* MAIN CONTENT CARD (Scales up when envelope drops) */}
      <div className="gatefold-card">

        {/* 3D DOORS: Castle and Carriage opening effect */}
        <div className={`door-container ${isOpen ? 'doors-open' : ''}`}>
          <div className="left-door">
            <img src={castleImg} alt="Castle" className="door-img" />
          </div>
          <div className="right-door">
            <img src={carriageImg} alt="Carriage" className="door-img" />
          </div>
        </div>

        {/* Dedicated Background Layer (Fixed, won't stretch with scroll) */}
        <div className="card-background"></div>

        {/* INNER CONTENT (Scrollable, now transparent over the background) */}
        <div className="card-content">

          {/* Narrow asymmetric column mapped to fit within the drawn folds and below the painted ribbon in fondo.png */}
          <div className="inner-text-column">

            <div className="mb-20 text-center reveal">
              <h2 className="samantha-name text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] mb-4 drop-shadow-2xl shimmer-gold tracking-widest font-bold">SAMANTHA</h2>
              <p className="silver-foil text-2xl md:text-3xl font-light tracking-[0.3em] uppercase">Mis XV Años</p>
            </div>

            <div className="mb-14 reveal">
              <p className="serif-font text-gray-500 text-xl md:text-2xl leading-relaxed mb-6 italic">
                Érase una vez una dulce niña que soñaba con su gran noche…<br />
                Una noche llena de magia, ilusiones y sueños por cumplir.<br />
                Como en el encantador cuento de Cenicienta, el carruaje está listo,<br />
                el castillo espera iluminado y el hada madrina ha preparado todo para una velada inolvidable.
              </p>
              <p className="serif-font text-gray-500 text-xl md:text-2xl leading-relaxed mb-6 italic">
                Hoy nuestra querida Samantha celebra sus 15 años,<br />
                y antes de que el reloj marque la medianoche,<br />
                una brillante zapatilla de cristal anunciará el comienzo de un nuevo capítulo en su historia.
              </p>
              <p className="serif-font text-gray-500 text-xl md:text-2xl leading-relaxed mb-6 italic">
                Con mucha alegría te invitamos a ser parte de este baile mágico<br />
                y acompañarnos a celebrar una noche llena de encanto,<br />
                donde los sueños se hacen realidad.
              </p>
              <p className="text-secondary-blue font-medium text-lg md:text-xl mt-8 italic">
                ¡Tu presencia hará que este cuento sea aún más maravilloso!
              </p>
            </div>

            <div className="flex justify-center items-center gap-4 mb-14 opacity-80 reveal">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
              <span className="silver-foil text-xl">✦</span>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
            </div>



            <div className="mb-14 reveal">
              <h3 className="serif-font text-2xl md:text-3xl text-secondary-blue mb-4 drop-shadow-sm">La Gran Celebración</h3>
              <p className="text-gray-500 uppercase tracking-widest text-sm mt-4">Sábado, 11 de Julio de 2026</p>
              <p className="silver-foil font-bold text-xl mt-2 drop-shadow-sm">5:30 PM</p>
            </div>

            <div className="mb-16 reveal">
              <Countdown targetDate="2026-07-11T17:30:00" />
            </div>

            <div className="flex justify-center items-center gap-4 mb-14 opacity-80 reveal">
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
              <span className="silver-foil text-xl">✦</span>
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
            </div>
            {/* Personalized Guest Passes Section (Correctly Positioned) */}
            {(guestName || guestPasses) && (
              <div className="mb-14 reveal p-6 rounded-2xl glass-panel text-center border-white/40 shadow-xl bg-white/10">
                <p className="serif-font text-xl md:text-2xl text-secondary-blue mb-4 italic">
                  {guestName ? `Querido(a) ${guestName},` : '¡Hola!'}
                </p>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-3 shadow-inner">
                    <span className="text-xl">🎟️</span>
                  </div>
                  <p className="text-gray-500 text-base md:text-lg leading-relaxed">
                    Esta invitación es válida para <span>{guestPasses || '—'}</span> {parseInt(guestPasses) === 1 ? 'persona' : 'personas'}.
                  </p>
                </div>
              </div>
            )}
            {/* Muestras de Cariño Section */}
            <div className="mt-8 mb-12 w-full flex flex-col items-center px-6 reveal">
              <h4 className="serif-font text-lg text-secondary-blue mb-3 italic">Muestras de Cariño</h4>
              <p className="delicate-note text-gray-500 text-sm italic leading-relaxed text-center">
                "Tu compañía es el brillo que iluminará la noche de Samantha. Si además de tu presencia deseas tener un detalle con ella, agradeceremos tu gesto a través de efectivo o <span className="font-bold">SINPE Móvil</span> al <span className="gold-text font-bold text-base cursor-pointer hover:underline pulse-interaction" onClick={() => handleCopy('83816071')}>83816071 📋</span>. Cualquier muestra de afecto será guardada con especial gratitud en su corazón."
              </p>
            </div>

            {/* Functional Sections - Highly Elegant Cards */}
            <div className="space-y-6 mt-16 text-center px-4 w-full max-w-[280px] reveal">
              <div className="glass-panel p-8 md:p-10 rounded-xl border-2 shadow-sm relative">
                <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                  <span className="text-xl">📍</span>
                </div>
                <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-3 mt-4 silver-foil">Ubicación</p>
                <p className="text-sm text-gray-500 mb-6 italic leading-relaxed">Palacio de Cristal<br />(Salón Principal)</p>
                <a href="https://maps.app.goo.gl/d4ETzErhtEo1vA3s5" target="_blank" rel="noreferrer" className="inline-block text-[10px] md:text-xs uppercase tracking-widest text-slate-500 border border-slate-300 px-6 py-2 rounded-full hover:bg-slate-100 transition duration-300">
                  Ver Mapa
                </a>
              </div>

              {/* Dress Code Section */}
              <div className="glass-panel p-8 md:p-10 rounded-xl border-2 shadow-sm relative mt-12 bg-white/5">
                <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                  <span className="text-xl">👗</span>
                </div>
                <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-3 mt-4 silver-foil">Código de Vestimenta</p>
                <p className="serif-font text-lg text-secondary-blue italic mb-4">"Guapos y Divinas"</p>
                <div className="pt-4 border-t border-slate-200/50">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Dato Extra</p>
                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    Reservado el color <span className="text-[#89CFF0] font-bold">Baby Blue (Celeste)</span> para la quinceañera.
                  </p>
                </div>
              </div>
            </div>

            {/* Photos Sharing Section */}
            <div className="mt-16 mb-8 w-full flex flex-col items-center reveal">
              <div className="glass-panel p-6 rounded-2xl border shadow-lg text-center max-w-[300px] w-full">
                <h3 className="serif-font text-xl text-secondary-blue mb-4">Comparte tus Momentos</h3>
                <p className="text-gray-500 text-xs mb-6 px-2">Haz clic en el botón para subir tus fotos a nuestro álbum del evento.</p>

                <a
                  href="https://drive.google.com/drive/folders/11Dl6o51Cn_FPcnfLdpVJ7IAaQ_GIB_aN"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white/80 hover:bg-white text-secondary-blue border border-secondary-blue/30 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-sm"
                >
                  <span>Subir Fotos</span>
                  <span className="text-lg">📸</span>
                </a>
              </div>
            </div>

            {/* Elegant RSVP Button */}
            <div className="mt-14 mb-8 w-full flex flex-col items-center justify-center gap-2 reveal">
              <div className="bg-red-50/80 border border-red-200 rounded-xl p-5 shadow-md text-center mb-6 w-full animate-pulse">
                <p className="text-base md:text-lg text-red-600 font-serif font-bold uppercase tracking-wider">
                  ⚠️ Importante ⚠️
                </p>
                <p className="text-sm md:text-base text-red-500 mt-2 font-serif">
                  Último día de confirmación: <span className="font-extrabold text-red-600 border-b border-red-300 pb-0.5">25 de junio</span>
                </p>
                <p className="text-xs text-red-400 mt-2 italic">Por favor, no olvides confirmar tu asistencia para asegurar tu lugar.</p>
              </div>
              
              {new Date() >= new Date('2026-06-26T00:00:00-06:00') ? (
                <button
                  disabled
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-serif text-sm md:text-base tracking-widest text-white uppercase overflow-hidden rounded-full shadow-lg bg-gray-400 cursor-not-allowed transition-all duration-500"
                >
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                  <span className="relative flex items-center gap-3">
                    Confirmar Asistencia
                    <span className="text-lg">✉</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setIsRSVPModalOpen(true)}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-serif text-sm md:text-base tracking-widest text-white uppercase overflow-hidden rounded-full shadow-lg bg-secondary-blue hover:bg-slate-700 transition-all duration-500"
                >
                  <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                  <span className="relative flex items-center gap-3">
                    Confirmar Asistencia
                    <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">✉</span>
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* RSVP Data Collection Modal */}
      <RSVPModal
        isOpen={isRSVPModalOpen}
        onClose={() => setIsRSVPModalOpen(false)}
        guestName={guestName}
        guestPasses={guestPasses}
      />

      {/* Custom Toast Notification */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl transition-all duration-500 z-[100] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <span>Número copiado, ¡gracias!</span>
        <span className="text-lg">✨</span>
      </div>
    </div>
  );
}

export default App;
