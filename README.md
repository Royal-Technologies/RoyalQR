# 👑 RoyalQR Studio

> **The Ultimate, High-Resolution, 100% Client-Side Custom QR Code Studio.**  
> A feature-rich, high-performance alternative to Adobe Express QR Code Generator. Generates fully styled QR codes entirely client-side with zero server calls, zero tracking, and native 1-click **GitHub Pages** deployment.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue.svg)](https://pages.github.com/)
[![Pure JavaScript](https://img.shields.io/badge/Zero%20Backend-100%25%20Client--Side-green.svg)](#)

---

## 🌟 Why RoyalQR Studio? (Feature Comparison)

| Feature | Adobe Express Free QR | 👑 **RoyalQR Studio** |
|---|---|---|
| **Backend / Server** | Cloud & Adobe Account Required | **100% Client-Side (Zero Server Overhead)** |
| **Hosting on GitHub Pages** | ❌ No | **✅ 1-Click Static Deployment** |
| **Supported Data Types** | Basic URL / Plain Text | **11+ Types**: URL, Text, Wi-Fi, vCard, WhatsApp, SMS, Email, Phone, Crypto, Socials, Events |
| **Dot & Body Patterns** | 5 Basic Styles | **6 Advanced Patterns**: Classy Rounded, Dots, Rounded, Classy, Extra-Rounded, Square |
| **Color & Gradients** | Flat Solid Color Only | **Single Color + Linear & Radial Gradients (0°–360° Angle Control)** |
| **Corner Eyes Customization** | Locked to dot style | **Independent Shapes & Colors for Outer Frame & Inner Eye Ball** |
| **Background Options** | Solid White / Basic Color | **Solid Colors + Full Transparent PNG Mode (Sticker & Print Ready)** |
| **Logos & Watermarks** | Restricted / Login Wall | **Custom Image Upload + 12 Built-in Vector Brand Icons** (WhatsApp, YouTube, WiFi, GitHub, etc.) |
| **Frames & "SCAN ME" Badges** | Very Limited | **5 Layouts**: Bottom Banner, Top Banner, Polaroid Card, Pill Badge + Custom Editable Typography |
| **Export Resolutions** | Standard Screen Res | **512px, 1024px (HD), 2048px (2K Ultra HD), 4096px (4K Print Master)** |
| **Export Formats** | PNG, JPG | **PNG, SVG (Lossless Vector), PDF (Print Ready Sheet), WEBP, JPEG** |
| **Clipboard Support** | ❌ No | **✅ 1-Click Direct Copy to Clipboard** (Instant paste into Photoshop, Figma, or Word) |
| **In-Browser Scanner Test** | ❌ No | **✅ Integrated QR Decoder** (Real-time scannability verification meter) |
| **Design Presets** | ❌ No | **✅ 8 Curated Luxury Design Templates** (Royal Gold, Cyberpunk Neon, Emerald Nature, etc.) |
| **History & Storage** | ❌ No | **✅ LocalStorage History Drawer** (Save, restore, and re-download recent codes offline) |
| **Privacy & Security** | Data logged on Adobe servers | **🔒 100% Private (No data ever leaves your device)** |

---

## 🚀 Live Deployment on GitHub Pages

Because this project is built entirely with modern web standards (**HTML5, CSS3, ES6+ JavaScript**) without PHP, Node servers, or bundlers, hosting on GitHub Pages is completely free and requires zero build steps:

### 1. Initialize & Push to GitHub

```bash
git init
git add .
git commit -m "Initial release of RoyalQR Studio"
git branch -M main
git remote add origin https://github.com/Royal-Technologies/RoyalQR.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Navigate to your repository on GitHub (`https://github.com/Royal-Technologies/RoyalQR`).
2. Make sure the repository visibility is set to **Public** (*Settings > General > Danger Zone > Change visibility > Make Public*).
3. Go to the **Settings** tab.
4. Select **Pages** from the left navigation menu.
5. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
6. Click **Save**.
7. Your app will be live within 1–2 minutes at:  
   👉 `https://royal-technologies.github.io/RoyalQR/`

---

## 🎨 Supported Data Types

- 🔗 **Website URL**: Web links with automatic protocol formatting.
- 📝 **Plain Text**: Unformatted text, notes, and quotes.
- 📶 **Wi-Fi Network**: Network SSID, password, and encryption type (WPA/WPA2/WEP/Open) for instant zero-type connection.
- 👤 **vCard / Contact Card**: Name, phone, email, organization, title, URL, and physical address for 1-tap phonebook saving.
- 💬 **WhatsApp**: Direct chat link with international phone number and pre-filled message.
- 📧 **Email**: Recipient address with pre-configured subject and message body.
- 📞 **Phone Number**: Direct tel link for instant smartphone dialing.
- 💬 **SMS**: Phone number and pre-composed text message.
- 💰 **Cryptocurrency**: Bitcoin, Ethereum, and USDT wallet addresses with optional amounts.
- 🌐 **Social Profiles**: Direct links for Instagram, YouTube, TikTok, X (Twitter), LinkedIn, Facebook, and GitHub.
- 📅 **Calendar Event**: iCalendar format with title, start/end timestamps, location, and description.

---

## 📁 Project Architecture

```
RoyalQR/
├── index.html              # Main responsive application interface & control hub
├── css/
│   └── style.css           # Luxury dark/light themes, animations & responsive grid
├── js/
│   ├── vendor/             # Fully self-contained offline vendor libraries
│   │   ├── qr-code-styling.js
│   │   ├── jspdf.umd.min.js
│   │   └── jsqr.min.js
│   ├── generator.js        # Core QR code generation, framed canvas composite & export engine
│   ├── templates.js        # 8 curated luxury designer presets
│   ├── history.js          # LocalStorage history and saved items manager
│   └── app.js              # State manager, form input orchestrator & live UI bindings
├── assets/
│   └── icons/
│       └── icons.js        # Built-in vector brand icon dataset
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for personal, commercial, and client projects.

---

## 🏢 Developed & Maintained by

**[Royal Technologies](https://www.royaltechbd.com)**  
*Innovating Next-Generation Digital Experiences.*

- 📍 **Address**: D - 408, Housing Estate, Kushtia 7000, Bangladesh
- ✉️ **Email**: [info@royaltechbd.com](mailto:info@royaltechbd.com)
- 🌐 **Website**: [https://www.royaltechbd.com](https://www.royaltechbd.com)
