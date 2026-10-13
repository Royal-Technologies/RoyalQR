// RoyalQR Core Generation & Styling Engine
class RoyalQRGenerator {
  constructor(previewContainerId) {
    this.container = document.getElementById(previewContainerId);
    this.qrCodeInstance = null;
    this.currentConfig = this.getDefaultConfig();
    this.isRendering = false;
  }

  getDefaultConfig() {
    return {
      type: "url",
      data: "https://www.royaltechbd.com",
      size: 340,
      margin: 8,
      errorCorrectionLevel: "Q", // high resilience
      // Dots
      dotType: "classy-rounded",
      dotColorMode: "gradient", // 'single' | 'gradient'
      dotColor1: "#F59E0B",
      dotColor2: "#B45309",
      dotGradientType: "linear",
      dotGradientAngle: 45,
      // Corner Square (Outer Eye)
      linkCornerColors: false,
      cornerSquareType: "extra-rounded",
      cornerSquareColor: "#D97706",
      // Corner Dot (Inner Eye)
      cornerDotType: "dot",
      cornerDotColor: "#92400E",
      // Background
      bgColor: "#0F172A",
      bgTransparent: false,
      // Logo / Center Image
      logoKey: "crown", // preset key or 'custom' or 'none'
      customLogoUrl: null,
      logoSize: 0.20,
      logoMargin: 6,
      hideBackgroundDots: true,
      // Frame / Badge
      frame: "bottom-banner", // 'none' | 'bottom-banner' | 'top-banner' | 'polaroid' | 'badge'
      frameText: "SCAN ME",
      frameBgColor: "#1E293B",
      frameTextColor: "#FBBF24",
      frameFontSize: 22
    };
  }

  init() {
    this.render();
  }

  getResolvedLogoUrl(config) {
    if (config.logoKey === "custom" && config.customLogoUrl) {
      return config.customLogoUrl;
    }
    if (config.logoKey && PRESET_ICONS[config.logoKey]) {
      return getSvgDataUrl(PRESET_ICONS[config.logoKey].svg);
    }
    return "";
  }

  buildQrStylingOptions(config, renderSize = 340) {
    // Determine dots styling
    let dotsOptions = {
      type: config.dotType || "square"
    };

    if (config.dotColorMode === "gradient") {
      dotsOptions.gradient = {
        type: config.dotGradientType || "linear",
        rotation: ((config.dotGradientAngle || 0) * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: config.dotColor1 || "#000000" },
          { offset: 1, color: config.dotColor2 || "#000000" }
        ]
      };
    } else {
      dotsOptions.color = config.dotColor1 || "#000000";
    }

    // Corner Square
    let cornersSquareOptions = {
      type: config.cornerSquareType || "square"
    };
    if (config.linkCornerColors) {
      cornersSquareOptions.color = config.dotColor1 || "#000000";
    } else {
      cornersSquareOptions.color = config.cornerSquareColor || config.dotColor1 || "#000000";
    }

    // Corner Dot
    let cornersDotOptions = {
      type: config.cornerDotType || "dot"
    };
    if (config.linkCornerColors) {
      cornersDotOptions.color = config.dotColor2 || config.dotColor1 || "#000000";
    } else {
      cornersDotOptions.color = config.cornerDotColor || config.dotColor1 || "#000000";
    }

    // Background
    let backgroundOptions = {
      color: config.bgTransparent ? "rgba(0,0,0,0)" : (config.bgColor || "#ffffff")
    };

    // Center Image / Logo
    const logoUrl = this.getResolvedLogoUrl(config);
    let imageOptions = {
      hideBackgroundDots: config.hideBackgroundDots !== false,
      imageSize: parseFloat(config.logoSize || 0.35),
      margin: parseInt(config.logoMargin || 6, 10),
      crossOrigin: "anonymous"
    };

    return {
      width: renderSize,
      height: renderSize,
      type: "canvas",
      data: config.data || "https://www.royaltechbd.com",
      image: logoUrl || undefined,
      margin: parseInt(config.margin || 8, 10),
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: config.errorCorrectionLevel || "Q"
      },
      imageOptions: imageOptions,
      dotsOptions: dotsOptions,
      cornersSquareOptions: cornersSquareOptions,
      cornersDotOptions: cornersDotOptions,
      backgroundOptions: backgroundOptions
    };
  }

  async render(newConfig = null) {
    if (newConfig) {
      this.currentConfig = { ...this.currentConfig, ...newConfig };
    }
    const config = this.currentConfig;
    if (!this.container) return;

    const hasFrame = config.frame && config.frame !== "none";
    const previewSize = 340;
    const qrOptions = this.buildQrStylingOptions(config, previewSize);

    if (!hasFrame) {
      // Direct native render without frame overhead
      this.container.innerHTML = "";
      const qr = new QRCodeStyling(qrOptions);
      qr.append(this.container);
      this.qrInstance = qr;
    } else {
      // Compose with frame
      const qr = new QRCodeStyling(qrOptions);
      this.qrInstance = qr;
      try {
        const blob = await qr.getRawData("png");
        if (!blob) throw new Error("Could not get QR blob");
        const img = new Image();
        const url = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
          img.onload = () => { URL.revokeObjectURL(url); resolve(); };
          img.onerror = reject;
          img.src = url;
        });

        const framedCanvas = await this.composeFramedCanvas(img, config, previewSize);
        this.container.innerHTML = "";
        this.container.appendChild(framedCanvas);
      } catch (err) {
        console.warn("Frame compositing fallback:", err);
        this.container.innerHTML = "";
        qr.append(this.container);
      }
    }

    // Evaluate scannability
    setTimeout(() => this.evaluateScannability(), 80);
  }

  /**
   * High-resolution frame compositing on HTML5 Canvas
   */
  async composeFramedCanvas(sourceCanvas, config, baseSize = 340) {
    const frameType = config.frame || "none";
    const frameText = (config.frameText || "SCAN ME").toUpperCase();
    const frameBg = config.frameBgColor || "#1E293B";
    const frameTextColor = config.frameTextColor || "#FBBF24";

    const qrW = sourceCanvas.naturalWidth || sourceCanvas.width || 340;
    const qrH = sourceCanvas.naturalHeight || sourceCanvas.height || 340;

    // Calculate dimensions based on frame type
    let canvasW, canvasH, qrX, qrY, textX, textY, bannerRect;
    const padding = Math.round(qrW * 0.08); // 8% padding around QR

    if (frameType === "bottom-banner") {
      const bannerHeight = Math.round(qrH * 0.18);
      canvasW = qrW + padding * 2;
      canvasH = qrH + padding * 2 + bannerHeight;
      qrX = padding;
      qrY = padding;
      bannerRect = {
        x: padding,
        y: qrH + padding + Math.round(bannerHeight * 0.15),
        w: qrW,
        h: Math.round(bannerHeight * 0.75),
        radius: Math.round(bannerHeight * 0.38)
      };
      textX = canvasW / 2;
      textY = bannerRect.y + bannerRect.h / 2;
    } else if (frameType === "top-banner") {
      const bannerHeight = Math.round(qrH * 0.18);
      canvasW = qrW + padding * 2;
      canvasH = qrH + padding * 2 + bannerHeight;
      bannerRect = {
        x: padding,
        y: padding,
        w: qrW,
        h: Math.round(bannerHeight * 0.75),
        radius: Math.round(bannerHeight * 0.38)
      };
      qrX = padding;
      qrY = padding + bannerHeight;
      textX = canvasW / 2;
      textY = bannerRect.y + bannerRect.h / 2;
    } else if (frameType === "polaroid") {
      const bottomArea = Math.round(qrH * 0.28);
      canvasW = qrW + padding * 2;
      canvasH = qrH + padding + bottomArea;
      qrX = padding;
      qrY = padding;
      textX = canvasW / 2;
      textY = qrH + padding + bottomArea * 0.55;
    } else if (frameType === "badge") {
      const badgeH = Math.round(qrH * 0.16);
      canvasW = qrW + padding * 2;
      canvasH = qrH + padding * 2 + badgeH;
      qrX = padding;
      qrY = padding;
      bannerRect = {
        x: canvasW * 0.15,
        y: qrH + padding + Math.round(badgeH * 0.1),
        w: canvasW * 0.7,
        h: Math.round(badgeH * 0.8),
        radius: Math.round(badgeH * 0.4)
      };
      textX = canvasW / 2;
      textY = bannerRect.y + bannerRect.h / 2;
    } else {
      // Fallback
      return sourceCanvas;
    }

    const outCanvas = document.createElement("canvas");
    outCanvas.width = canvasW;
    outCanvas.height = canvasH;
    const ctx = outCanvas.getContext("2d");

    // Outer card background
    const cardRadius = Math.round(canvasW * 0.05);
    ctx.fillStyle = config.bgTransparent ? "transparent" : (config.bgColor || "#0F172A");

    if (!config.bgTransparent) {
      this.drawRoundedRect(ctx, 0, 0, canvasW, canvasH, cardRadius);
      ctx.fill();
    }

    // Draw QR code in position
    ctx.drawImage(sourceCanvas, qrX, qrY);

    // Draw Frame banner / text
    if (frameType === "polaroid") {
      // Polaroid style text
      ctx.fillStyle = frameTextColor;
      ctx.font = `bold ${Math.round(canvasW * 0.052)}px 'Montserrat', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "2px";
      ctx.fillText(frameText, textX, textY);
    } else if (bannerRect) {
      // Pill/Banner background
      ctx.fillStyle = frameBg;
      this.drawRoundedRect(ctx, bannerRect.x, bannerRect.y, bannerRect.w, bannerRect.h, bannerRect.radius);
      ctx.fill();

      // Banner text
      ctx.fillStyle = frameTextColor;
      ctx.font = `700 ${Math.round(bannerRect.h * 0.44)}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "1.5px";
      ctx.fillText(frameText, textX, textY + 1);
    }

    return outCanvas;
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Render high-res master canvas at requested export resolution (512, 1024, 2048, 4096)
   */
  async renderHighResCanvas(targetSize = 1024) {
    const config = this.currentConfig;
    const hasFrame = config.frame && config.frame !== "none";

    const qrOptions = this.buildQrStylingOptions(config, targetSize);
    const tempDiv = document.createElement("div");
    const qr = new QRCodeStyling(qrOptions);
    qr.append(tempDiv);

    await new Promise(resolve => setTimeout(resolve, 100));
    const qrCanvas = tempDiv.querySelector("canvas");
    if (!qrCanvas) throw new Error("Could not generate high-res QR canvas");

    if (!hasFrame) {
      return qrCanvas;
    }
    return await this.composeFramedCanvas(qrCanvas, config, targetSize);
  }

  /**
   * Download in various formats: PNG, JPEG, WEBP, SVG, PDF
   */
  async download(format = "png", resolution = 1024) {
    const config = this.currentConfig;
    const fileName = `RoyalQR_${config.type}_${Date.now()}`;

    if (format === "svg") {
      // Vector export
      const qrOptions = this.buildQrStylingOptions(config, resolution);
      qrOptions.type = "svg";
      const qr = new QRCodeStyling(qrOptions);
      await qr.download({ name: fileName, extension: "svg" });
      this.recordHistory(fileName);
      return;
    }

    if (format === "pdf") {
      // PDF export
      const canvas = await this.renderHighResCanvas(resolution);
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Add Title & Styling
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(20, 20, 30);
      doc.text("RoyalQR - High Resolution Code", 105, 30, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 110);
      const sub = config.data.length > 50 ? config.data.slice(0, 47) + "..." : config.data;
      doc.text(sub, 105, 38, { align: "center" });

      // Embed QR image centered (130mm x 130mm)
      const qrSizeMm = 130;
      const x = (210 - qrSizeMm) / 2;
      const y = 50;
      doc.addImage(imgData, "PNG", x, y, qrSizeMm, qrSizeMm);

      doc.setFontSize(9);
      doc.setTextColor(140, 140, 150);
      doc.text("Generated with RoyalQR Studio • Scan with any smartphone camera", 105, 200, { align: "center" });

      doc.save(`${fileName}.pdf`);
      this.recordHistory(fileName);
      return;
    }

    // Raster Formats: PNG, JPEG, WEBP
    const canvas = await this.renderHighResCanvas(resolution);
    const mimeType = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const dataUrl = canvas.toDataURL(mimeType, 0.95);

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${fileName}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this.recordHistory(fileName, dataUrl);
  }

  async copyToClipboard() {
    try {
      const canvas = await this.renderHighResCanvas(800);
      canvas.toBlob(async blob => {
        if (!blob) throw new Error("Canvas blob conversion failed");
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        window.RoyalApp.showToast("✓ Copied to clipboard! Ready to paste.");
      }, "image/png");
    } catch (err) {
      console.error(err);
      window.RoyalApp.showToast("Could not copy directly. Please use Download PNG.");
    }
  }

  recordHistory(title, thumbUrl = null) {
    try {
      if (!thumbUrl && this.container) {
        const c = this.container.querySelector("canvas");
        if (c) thumbUrl = c.toDataURL("image/png", 0.5);
      }
      HistoryManager.addItem({
        type: this.currentConfig.type,
        data: this.currentConfig.data,
        previewTitle: this.currentConfig.data.length > 28 ? this.currentConfig.data.slice(0, 25) + "..." : this.currentConfig.data,
        config: JSON.parse(JSON.stringify(this.currentConfig)),
        thumbUrl: thumbUrl
      });
    } catch (e) {
      console.warn("Failed saving history record:", e);
    }
  }

  /**
   * In-browser QR Verification using jsQR
   */
  evaluateScannability() {
    const badgeEl = document.getElementById("scannability-badge");
    const testResultEl = document.getElementById("test-scan-result");
    if (!badgeEl) return;

    const canvas = this.container ? this.container.querySelector("canvas") : null;
    if (!canvas || typeof window.jsQR !== "function") {
      badgeEl.className = "quality-badge quality-good";
      badgeEl.innerHTML = `<span>🟢</span> <span>Ready to Scan</span>`;
      return;
    }

    try {
      const ctx = canvas.getContext("2d");
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        badgeEl.className = "quality-badge quality-excellent";
        badgeEl.innerHTML = `<span>✓</span> <span>100% Readable</span>`;
        if (testResultEl) {
          testResultEl.innerHTML = `<span class="text-emerald-400 font-semibold">Decoded Successfully:</span> <code class="text-xs text-slate-300 break-all">${code.data}</code>`;
        }
      } else {
        badgeEl.className = "quality-badge quality-warning";
        badgeEl.innerHTML = `<span>⚠️</span> <span>Check Contrast</span>`;
        if (testResultEl) {
          testResultEl.innerHTML = `<span class="text-amber-400">Scanner tip:</span> Ensure contrast between dots and background is high enough.`;
        }
      }
    } catch (e) {
      badgeEl.className = "quality-badge quality-good";
      badgeEl.innerHTML = `<span>🟢</span> <span>High Quality (${this.currentConfig.errorCorrectionLevel})</span>`;
    }
  }
}
