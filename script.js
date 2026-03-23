document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav a");
  const sectionSwitchLinks = document.querySelectorAll("a.section-switch");
  const sections = document.querySelectorAll(".section");
  const menuToggle = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const langToggle = document.getElementById("lang-toggle");
  let currentLang = "pl";

  // Auto-wstawianie obrazków: plik w folderze `images/` ma nazwę równą id elementu.
  // Przykład: <img id="method-1" ...> => images/method-1.png (lub .jpg/.webp).
  function initAutoImages() {
    const imgs = document.querySelectorAll('img.auto-image[id]');
    const exts = ["png", "jpg", "jpeg", "webp", "gif", "heic"];

    imgs.forEach((img) => {
      const baseName = img.id;
      const rawFolder = img.dataset.folder || "images";
      const folder = rawFolder.endsWith("/") ? rawFolder : `${rawFolder}/`;
      const explicitFilename = img.dataset.filename;
      const fallbackSrc = img.getAttribute("src") || "";
      let i = 0;

      // Jeśli podasz pełną nazwę pliku w `data-filename`, spróbujemy go wczytać,
      // a przy błędzie automatycznie sprawdzimy też popularne alternatywne rozszerzenia.
      if (explicitFilename) {
        const dotIndex = explicitFilename.lastIndexOf(".");
        const hasExt = dotIndex > 0;
        const baseFromFilename = hasExt ? explicitFilename.slice(0, dotIndex) : explicitFilename;
        const extFromFilename = hasExt ? explicitFilename.slice(dotIndex + 1).toLowerCase() : "";
        const candidateExts = [extFromFilename, "jpg", "jpeg", "png", "webp", "gif", "heic"].filter(Boolean);
        const uniqueExts = [...new Set(candidateExts)];
        const candidates = hasExt
          ? [explicitFilename, ...uniqueExts.map((ext) => `${baseFromFilename}.${ext}`)]
          : uniqueExts.map((ext) => `${baseFromFilename}.${ext}`);

        let candidateIndex = 0;
        const tryCandidate = () => {
          const candidate = candidates[candidateIndex];
          if (!candidate) {
            img.onerror = null;
            if (fallbackSrc) img.src = fallbackSrc;
            return;
          }
          img.src = `${folder}${encodeURI(candidate)}`;
        };

        img.onerror = () => {
          candidateIndex += 1;
          tryCandidate();
        };

        tryCandidate();
        return;
      }

      const tryLoad = () => {
        const ext = exts[i];
        if (!ext) {
          // Nic nie znaleziono: zostawiamy fallback.
          img.onerror = null;
          if (fallbackSrc) img.src = fallbackSrc;
          return;
        }
        img.src = `${folder}${baseName}.${ext}`; // np. galeria/gallery-1.png
      };

      img.onerror = () => {
        i += 1;
        tryLoad();
      };

      tryLoad();
    });
  }

  function initGalleryLightbox() {
    const galleryImages = Array.from(document.querySelectorAll(".gallery img"));
    if (!galleryImages.length) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Zamknij podgląd">×</button>
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Poprzednie zdjęcie">‹</button>
      <img class="lightbox-image" alt="" />
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Następne zdjęcie">›</button>
      <div class="lightbox-thumbs" aria-label="Miniatury galerii"></div>
    `;
    document.body.appendChild(overlay);

    const lightboxImage = overlay.querySelector(".lightbox-image");
    const closeBtn = overlay.querySelector(".lightbox-close");
    const prevBtn = overlay.querySelector(".lightbox-prev");
    const nextBtn = overlay.querySelector(".lightbox-next");
    const thumbsWrap = overlay.querySelector(".lightbox-thumbs");
    const thumbs = [];
    let activeIndex = 0;

    const setActiveThumb = (index) => {
      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle("is-active", i === index);
      });
      const activeThumb = thumbs[index];
      if (activeThumb) {
        activeThumb.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      }
    };

    const closeLightbox = () => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
    };

    const showImage = (index) => {
      activeIndex = (index + galleryImages.length) % galleryImages.length;
      const img = galleryImages[activeIndex];
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || "Podgląd zdjęcia";
      setActiveThumb(activeIndex);
    };

    const openLightbox = (index) => {
      showImage(index);
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    };

    const showPrev = () => showImage(activeIndex - 1);
    const showNext = () => showImage(activeIndex + 1);

    galleryImages.forEach((img, index) => {
      const thumb = document.createElement("img");
      thumb.className = "lightbox-thumb";
      thumb.src = img.currentSrc || img.src;
      thumb.alt = img.alt || `Miniatura ${index + 1}`;
      thumb.addEventListener("click", () => showImage(index));
      thumbsWrap.appendChild(thumb);
      thumbs.push(thumb);
    });

    galleryImages.forEach((img, index) => {
      img.addEventListener("click", () => {
        openLightbox(index);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        showPrev();
      } else if (e.key === "ArrowRight") {
        showNext();
      }
    });
  }

  function initMobileMenu() {
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function closeMobileMenu() {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function applyTranslations(lang) {
    const t = {
      pl: {
        title: "Kwantowe wspomaganie fotowoltaiki",
        navHome: "Home",
        navProject: "Projekt",
        navAbout: "O nas",
        navMethod: "Metodologia",
        homeTitle: "Strona główna",
        homeLead:
          "Projekt „Kwantowe wspomaganie fotowoltaiki” koncentruje się na zwiększeniu sprawności paneli słonecznych poprzez wykorzystanie nowoczesnych materiałów półprzewodnikowych, takich jak perowskity oraz warstwy z kropkami kwantowymi. W ramach badań analizowaliśmy pracę różnych typów ogniw fotowoltaicznych w zróżnicowanych warunkach oświetleniowych, temperaturowych oraz geometrycznych. Uzyskane wyniki pozwoliły określić najbardziej perspektywiczne kierunki rozwoju technologii tandemowych, które mogą znacząco zwiększyć efektywność przyszłych instalacji fotowoltaicznych. Dodatkowo zestawialiśmy obserwacje eksperymentalne z wnioskami z modelowania, aby lepiej uzasadnić dobór konfiguracji materiałowych.",
        aboutProjectTitle: "O projekcie",
        aboutProjectText:
          "Projekt rozwijamy z myślą o innowacjach w obszarze nauki, technologii i edukacji. Cel: przygotowanie koncepcji do konkursu EUCYS.",
        teamTitle: "Nasz zespół",
        teamText:
          "Współpracujemy jako para badawcza, tworząc eksperymenty i dokumentację. Wszystko w zgodzie z etyką naukową i standardami konkursu.",
        methodologyTitle: "Metodologia",
        methodologyText:
          "Seria eksperymentów laboratoryjnych oraz pomiary terenowe pozwoliły ocenić potencjał rozwiązań tandemowych w warunkach zbliżonych do rzeczywistych.",
        download: "Pobierz szczegółowy raport metodologii (PDF)",
        gallery: "Galeria",
        projectTitle: "Opis projektu",
        aboutTitle: "O nas",
        methodTitle: "Metodologia",
        footer: "© 2026 EUCYS. Autorzy: Szymon Jagiełło, Kamil Lauzer.",
        projectP1:
          "Projekt „Kwantowe wspomaganie fotowoltaiki” koncentruje się na analizie możliwości zwiększenia sprawności energetycznej ogniw fotowoltaicznych poprzez zastosowanie nowoczesnych materiałów półprzewodnikowych oraz konfiguracji wielowarstwowych typu tandem. W szczególności badania dotyczyły wykorzystania warstw zawierających kropki kwantowe oraz struktur perowskitowych jako elementów rozszerzających zakres absorpcji promieniowania elektromagnetycznego przez klasyczne ogniwa krzemowe.",
        projectP2:
          "Podstawowym problemem współczesnej fotowoltaiki jest ograniczona sprawność pojedynczych ogniw wynikająca z fizycznych właściwości materiałów półprzewodnikowych oraz niepełnego wykorzystania widma promieniowania słonecznego. Znaczna część energii docierającej do powierzchni paneli nie jest efektywnie konwertowana na energię elektryczną, co ogranicza możliwości dalszego zwiększania wydajności standardowych instalacji fotowoltaicznych. Z tego względu jednym z najbardziej obiecujących kierunków rozwoju technologii PV są rozwiązania tandemowe, umożliwiające jednoczesne wykorzystanie różnych zakresów widma promieniowania.",
        projectP3:
          "Celem projektu było przeanalizowanie wpływu zastosowania warstw pośrednich opartych na nanostrukturach półprzewodnikowych na parametry pracy układów fotowoltaicznych oraz określenie ich potencjału w kontekście zwiększania sprawności energetycznej instalacji solarnych. W ramach badań przeprowadzono serię eksperymentów laboratoryjnych oraz pomiarów terenowych z wykorzystaniem ogniw krzemowych typu Back-Contact, struktur perowskitowych oraz transparentnych warstw zawierających kropki kwantowe.",
        projectP4:
          "Zakres badań obejmował pomiary napięcia, natężenia prądu oraz generowanej mocy elektrycznej w zależności od warunków oświetlenia naturalnego i sztucznego, temperatury pracy modułów oraz kąta padania promieniowania. Analizowano również wpływ zastosowania dodatkowych warstw aktywnych na stabilność pracy układów oraz możliwość zwiększenia całkowitego uzysku energetycznego w warunkach rzeczywistej eksploatacji. Kluczowym elementem było porównanie charakterystyk uzyskanych dla poszczególnych wariantów materiałowych i konfiguracji.",
        projectP5:
          "Istotnym elementem projektu było porównanie efektywności pracy pojedynczych ogniw z konfiguracjami tandemowymi, w których zastosowanie warstw pośrednich pozwalało na lepsze wykorzystanie szerszego zakresu widma promieniowania elektromagnetycznego. Uzyskane wyniki potwierdziły, że zastosowanie materiałów nowej generacji może stanowić realny kierunek zwiększania sprawności przyszłych instalacji fotowoltaicznych, szczególnie w warunkach ograniczonego oświetlenia oraz w zastosowaniach wymagających wysokiej efektywności powierzchniowej.",
        projectP6:
          "Projekt ma charakter badawczo-eksperymentalny i stanowi element poszukiwań nowych rozwiązań technologicznych wspierających rozwój energetyki odnawialnej. Uzyskane rezultaty wskazują na duży potencjał wykorzystania struktur nanomateriałowych w przyszłych generacjach modułów fotowoltaicznych oraz potwierdzają zasadność dalszych badań w obszarze technologii tandemowych jako jednego z kluczowych kierunków rozwoju nowoczesnej fotowoltaiki.",
        aboutP1:
          "Jesteśmy zespołem realizującym projekt badawczy z zakresu nowoczesnych technologii odnawialnych źródeł energii. Nasze działania koncentrują się na analizie możliwości zwiększenia sprawności paneli fotowoltaicznych poprzez wykorzystanie materiałów nowej generacji oraz konfiguracji wielowarstwowych. Koncentrowaliśmy się na weryfikacji rozwiązań w warunkach kontrolowanych oraz w scenariuszach naśladujących zastosowania praktyczne.",
        aboutSzymon:
          "Współautor projektu oraz główny analityk części obliczeniowej i eksperymentalnej. Odpowiadał za projektowanie stanowisk pomiarowych, analizę parametrów energetycznych badanych ogniw oraz interpretację wyników uzyskanych podczas badań laboratoryjnych i terenowych.",
        aboutKamil:
          "Współautor projektu odpowiedzialny za przygotowanie eksperymentów, konfigurację układów pomiarowych oraz opracowanie dokumentacji badawczej. Zajmował się analizą wpływu warunków oświetleniowych na sprawność energetyczną ogniw oraz testowaniem konfiguracji tandemowych.",
        aboutP2:
          "Projekt powstał jako odpowiedź na rosnące zapotrzebowanie na bardziej efektywne i dostępne technologie produkcji energii odnawialnej. W trakcie jego realizacji prowadziliśmy eksperymenty laboratoryjne, pomiary terenowe oraz analizy porównawcze różnych typów ogniw fotowoltaicznych.",
        methodP1:
          "Metodologia projektu obejmowała serię eksperymentów laboratoryjnych oraz pomiarów terenowych przeprowadzonych z wykorzystaniem różnych typów ogniw fotowoltaicznych: krzemowych, perowskitowych oraz struktur z warstwą kropek kwantowych. Analizowaliśmy wpływ temperatury pracy, kąta padania promieniowania oraz rodzaju źródła światła na generowaną moc elektryczną.",
        methodP2:
          "Szczególną uwagę poświęcono konfiguracjom tandemowym, które umożliwiają efektywniejsze wykorzystanie szerszego zakresu widma promieniowania słonecznego i stanowią jeden z najbardziej obiecujących kierunków rozwoju nowoczesnej fotowoltaiki. Dla spójności porównań standaryzowaliśmy warunki testów oraz sposób rejestracji danych.",
        methodDesc1:
          "Stanowisko badawcze przeznaczone było do pomiarów podstawowych parametrów elektrycznych badanych ogniw fotowoltaicznych. Umożliwiało ono analizę napięcia, natężenia oraz mocy generowanej przez poszczególne moduły w różnych warunkach oświetleniowych. W efekcie uzyskiwaliśmy bazę do porównań kolejnych konfiguracji.",
        methodDesc2:
          "Na stanowisku prowadzono badania wpływu temperatury pracy oraz kąta padania światła na sprawność energetyczną ogniw fotowoltaicznych. Wykorzystano regulowane źródła światła oraz elementy umożliwiające symulację rzeczywistych warunków pracy instalacji. Dzięki temu możliwa była ocena stabilności wydajności w warunkach zmiennych.",
        methodDesc3:
          "Stanowisko umożliwiało testowanie konfiguracji tandemowych łączących różne technologie półprzewodnikowe. Analizowano ich efektywność zarówno w warunkach laboratoryjnych, jak i przy oświetleniu naturalnym, co pozwoliło ocenić potencjał zastosowania takich rozwiązań w praktycznych instalacjach energetycznych. Wyniki stanowiły podstawę do wytypowania najbardziej obiecujących układów.",
        method1: "Laboratorium techki świetlnej",
        method2: "Wpływ kąta nachylenia oraz temperatury",
        method3: "Testy gotowych połączonych rozwiązań",
        langBtn: "PL / EN",
        menuAria: "Otwórz menu",
        langAria: "Przełącz język",
        lightboxClose: "Zamknij podgląd",
        lightboxPrev: "Poprzednie zdjęcie",
        lightboxNext: "Następne zdjęcie",
      },
      en: {
        title: "Quantum Enhancement of Photovoltaics",
        navHome: "Home",
        navProject: "Project",
        navAbout: "About us",
        navMethod: "Methodology",
        homeTitle: "Home",
        homeLead:
          "The project “Quantum Enhancement of Photovoltaics” focuses on increasing the efficiency of solar panels by using modern semiconductor materials such as perovskites and quantum-dot layers. During the research we analyzed different photovoltaic cell types in varied lighting, temperature, and geometric conditions. The results helped identify the most promising directions for tandem technologies that can significantly improve the performance of future PV installations. We also compared experimental observations with modeling outcomes to better justify the selected material configurations.",
        aboutProjectTitle: "About the project",
        aboutProjectText:
          "We develop this project with a strong focus on innovation in science, technology, and education. Goal: to prepare a strong concept for the EUCYS competition.",
        teamTitle: "Our team",
        teamText:
          "We collaborate as a research duo, creating experiments and documentation in line with scientific ethics and competition standards.",
        methodologyTitle: "Methodology",
        methodologyText:
          "A series of laboratory experiments and field measurements allowed us to evaluate the potential of tandem solutions in near-real operating conditions.",
        download: "Download detailed methodology report (PDF)",
        gallery: "Gallery",
        projectTitle: "Project description",
        aboutTitle: "About us",
        methodTitle: "Methodology",
        footer: "© 2026 EUCYS. Authors: Szymon Jagiełło, Kamil Lauzer.",
        projectP1:
          "The project “Quantum Enhancement of Photovoltaics” analyzes how to improve photovoltaic cell efficiency through advanced semiconductor materials and tandem multi-layer configurations. In particular, the study covers quantum-dot layers and perovskite structures as components that broaden the electromagnetic spectrum absorption of conventional silicon cells.",
        projectP2:
          "A key limitation of modern photovoltaics is the restricted efficiency of single-junction cells caused by material physics and incomplete use of the solar spectrum. A large portion of incoming energy is not converted efficiently into electricity, which limits further performance gains in standard PV systems. For this reason, tandem solutions are considered one of the most promising development directions because they can use different spectrum ranges simultaneously.",
        projectP3:
          "The main goal of the project was to evaluate how intermediate layers based on semiconductor nanostructures affect photovoltaic system parameters and to assess their potential for increasing the overall energy efficiency of solar installations. The research included laboratory experiments and field measurements using Back-Contact silicon cells, perovskite structures, and transparent layers containing quantum dots.",
        projectP4:
          "The scope of the research included voltage, current, and generated power measurements under varying natural and artificial lighting conditions, module temperature, and incident angle. We also analyzed the impact of additional active layers on system stability and on total energy yield in realistic operating scenarios. A core part of the methodology was a direct comparison of characteristics for different material variants and configurations.",
        projectP5:
          "An important part of the project was comparing single-cell performance with tandem configurations, where intermediate layers improved the use of a broader electromagnetic spectrum range. The results confirmed that next-generation materials can be a realistic path to higher efficiency in future photovoltaic installations, especially under limited lighting conditions and in applications requiring high areal performance.",
        projectP6:
          "The project has a research-and-experimental character and supports the search for new technological solutions that accelerate renewable energy development. The obtained results show strong potential for nanomaterial structures in next-generation PV modules and confirm the validity of further tandem-technology research as a key direction in modern photovoltaics.",
        aboutP1:
          "We are a team delivering a research project in advanced renewable energy technologies. Our work focuses on increasing photovoltaic panel efficiency by using next-generation materials and multi-layer configurations. We concentrated on validating these solutions in controlled environments and in scenarios that mimic practical applications.",
        aboutSzymon:
          "Co-author of the project and lead analyst for computational and experimental work. He was responsible for measurement-stand design, energy-parameter analysis of tested cells, and interpretation of results from laboratory and field studies.",
        aboutKamil:
          "Co-author responsible for experiment preparation, measurement-system configuration, and research documentation. He focused on analyzing how lighting conditions influence cell efficiency and on testing tandem configurations.",
        aboutP2:
          "The project was created as a response to the growing demand for more efficient and accessible renewable energy technologies. During implementation we conducted laboratory experiments, field measurements, and comparative analyses of different photovoltaic cell types.",
        methodP1:
          "The project methodology included a series of laboratory experiments and field measurements using different photovoltaic technologies: silicon cells, perovskites, and structures with quantum-dot layers. We analyzed the impact of operating temperature, radiation incidence angle, and light-source type on generated electric power.",
        methodP2:
          "Special attention was given to tandem configurations, which enable more efficient use of a wider solar spectrum and represent one of the most promising paths for modern photovoltaics. To ensure consistency, test conditions and data-recording methods were standardized.",
        methodDesc1:
          "This station was designed for measuring the basic electrical parameters of tested photovoltaic cells. It enabled analysis of voltage, current, and power generated by individual modules under various lighting conditions, creating a baseline for comparing later configurations.",
        methodDesc2:
          "This station focused on the impact of operating temperature and light incidence angle on cell energy efficiency. Adjustable light sources and elements simulating real operating conditions were used, allowing us to assess stability under changing conditions.",
        methodDesc3:
          "This station enabled testing of tandem configurations combining different semiconductor technologies. Their performance was analyzed in both laboratory and natural-light conditions, allowing evaluation of practical deployment potential and selection of the most promising setups.",
        method1: "Light Technique Laboratory",
        method2: "Impact of Tilt Angle and Temperature",
        method3: "Tests of Integrated Ready Solutions",
        langBtn: "PL / EN",
        menuAria: "Open menu",
        langAria: "Switch language",
        lightboxClose: "Close preview",
        lightboxPrev: "Previous image",
        lightboxNext: "Next image",
      },
    }[lang];

    document.documentElement.lang = lang;
    document.title = t.title;
    if (langToggle) {
      langToggle.textContent = t.langBtn;
      langToggle.setAttribute("aria-label", t.langAria);
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-label", t.menuAria);
    }

    const updates = [
      ["header h1", t.title],
      [".nav a[href=\"#home\"]", t.navHome],
      [".nav a[href=\"#projekt\"]", t.navProject],
      [".nav a[href=\"#onas\"]", t.navAbout],
      [".nav a[href=\"#metodologia\"]", t.navMethod],
      ["#home > h2", t.homeTitle],
      ["#home > p", t.homeLead],
      [".home-grid a[href=\"#projekt\"] h3", t.aboutProjectTitle],
      [".home-grid a[href=\"#projekt\"] p", t.aboutProjectText],
      [".home-grid a[href=\"#onas\"] h3", t.teamTitle],
      [".home-grid a[href=\"#onas\"] p", t.teamText],
      [".home-grid a[href=\"#metodologia\"] h3", t.methodologyTitle],
      [".home-grid a[href=\"#metodologia\"] p", t.methodologyText],
      ["#home .download-btn", t.download],
      ["#home > h3", t.gallery],
      ["#projekt > h2", t.projectTitle],
      ["#projekt p:nth-of-type(1)", t.projectP1],
      ["#projekt p:nth-of-type(2)", t.projectP2],
      ["#projekt p:nth-of-type(3)", t.projectP3],
      ["#projekt p:nth-of-type(4)", t.projectP4],
      ["#projekt p:nth-of-type(5)", t.projectP5],
      ["#projekt p:nth-of-type(6)", t.projectP6],
      ["#onas > h2", t.aboutTitle],
      ["#onas > p:nth-of-type(1)", t.aboutP1],
      ["#onas .profile-card:nth-of-type(1) p", t.aboutSzymon],
      ["#onas .profile-card:nth-of-type(2) p", t.aboutKamil],
      ["#onas > p:nth-of-type(2)", t.aboutP2],
      ["#metodologia > h2", t.methodTitle],
      ["#metodologia > p:nth-of-type(1)", t.methodP1],
      ["#metodologia > p:nth-of-type(2)", t.methodP2],
      ["#metodologia .method-card:nth-of-type(1) .method-badge", t.method1],
      ["#metodologia .method-card:nth-of-type(1) h3", t.method1],
      ["#metodologia .method-card:nth-of-type(1) p", t.methodDesc1],
      ["#metodologia .method-card:nth-of-type(2) .method-badge", t.method2],
      ["#metodologia .method-card:nth-of-type(2) h3", t.method2],
      ["#metodologia .method-card:nth-of-type(2) p", t.methodDesc2],
      ["#metodologia .method-card:nth-of-type(3) .method-badge", t.method3],
      ["#metodologia .method-card:nth-of-type(3) h3", t.method3],
      ["#metodologia .method-card:nth-of-type(3) p", t.methodDesc3],
      ["#metodologia .download-btn", t.download],
      ["footer p", t.footer],
    ];

    updates.forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    });

    const lightboxClose = document.querySelector(".lightbox-close");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");
    if (lightboxClose) lightboxClose.setAttribute("aria-label", t.lightboxClose);
    if (lightboxPrev) lightboxPrev.setAttribute("aria-label", t.lightboxPrev);
    if (lightboxNext) lightboxNext.setAttribute("aria-label", t.lightboxNext);
  }

  function initLanguageToggle() {
    if (!langToggle) return;
    langToggle.addEventListener("click", () => {
      currentLang = currentLang === "pl" ? "en" : "pl";
      applyTranslations(currentLang);
    });
  }

  // Function to show section
  function showSection(targetId) {
    sections.forEach(section => {
      if (section.id === targetId) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });
  }

  // Set initial active section
  showSection("home");
  document.querySelector('.nav a[href="#home"]').classList.add("active");

  initAutoImages();
  initGalleryLightbox();
  initMobileMenu();
  initLanguageToggle();
  applyTranslations(currentLang);

  function setActiveNav(targetId) {
    const activeNav = document.querySelector(`.nav a[href="#${targetId}"]`);
    navLinks.forEach((el) => el.classList.remove("active"));
    if (activeNav) activeNav.classList.add("active");
  }

  function handleSectionSwitch(e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").slice(1);
    showSection(targetId);
    setActiveNav(targetId);
    closeMobileMenu();
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", handleSectionSwitch);
  });

  sectionSwitchLinks.forEach((link) => {
    link.addEventListener("click", handleSectionSwitch);
  });
});