// RoyalQR Studio - Application Controller & State Orchestrator
const RoyalApp = {
  generator: null,
  activeTab: "url",
  activeAccordion: "type",
  debounceTimer: null,

  init() {
    this.generator = new RoyalQRGenerator("qr-preview-box");
    this.generator.init();

    this.bindEvents();
    this.initPresetIconsGrid();
    this.initTemplatesModal();
    HistoryManager.renderDrawer();
    this.initTheme();
    this.updateDataFromActiveForm();

    console.log("RoyalQR Studio initialized successfully 👑");
  },

  // ------------------------------------------------------------------
  // Themes
  // ------------------------------------------------------------------
  initTheme() {
    const savedTheme = localStorage.getItem("royalqr_theme") || "dark";
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("royalqr_theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("royalqr_theme", "dark");
    }
  },

  // ------------------------------------------------------------------
  // Accordions & Form Tabs
  // ------------------------------------------------------------------
  switchAccordion(sectionId) {
    const sections = document.querySelectorAll(".accordion-section");
    sections.forEach(sec => {
      const header = sec.querySelector(".accordion-header");
      const content = sec.querySelector(".accordion-content");
      if (sec.id === `section-${sectionId}`) {
        sec.classList.toggle("is-open");
      }
    });
  },

  switchTypeTab(typeId) {
    this.activeTab = typeId;
    document.querySelectorAll(".type-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.type === typeId);
    });
    document.querySelectorAll(".type-form-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `form-${typeId}`);
    });
    this.updateDataFromActiveForm();
  },

  // ------------------------------------------------------------------
  // Data Formatting for 11+ Types
  // ------------------------------------------------------------------
  updateDataFromActiveForm() {
    let payload = "";
    const type = this.activeTab;

    switch (type) {
      case "url": {
        const val = document.getElementById("input-url")?.value.trim() || "";
        payload = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
        break;
      }
      case "text": {
        payload = document.getElementById("input-text")?.value.trim() || "";
        break;
      }
      case "wifi": {
        const ssid = document.getElementById("wifi-ssid")?.value.trim() || "";
        const pass = document.getElementById("wifi-pass")?.value || "";
        const enc = document.getElementById("wifi-enc")?.value || "WPA";
        const hidden = document.getElementById("wifi-hidden")?.checked ? "true" : "false";
        payload = `WIFI:S:${ssid};T:${enc};P:${pass};H:${hidden};;`;
        break;
      }
      case "vcard": {
        const fn = document.getElementById("vcard-first")?.value.trim() || "";
        const ln = document.getElementById("vcard-last")?.value.trim() || "";
        const org = document.getElementById("vcard-org")?.value.trim() || "";
        const title = document.getElementById("vcard-title")?.value.trim() || "";
        const phone = document.getElementById("vcard-phone")?.value.trim() || "";
        const email = document.getElementById("vcard-email")?.value.trim() || "";
        const url = document.getElementById("vcard-url")?.value.trim() || "";
        const street = document.getElementById("vcard-street")?.value.trim() || "";
        const city = document.getElementById("vcard-city")?.value.trim() || "";
        const country = document.getElementById("vcard-country")?.value.trim() || "";

        payload = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${ln};${fn};;;`,
          `FN:${fn} ${ln}`.trim(),
          org ? `ORG:${org}` : null,
          title ? `TITLE:${title}` : null,
          phone ? `TEL;TYPE=CELL:${phone}` : null,
          email ? `EMAIL;TYPE=INTERNET:${email}` : null,
          url ? `URL:${url}` : null,
          (street || city || country) ? `ADR:;;${street};${city};;${country}` : null,
          "END:VCARD"
        ].filter(Boolean).join("\n");
        break;
      }
      case "whatsapp": {
        const phone = document.getElementById("wa-phone")?.value.replace(/[^0-9]/g, "") || "";
        const msg = document.getElementById("wa-msg")?.value.trim() || "";
        payload = phone ? `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ""}` : "";
        break;
      }
      case "email": {
        const to = document.getElementById("email-to")?.value.trim() || "";
        const subj = document.getElementById("email-subject")?.value.trim() || "";
        const body = document.getElementById("email-body")?.value.trim() || "";
        const params = [];
        if (subj) params.push(`subject=${encodeURIComponent(subj)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        payload = `mailto:${to}${params.length ? `?${params.join("&")}` : ""}`;
        break;
      }
      case "phone": {
        const p = document.getElementById("phone-number")?.value.trim() || "";
        payload = `tel:${p}`;
        break;
      }
      case "sms": {
        const p = document.getElementById("sms-phone")?.value.trim() || "";
        const m = document.getElementById("sms-msg")?.value.trim() || "";
        payload = `SMSTO:${p}:${m}`;
        break;
      }
      case "crypto": {
        const coin = document.getElementById("crypto-coin")?.value || "bitcoin";
        const addr = document.getElementById("crypto-addr")?.value.trim() || "";
        const amt = document.getElementById("crypto-amt")?.value.trim() || "";
        if (coin === "bitcoin") {
          payload = `bitcoin:${addr}${amt ? `?amount=${amt}` : ""}`;
        } else if (coin === "ethereum") {
          payload = `ethereum:${addr}${amt ? `?value=${amt}` : ""}`;
        } else {
          payload = `${addr}`;
        }
        break;
      }
      case "social": {
        const platform = document.getElementById("social-platform")?.value || "instagram";
        const user = document.getElementById("social-user")?.value.trim().replace(/^@/, "") || "";
        const map = {
          instagram: `https://instagram.com/${user}`,
          youtube: user.startsWith("http") ? user : `https://youtube.com/@${user}`,
          tiktok: `https://tiktok.com/@${user}`,
          x: `https://x.com/${user}`,
          linkedin: user.startsWith("http") ? user : `https://linkedin.com/in/${user}`,
          github: `https://github.com/${user}`,
          facebook: user.startsWith("http") ? user : `https://facebook.com/${user}`
        };
        payload = map[platform] || user;
        break;
      }
      case "event": {
        const summary = document.getElementById("event-title")?.value.trim() || "";
        const loc = document.getElementById("event-location")?.value.trim() || "";
        const start = document.getElementById("event-start")?.value.replace(/[-:]/g, "") || "";
        const end = document.getElementById("event-end")?.value.replace(/[-:]/g, "") || "";
        const desc = document.getElementById("event-desc")?.value.trim() || "";
        payload = [
          "BEGIN:VEVENT",
          summary ? `SUMMARY:${summary}` : null,
          loc ? `LOCATION:${loc}` : null,
          desc ? `DESCRIPTION:${desc}` : null,
          start ? `DTSTART:${start}00Z` : null,
          end ? `DTEND:${end}00Z` : null,
          "END:VEVENT"
        ].filter(Boolean).join("\n");
        break;
      }
    }

    if (!payload) payload = "https://github.com";

    const payloadPreview = document.getElementById("payload-data-preview");
    if (payloadPreview) {
      payloadPreview.textContent = payload.length > 70 ? payload.slice(0, 67) + "..." : payload;
    }

    this.scheduleRender({ type, data: payload });
  },

  // ------------------------------------------------------------------
  // UI Bindings & Debounced Rendering
  // ------------------------------------------------------------------
  scheduleRender(patch = {}) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.generator.render(patch);
    }, 40);
  },

  bindEvents() {
    // 1. Data Form Inputs
    document.querySelectorAll(".form-input-trigger").forEach(el => {
      el.addEventListener("input", () => this.updateDataFromActiveForm());
      el.addEventListener("change", () => this.updateDataFromActiveForm());
    });

    // 2. Dots Styling
    document.querySelectorAll(".dot-style-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".dot-style-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.scheduleRender({ dotType: btn.dataset.dot });
      });
    });

    // Color mode (single vs gradient)
    document.querySelectorAll("input[name='dotColorMode']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        const isGrad = e.target.value === "gradient";
        const gradControls = document.getElementById("dot-gradient-controls");
        if (gradControls) gradControls.style.display = isGrad ? "block" : "none";
        this.scheduleRender({ dotColorMode: e.target.value });
      });
    });

    // Color Inputs & Sync with text inputs
    this.bindColorSync("dotColor1", "dotColor1-hex", (color) => {
      this.scheduleRender({ dotColor1: color });
    });
    this.bindColorSync("dotColor2", "dotColor2-hex", (color) => {
      this.scheduleRender({ dotColor2: color });
    });

    // Gradient Angle
    const angleSlider = document.getElementById("dotGradientAngle");
    const angleVal = document.getElementById("dotGradientAngle-val");
    if (angleSlider) {
      angleSlider.addEventListener("input", (e) => {
        if (angleVal) angleVal.textContent = `${e.target.value}°`;
        this.scheduleRender({ dotGradientAngle: parseInt(e.target.value, 10) });
      });
    }

    // 3. Corner Square & Dot (Eyes)
    document.querySelectorAll(".corner-square-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".corner-square-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.scheduleRender({ cornerSquareType: btn.dataset.style });
      });
    });

    document.querySelectorAll(".corner-dot-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".corner-dot-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.scheduleRender({ cornerDotType: btn.dataset.style });
      });
    });

    const linkCornerColors = document.getElementById("linkCornerColors");
    if (linkCornerColors) {
      linkCornerColors.addEventListener("change", (e) => {
        const independentControls = document.getElementById("independent-corner-colors");
        if (independentControls) independentControls.style.display = e.target.checked ? "none" : "block";
        this.scheduleRender({ linkCornerColors: e.target.checked });
      });
    }

    this.bindColorSync("cornerSquareColor", "cornerSquareColor-hex", (c) => {
      this.scheduleRender({ cornerSquareColor: c });
    });
    this.bindColorSync("cornerDotColor", "cornerDotColor-hex", (c) => {
      this.scheduleRender({ cornerDotColor: c });
    });

    // 4. Background
    this.bindColorSync("bgColor", "bgColor-hex", (c) => {
      this.scheduleRender({ bgColor: c });
    });

    const bgTransparent = document.getElementById("bgTransparent");
    if (bgTransparent) {
      bgTransparent.addEventListener("change", (e) => {
        const bgPickerBox = document.getElementById("bg-color-control-box");
        if (bgPickerBox) bgPickerBox.style.opacity = e.target.checked ? "0.4" : "1";
        this.scheduleRender({ bgTransparent: e.target.checked });
      });
    }

    // 5. Logo / Center Image
    const logoUploadInput = document.getElementById("custom-logo-upload");
    if (logoUploadInput) {
      logoUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.setCustomLogo(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const logoSizeSlider = document.getElementById("logoSize");
    const logoSizeVal = document.getElementById("logoSize-val");
    if (logoSizeSlider) {
      logoSizeSlider.addEventListener("input", (e) => {
        const ratio = parseFloat(e.target.value);
        if (logoSizeVal) logoSizeVal.textContent = `${Math.round(ratio * 100)}%`;
        this.scheduleRender({ logoSize: ratio });
      });
    }

    const logoMarginSlider = document.getElementById("logoMargin");
    const logoMarginVal = document.getElementById("logoMargin-val");
    if (logoMarginSlider) {
      logoMarginSlider.addEventListener("input", (e) => {
        if (logoMarginVal) logoMarginVal.textContent = `${e.target.value}px`;
        this.scheduleRender({ logoMargin: parseInt(e.target.value, 10) });
      });
    }

    const hideBgDots = document.getElementById("hideBackgroundDots");
    if (hideBgDots) {
      hideBgDots.addEventListener("change", (e) => {
        this.scheduleRender({ hideBackgroundDots: e.target.checked });
      });
    }

    // 6. Frames
    document.querySelectorAll(".frame-style-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".frame-style-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const frame = btn.dataset.frame;
        const frameControls = document.getElementById("frame-options-panel");
        if (frameControls) frameControls.style.display = frame === "none" ? "none" : "block";
        this.scheduleRender({ frame });
      });
    });

    const frameTextInput = document.getElementById("frameText");
    if (frameTextInput) {
      frameTextInput.addEventListener("input", (e) => {
        this.scheduleRender({ frameText: e.target.value || "SCAN ME" });
      });
    }

    this.bindColorSync("frameBgColor", "frameBgColor-hex", (c) => {
      this.scheduleRender({ frameBgColor: c });
    });
    this.bindColorSync("frameTextColor", "frameTextColor-hex", (c) => {
      this.scheduleRender({ frameTextColor: c });
    });

    // 7. Margin / Quiet Zone & Error Correction
    const marginSlider = document.getElementById("marginSlider");
    const marginVal = document.getElementById("marginSlider-val");
    if (marginSlider) {
      marginSlider.addEventListener("input", (e) => {
        if (marginVal) marginVal.textContent = `${e.target.value}px`;
        this.scheduleRender({ margin: parseInt(e.target.value, 10) });
      });
    }

    document.querySelectorAll(".ecl-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ecl-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.scheduleRender({ errorCorrectionLevel: btn.dataset.ecl });
      });
    });

    // 8. Palette Quick Swatches
    document.querySelectorAll(".palette-swatch").forEach(swatch => {
      swatch.addEventListener("click", () => {
        const c1 = swatch.dataset.c1;
        const c2 = swatch.dataset.c2 || c1;
        this.setColorValues("dotColor1", c1);
        this.setColorValues("dotColor2", c2);
        this.scheduleRender({ dotColor1: c1, dotColor2: c2 });
      });
    });
  },

  bindColorSync(colorPickerId, hexInputId, onChange) {
    const picker = document.getElementById(colorPickerId);
    const hex = document.getElementById(hexInputId);
    if (!picker || !hex) return;

    picker.addEventListener("input", (e) => {
      hex.value = e.target.value.toUpperCase();
      onChange(e.target.value);
    });

    hex.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        picker.value = val;
        onChange(val);
      }
    });
  },

  setColorValues(pickerId, val) {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(`${pickerId}-hex`);
    if (picker) picker.value = val;
    if (hex) hex.value = val.toUpperCase();
  },

  // ------------------------------------------------------------------
  // Logo Preset Grid
  // ------------------------------------------------------------------
  initPresetIconsGrid() {
    const grid = document.getElementById("preset-icons-grid");
    if (!grid) return;

    let html = `
      <button type="button" class="preset-icon-btn active" data-icon="none" title="No logo">
        <span class="text-xs font-semibold text-slate-400">None</span>
      </button>
    `;

    Object.keys(PRESET_ICONS).forEach(key => {
      const item = PRESET_ICONS[key];
      html += `
        <button type="button" class="preset-icon-btn" data-icon="${key}" title="${item.name}">
          ${item.svg}
        </button>
      `;
    });

    grid.innerHTML = html;

    grid.querySelectorAll(".preset-icon-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        grid.querySelectorAll(".preset-icon-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const iconKey = btn.dataset.icon;
        this.scheduleRender({ logoKey: iconKey, customLogoUrl: null });
      });
    });
  },

  setCustomLogo(dataUrl) {
    document.querySelectorAll(".preset-icon-btn").forEach(b => b.classList.remove("active"));
    const previewBox = document.getElementById("custom-logo-preview-box");
    if (previewBox) {
      previewBox.innerHTML = `
        <img src="${dataUrl}" class="w-8 h-8 object-contain rounded" />
        <button type="button" class="text-xs text-rose-400 hover:text-rose-300 ml-2" onclick="RoyalApp.clearCustomLogo()">Remove</button>
      `;
      previewBox.style.display = "flex";
    }
    this.scheduleRender({ logoKey: "custom", customLogoUrl: dataUrl });
    this.showToast("Logo uploaded successfully!");
  },

  clearCustomLogo() {
    const previewBox = document.getElementById("custom-logo-preview-box");
    if (previewBox) previewBox.style.display = "none";
    const fileInput = document.getElementById("custom-logo-upload");
    if (fileInput) fileInput.value = "";
    document.querySelector('.preset-icon-btn[data-icon="none"]')?.classList.add("active");
    this.scheduleRender({ logoKey: "none", customLogoUrl: null });
  },

  // ------------------------------------------------------------------
  // Templates Modal & Application
  // ------------------------------------------------------------------
  initTemplatesModal() {
    const grid = document.getElementById("templates-grid");
    if (!grid) return;

    grid.innerHTML = Object.keys(PRESET_TEMPLATES).map(key => {
      const t = PRESET_TEMPLATES[key];
      return `
        <div class="template-card" onclick="RoyalApp.applyTemplate('${t.id}')">
          <div class="template-preview" style="background: ${t.bgColor}">
            <div class="template-sample-dots" style="background: ${t.dotColorMode === 'gradient' ? `linear-gradient(${t.dotGradientAngle}deg, ${t.dotColor1}, ${t.dotColor2})` : t.dotColor1}"></div>
            <span class="template-badge">${t.badge}</span>
          </div>
          <div class="template-meta">
            <h4 class="template-title">${t.name}</h4>
            <span class="template-cat">${t.category}</span>
          </div>
        </div>
      `;
    }).join("");
  },

  applyTemplate(templateId) {
    const t = PRESET_TEMPLATES[templateId];
    if (!t) return;

    // 1. Update UI form elements
    // Dots
    document.querySelectorAll(".dot-style-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.dot === t.dotType);
    });

    const gradRadio = document.querySelector(`input[name='dotColorMode'][value='${t.dotColorMode}']`);
    if (gradRadio) {
      gradRadio.checked = true;
      document.getElementById("dot-gradient-controls").style.display = t.dotColorMode === "gradient" ? "block" : "none";
    }
    this.setColorValues("dotColor1", t.dotColor1);
    this.setColorValues("dotColor2", t.dotColor2);

    const angleSlider = document.getElementById("dotGradientAngle");
    const angleVal = document.getElementById("dotGradientAngle-val");
    if (angleSlider) angleSlider.value = t.dotGradientAngle;
    if (angleVal) angleVal.textContent = `${t.dotGradientAngle}°`;

    // Corners
    document.querySelectorAll(".corner-square-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.style === t.cornerSquareType);
    });
    this.setColorValues("cornerSquareColor", t.cornerSquareColor);

    document.querySelectorAll(".corner-dot-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.style === t.cornerDotType);
    });
    this.setColorValues("cornerDotColor", t.cornerDotColor);

    // Background
    this.setColorValues("bgColor", t.bgColor);
    const bgTrans = document.getElementById("bgTransparent");
    if (bgTrans) bgTrans.checked = t.bgTransparent;

    // Frame
    document.querySelectorAll(".frame-style-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.frame === t.frame);
    });
    const frameControls = document.getElementById("frame-options-panel");
    if (frameControls) frameControls.style.display = t.frame === "none" ? "none" : "block";

    const frameText = document.getElementById("frameText");
    if (frameText) frameText.value = t.frameText;
    this.setColorValues("frameBgColor", t.frameBgColor);
    this.setColorValues("frameTextColor", t.frameTextColor);

    // Logo
    document.querySelectorAll(".preset-icon-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.icon === t.logoKey);
    });

    // 2. Render
    this.generator.render({
      dotType: t.dotType,
      dotColorMode: t.dotColorMode,
      dotColor1: t.dotColor1,
      dotColor2: t.dotColor2,
      dotGradientAngle: t.dotGradientAngle,
      cornerSquareType: t.cornerSquareType,
      cornerSquareColor: t.cornerSquareColor,
      cornerDotType: t.cornerDotType,
      cornerDotColor: t.cornerDotColor,
      bgColor: t.bgColor,
      bgTransparent: t.bgTransparent,
      frame: t.frame,
      frameText: t.frameText,
      frameBgColor: t.frameBgColor,
      frameTextColor: t.frameTextColor,
      logoKey: t.logoKey,
      customLogoUrl: null
    });

    this.closeModal("templates-modal");
    this.showToast(`Applied preset: ${t.name} ✨`);
  },

  // ------------------------------------------------------------------
  // Randomizer & Reset
  // ------------------------------------------------------------------
  randomizeDesign() {
    const keys = Object.keys(PRESET_TEMPLATES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    this.applyTemplate(randomKey);
  },

  resetAll() {
    this.applyTemplate("royal_gold");
    this.showToast("Reset to default Royal Gold style");
  },

  // ------------------------------------------------------------------
  // Modals & Drawers
  // ------------------------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  },

  toggleHistoryDrawer() {
    const drawer = document.getElementById("history-drawer");
    if (drawer) drawer.classList.toggle("active");
  },

  restoreHistoryItem(id) {
    const items = HistoryManager.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (item.type) {
      this.switchTypeTab(item.type);
    }
    if (item.config) {
      this.generator.render(item.config);
    }
    this.toggleHistoryDrawer();
    this.showToast("Restored from history ↺");
  },

  // ------------------------------------------------------------------
  // Toast Notification
  // ------------------------------------------------------------------
  showToast(msg) {
    const toast = document.getElementById("toast-notice");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  },

  // ------------------------------------------------------------------
  // Export Handlers
  // ------------------------------------------------------------------
  getSelectedResolution() {
    const sel = document.getElementById("export-resolution");
    return sel ? parseInt(sel.value, 10) : 1024;
  },

  download(format) {
    const res = this.getSelectedResolution();
    this.showToast(`Generating ${res}x${res} ${format.toUpperCase()}...`);
    this.generator.download(format, res).then(() => {
      this.showToast(`✓ Downloaded ${format.toUpperCase()}`);
    }).catch(err => {
      console.error(err);
      this.showToast("Download failed, please retry");
    });
  },

  copyClipboard() {
    this.generator.copyToClipboard();
  }
};

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  RoyalApp.init();
});
