document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".nav a");
  const sections = document.querySelectorAll(".section");

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

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);

      // Remove active from all links
      links.forEach(el => el.classList.remove("active"));
      // Add active to clicked link
      this.classList.add("active");

      // Show the target section
      showSection(targetId);
    });
  });
});