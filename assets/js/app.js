const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujrati");

const LANG_KEY = "selectedLanguage";
const DEFAULT_LANG = "English";
let translations = {};

// ── Language audio setup ────────────────────────────────────────────────────
const langAudio = {
  English: new Audio("./../audio/Eng.mpeg"),
  Hindi: new Audio("./../audio/Hin.mpeg"),
  Gujarati: new Audio("./../audio/Guj.mpeg"),
};

let currentLangAudio = null;

function playLanguageAudio(lang) {
  const audio = langAudio[lang];
  if (!audio) return;

  // Stop whichever language audio is currently playing
  if (currentLangAudio && currentLangAudio !== audio) {
    currentLangAudio.pause();
    currentLangAudio.currentTime = 0;
  }

  audio.currentTime = 0;

  audio
    .play()
    .catch((err) =>
      console.error("Error playing language audio:", err),
    );

  currentLangAudio = audio;
}

// Apply saved language immediately before JSON loads
(function applySavedLangEarly() {
  const savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

  document.documentElement.lang = savedLang;

  if (document.body) {
    if (savedLang === "Hindi") {
      document.body.setAttribute("data-lang", "hi");
    } else if (savedLang === "Gujarati") {
      document.body.setAttribute("data-lang", "gu");
    } else {
      document.body.setAttribute("data-lang", "en");
    }
  }
})();

// ── UI element references ──────────────────────────────────────────────────
const flowerEl = document.querySelector(".flower");
const homeBtnEl = document.querySelector(".home-btn");
const languageEl = document.querySelector(".language-container");
const pageTitleEl = document.querySelector(".page-title");
const clickBtnEl = document.querySelector(".click");
const circleContent = document.getElementById("circleContent");
const circleVideo = document.getElementById("circleVideo");
const swiperPanel = document.getElementById("swiperPanel");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const paginationEl = document.getElementById("customPagination");
const swiperEl = document.getElementById("mySwiper");

circleVideo.muted = true;
circleVideo.volume = 0;

let isExpanded = false;
let swiper = null;
let rotationDeg = 0;

const TOTAL_SLIDES = document.querySelectorAll(
  "#mySwiper .swiper-slide",
).length;

// ── Fixed speeds ───────────────────────────────────────────────────────────
const SLIDE_SPEED = 400;
const VIDEO_FADE_IN = 300;
const VIDEO_FADE_OUT = 300;

// ── Build pagination dots ──────────────────────────────────────────────────
function buildPagination() {
  paginationEl.innerHTML = "";

  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");

    if (i === 0) {
      dot.classList.add("active");
    }

    dot.addEventListener("click", () => {
      if (swiper) {
        swiper.slideTo(i);
      }
    });

    paginationEl.appendChild(dot);
  }
}

function updatePagination(index) {
  document
    .querySelectorAll(".swiper-custom-pagination .dot")
    .forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
}

// ── Adjust swiper height ───────────────────────────────────────────────────
function adjustSwiperHeight() {
  if (!swiper || !swiperEl) return;

  const activeSlide = swiper.slides[swiper.activeIndex];

  if (!activeSlide) return;

  requestAnimationFrame(() => {
    const wrapper = swiper.wrapperEl;

    swiperEl.style.height = "auto";
    wrapper.style.height = "auto";

    swiper.slides.forEach((slide) => {
      slide.style.height = "auto";
      slide.style.display = "flex";
      slide.style.alignItems = "center";
      slide.style.justifyContent = "center";
    });

    const activeHeight = activeSlide.offsetHeight;

    wrapper.style.height = `${activeHeight}px`;
    swiperEl.style.height = `${activeHeight}px`;

    swiper.updateAutoHeight(300);
    swiper.update();
  });
}

// ── Load video ─────────────────────────────────────────────────────────────
function loadVideo(slideIndex) {
  const num = slideIndex + 1;

  document.documentElement.style.setProperty(
    "--video-fade",
    `${VIDEO_FADE_OUT}ms`,
  );

  circleVideo.style.opacity = "";
  circleVideo.classList.remove("visible");

  setTimeout(() => {
    circleVideo.muted = true;
    circleVideo.volume = 0;
    circleVideo.src = `./assets/videos/${num}.mp4`;
    circleVideo.load();

    circleVideo.oncanplay = () => {
      document.documentElement.style.setProperty(
        "--video-fade",
        `${VIDEO_FADE_IN}ms`,
      );

      circleVideo.style.opacity = "";
      circleVideo.classList.add("visible");

      circleVideo
        .play()
        .catch((err) =>
          console.error("Error playing slide video:", err),
        );

      circleVideo.oncanplay = null;
    };
  }, VIDEO_FADE_OUT);
}

// ── Play the active slide's wrong/right videos, pause the rest ────────────
function syncPointVideos(index) {
  document.querySelectorAll("#mySwiper .swiper-slide").forEach((slide, i) => {
    const wrongVideo = slide.querySelector(".wrong-video");
    const rightVideo = slide.querySelector(".right-video");

    if (i === index) {
      [wrongVideo, rightVideo].forEach((video) => {
        if (!video) return;
        video.currentTime = 0;
        video.play().catch(() => {});
      });
    } else {
      [wrongVideo, rightVideo].forEach((video) => {
        if (!video) return;
        video.pause();
        video.currentTime = 0;
      });
    }
  });
}

// ── Update nav button visibility ───────────────────────────────────────────
function updateNavButtons(index) {
  btnPrev.classList.toggle("hidden", index === 0);
  btnNext.classList.remove("hidden");
}

// ── Flower rotation on nav click ───────────────────────────────────────────
function rotatePetals() {
  rotationDeg += 40;

  document.querySelector(".flower-1").style.transform =
    `translate(-50%, -50%) rotate(-${rotationDeg}deg)`;

  document.querySelector(".flower-3").style.transform =
    `translate(-50%, -50%) rotate(-${rotationDeg}deg)`;

  document.querySelector(".flower-2").style.transform =
    `translate(-50%, -50%) rotate(${rotationDeg}deg)`;

  document.querySelector(".flower-4").style.transform =
    `translate(-50%, -50%) rotate(${rotationDeg}deg)`;
}

// ── Init Swiper ────────────────────────────────────────────────────────────
function initSwiper() {
  buildPagination();

  swiper = new Swiper("#mySwiper", {
    allowTouchMove: true,
    speed: SLIDE_SPEED,
    effect: "fade",
    autoHeight: true,
    observer: true,
    observeParents: true,

    fadeEffect: {
      crossFade: true,
    },

    on: {
      init() {
        updatePagination(0);
        updateNavButtons(0);
        syncPointVideos(0);

        setTimeout(() => {
          adjustSwiperHeight();
        }, 50);
      },

      slideChange() {
        const idx = swiper.activeIndex;

        updatePagination(idx);
        updateNavButtons(idx);
        loadVideo(idx);
        syncPointVideos(idx);

        setTimeout(() => {
          adjustSwiperHeight();
        }, 50);
      },

      transitionEnd() {
        adjustSwiperHeight();
      },

      observerUpdate() {
        adjustSwiperHeight();
      },

      resize() {
        adjustSwiperHeight();
      },
    },
  });

  btnPrev.addEventListener("click", () => {
    if (swiper.activeIndex > 0) {
      swiper.slidePrev();
      rotatePetals();
    }
  });

  btnNext.addEventListener("click", () => {
    if (swiper.activeIndex === TOTAL_SLIDES - 1) {
      window.location.href = "pranam.html";
    } else {
      swiper.slideNext();
      rotatePetals();
    }
  });

  loadVideo(0);

  setTimeout(() => {
    adjustSwiperHeight();
  }, 100);
}

// ── Expand ─────────────────────────────────────────────────────────────────
function expandView() {
  if (isExpanded) return;

  isExpanded = true;

  flowerEl.style.left = "25%";
  flowerEl.style.transform =
    "translate(-50%, -50%) scale(0.8)";

  circleContent.classList.add("hidden");

  setTimeout(() => {
    homeBtnEl.style.opacity = "1";
    languageEl.style.opacity = "1";
    pageTitleEl.style.opacity = "1";

    swiperPanel.classList.add("visible");

    if (!swiper) {
      initSwiper();
    } else {
      loadVideo(swiper.activeIndex);

      setTimeout(() => {
        adjustSwiperHeight();
      }, 100);
    }
  }, 400);
}

// ── Reset ──────────────────────────────────────────────────────────────────
function resetView() {
  isExpanded = false;

  homeBtnEl.style.opacity = "0";
  languageEl.style.opacity = "0";
  pageTitleEl.style.opacity = "0";

  swiperPanel.classList.remove("visible");

  flowerEl.style.left = "50%";
  flowerEl.style.transform =
    "translate(-50%, -50%) scale(1)";

  rotationDeg = 0;

  document.querySelector(".flower-1").style.transform =
    "translate(-50%, -50%) rotate(0deg)";

  document.querySelector(".flower-2").style.transform =
    "translate(-50%, -50%) rotate(0deg)";

  document.querySelector(".flower-3").style.transform =
    "translate(-50%, -50%) rotate(0deg)";

  document.querySelector(".flower-4").style.transform =
    "translate(-50%, -50%) rotate(0deg)";

  circleVideo.pause();
  circleVideo.oncanplay = null;
  circleVideo.classList.remove("visible");
  circleVideo.style.opacity = "0";
  circleVideo.removeAttribute("src");
  circleVideo.load();

  document.documentElement.style.setProperty(
    "--video-fade",
    "1s",
  );

  circleContent.classList.remove("hidden");

  if (swiper) {
    swiper.slideTo(0, 0);

    updatePagination(0);
    updateNavButtons(0);

    setTimeout(() => {
      adjustSwiperHeight();
    }, 50);
  }
}

// ── Button listeners ───────────────────────────────────────────────────────
clickBtnEl.addEventListener("click", expandView);

homeBtnEl.addEventListener("click", (e) => {
  e.preventDefault();
  resetView();
});

// ── Language helpers ───────────────────────────────────────────────────────
function getSavedLanguage() {
  return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
}

function setActiveButton(activeBtn) {
  [btnEn, btnHi, btnGu].forEach((btn) => {
    btn?.classList.remove("active");
  });

  activeBtn?.classList.add("active");
}

const TITLE_IMAGES = {
  English: "./assets/images/title.png",
  Hindi: "./assets/images/titlehi.png",
  Gujarati: "./assets/images/titlegj.png",
};

function applyLanguage(lang, save = true) {
  const langData = translations[lang];

  if (!langData) return;

  if (save) {
    localStorage.setItem(LANG_KEY, lang);
  }

  document.documentElement.lang = lang;

  if (lang === "English") {
    document.body.setAttribute("data-lang", "en");
    setActiveButton(btnEn);
  } else if (lang === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
    setActiveButton(btnHi);
  } else if (lang === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
    setActiveButton(btnGu);
  }

  const pageTitleImg = document.querySelector(".page-title-img");
  if (pageTitleImg && TITLE_IMAGES[lang]) {
    pageTitleImg.src = TITLE_IMAGES[lang];
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");

    if (langData[key] !== undefined) {
      el.innerHTML = String(langData[key]).replace(
        /\n/g,
        "<br>",
      );
    }
  });

  if (swiper) {
    setTimeout(() => {
      adjustSwiperHeight();
    }, 100);
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = getSavedLanguage();

  fetch("./assets/json/data.json", {
    cache: "no-store",
  })
    .then((res) => res.json())
    .then((data) => {
      translations = data;
      applyLanguage(savedLang, false);
    })
    .catch((err) =>
      console.error("Error loading translations:", err),
    );
});

window.addEventListener("load", () => {
  setTimeout(() => {
    if (swiper) {
      adjustSwiperHeight();
    }
  }, 100);
});

btnEn.addEventListener("click", () => {
  applyLanguage("English");
  playLanguageAudio("English");
});

btnHi.addEventListener("click", () => {
  applyLanguage("Hindi");
  playLanguageAudio("Hindi");
});

btnGu.addEventListener("click", () => {
  applyLanguage("Gujarati");
  playLanguageAudio("Gujarati");
});

// ── Mobile landscape alert ─────────────────────────────────────────────────
let landscapeAlertShown = false;

function checkLandscapeMode() {
  const isMobile = window.matchMedia("(max-width: 786px)").matches;
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;

  if (isMobile && isPortrait) {
    if (!landscapeAlertShown) {
      alert("Please use Landscape!");
      landscapeAlertShown = true;
    }
  } else {
    landscapeAlertShown = false;
  }
}

checkLandscapeMode();

window.addEventListener("resize", checkLandscapeMode);
window.addEventListener("orientationchange", checkLandscapeMode);

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    checkLandscapeMode();
  }, 200);
});