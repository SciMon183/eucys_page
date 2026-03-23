document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav a");
  const sectionSwitchLinks = document.querySelectorAll("a.section-switch");
  const sections = document.querySelectorAll(".section");

  // Auto-wstawianie obrazków: plik w folderze `images/` ma nazwę równą id elementu.
  // Przykład: <img id="method-1" ...> => images/method-1.png (lub .jpg/.webp).
  function initAutoImages() {
    const imgs = document.querySelectorAll('img.auto-image[id]');
    const exts = ["png", "jpg", "jpeg", "webp", "gif"];

    imgs.forEach((img) => {
      const baseName = img.id;
      const rawFolder = img.dataset.folder || "images";
      const folder = rawFolder.endsWith("/") ? rawFolder : `${rawFolder}/`;
      const explicitFilename = img.dataset.filename;
      const fallbackSrc = img.getAttribute("src") || "";
      let i = 0;

      // Jeśli podasz pełną nazwę pliku w `data-filename`, ładujemy ją bez zgadywania rozszerzeń.
      if (explicitFilename) {
        img.onerror = () => {
          if (fallbackSrc) img.src = fallbackSrc;
        };
        img.src = `${folder}${encodeURI(explicitFilename)}`;
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
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", handleSectionSwitch);
  });

  sectionSwitchLinks.forEach((link) => {
    link.addEventListener("click", handleSectionSwitch);
  });
});