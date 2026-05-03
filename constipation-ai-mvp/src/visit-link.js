const els = {
  patientId: document.getElementById("patientIdInput"),
  visitToken: document.getElementById("visitTokenInput"),
  baseUrl: document.getElementById("baseUrlInput"),
  tokenButton: document.getElementById("tokenButton"),
  copyUrlButton: document.getElementById("copyUrlButton"),
  printButton: document.getElementById("printButton"),
  visitUrlOutput: document.getElementById("visitUrlOutput"),
  qrOutput: document.getElementById("qrOutput"),
  qrPatientLabel: document.getElementById("qrPatientLabel"),
  qrTokenLabel: document.getElementById("qrTokenLabel"),
  message: document.getElementById("linkToolMessage"),
};

const TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const QR_VERSION = 5;
const QR_SIZE = 17 + QR_VERSION * 4;
const QR_DATA_CODEWORDS = 108;
const QR_ECC_CODEWORDS = 26;

function defaultBaseUrl() {
  const url = new URL("./index.html", window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function sanitizePatientId(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 12);
}

function sanitizeToken(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 12)
    .toUpperCase();
}

function generateToken(length = 4) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => TOKEN_CHARS[byte % TOKEN_CHARS.length]).join("");
}

function buildVisitUrl() {
  const patientId = sanitizePatientId(els.patientId.value);
  const visitToken = sanitizeToken(els.visitToken.value);
  const url = new URL(els.baseUrl.value || defaultBaseUrl());
  url.searchParams.set("patient_id", patientId);
  url.searchParams.set("visit_token", visitToken);
  return { patientId, visitToken, url: url.toString() };
}

function updateOutput() {
  els.patientId.value = sanitizePatientId(els.patientId.value);
  els.visitToken.value = sanitizeToken(els.visitToken.value);
  const { patientId, visitToken, url } = buildVisitUrl();
  els.visitUrlOutput.textContent = url;
  els.qrPatientLabel.textContent = patientId ? `患者ID: ${patientId}` : "患者ID未入力";
  els.qrTokenLabel.textContent = visitToken ? `来院トークン: ${visitToken}` : "来院トークン未入力";

  const ready = Boolean(patientId && visitToken);
  els.copyUrlButton.disabled = !ready;

  if (!ready) {
    els.qrOutput.innerHTML = "";
    els.message.textContent = "患者IDと来院トークンを入力してください。";
    return;
  }

  try {
    els.qrOutput.innerHTML = makeQrSvg(url);
    els.message.textContent = "";
  } catch (error) {
    els.qrOutput.innerHTML = "";
    els.message.textContent = error.message;
  }
}

async function copyUrl() {
  const { patientId, visitToken, url } = buildVisitUrl();
  if (!patientId || !visitToken) {
    els.message.textContent = "患者IDと来院トークンを入力してください。";
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch (error) {
    fallbackCopyText(url);
  }
  els.copyUrlButton.textContent = "コピー済み";
  els.message.textContent = "患者IDと来院トークン入りURLをコピーしました。";
  setTimeout(() => {
    els.copyUrlButton.textContent = "URLコピー";
  }, 1200);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function makeQrSvg(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > 106) {
    throw new Error("QRに入れるURLが長すぎます。問診アプリURLを短くしてください。");
  }
  const modules = makeQrModules(bytes);
  const scale = 7;
  const quiet = 4;
  const size = QR_SIZE + quiet * 2;
  let path = "";
  modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x + quiet},${y + quiet}h1v1h-1z`;
    });
  });
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="問診URL QR" xmlns="http://www.w3.org/2000/svg" width="${size * scale}" height="${size * scale}"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#20242a"/></svg>`;
}

function makeQrModules(dataBytes) {
  const data = makeDataCodewords(dataBytes);
  const ecc = reedSolomon(data, QR_ECC_CODEWORDS);
  const codewords = [...data, ...ecc];
  const modules = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false));
  const reserved = Array.from({ length: QR_SIZE }, () => Array(QR_SIZE).fill(false));

  drawFunctionPatterns(modules, reserved);
  drawCodewords(modules, reserved, codewords);
  applyMask(modules, reserved, 0);
  drawFormatBits(modules, reserved, 0);
  return modules;
}

function reserve(modules, reserved, x, y, dark) {
  if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) return;
  modules[y][x] = Boolean(dark);
  reserved[y][x] = true;
}

function drawFinder(modules, reserved, x, y) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark = inFinder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      reserve(modules, reserved, xx, yy, dark);
    }
  }
}

function drawAlignment(modules, reserved, x, y) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      reserve(modules, reserved, x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function drawFunctionPatterns(modules, reserved) {
  drawFinder(modules, reserved, 0, 0);
  drawFinder(modules, reserved, QR_SIZE - 7, 0);
  drawFinder(modules, reserved, 0, QR_SIZE - 7);
  drawAlignment(modules, reserved, QR_SIZE - 7, QR_SIZE - 7);
  for (let i = 0; i < QR_SIZE; i++) {
    if (!reserved[6][i]) reserve(modules, reserved, i, 6, i % 2 === 0);
    if (!reserved[i][6]) reserve(modules, reserved, 6, i, i % 2 === 0);
  }
  reserve(modules, reserved, 8, QR_SIZE - 8, true);
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      reserve(modules, reserved, 8, i, false);
      reserve(modules, reserved, i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    reserve(modules, reserved, QR_SIZE - 1 - i, 8, false);
    reserve(modules, reserved, 8, QR_SIZE - 1 - i, false);
  }
}

function drawCodewords(modules, reserved, codewords) {
  const bits = [];
  codewords.forEach((byte) => {
    for (let i = 7; i >= 0; i--) bits.push(((byte >>> i) & 1) === 1);
  });
  let bitIndex = 0;
  let upward = true;
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let vert = 0; vert < QR_SIZE; vert++) {
      const y = upward ? QR_SIZE - 1 - vert : vert;
      for (let dx = 0; dx < 2; dx++) {
        const x = right - dx;
        if (!reserved[y][x]) modules[y][x] = bits[bitIndex++] || false;
      }
    }
    upward = !upward;
  }
}

function applyMask(modules, reserved, mask) {
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (!reserved[y][x] && shouldMask(mask, x, y)) modules[y][x] = !modules[y][x];
    }
  }
}

function shouldMask(mask, x, y) {
  return mask === 0 && (x + y) % 2 === 0;
}

function drawFormatBits(modules, reserved, mask) {
  const bits = formatBits(mask);
  for (let i = 0; i <= 5; i++) reserve(modules, reserved, 8, i, bit(bits, i));
  reserve(modules, reserved, 8, 7, bit(bits, 6));
  reserve(modules, reserved, 8, 8, bit(bits, 7));
  reserve(modules, reserved, 7, 8, bit(bits, 8));
  for (let i = 9; i < 15; i++) reserve(modules, reserved, 14 - i, 8, bit(bits, i));
  for (let i = 0; i < 8; i++) reserve(modules, reserved, QR_SIZE - 1 - i, 8, bit(bits, i));
  for (let i = 8; i < 15; i++) reserve(modules, reserved, 8, QR_SIZE - 15 + i, bit(bits, i));
}

function bit(value, index) {
  return ((value >>> index) & 1) === 1;
}

function formatBits(mask) {
  let data = (1 << 3) | mask;
  let value = data << 10;
  const generator = 0x537;
  for (let i = 14; i >= 10; i--) {
    if (((value >>> i) & 1) !== 0) value ^= generator << (i - 10);
  }
  return (((data << 10) | value) ^ 0x5412) & 0x7fff;
}

function makeDataCodewords(bytes) {
  const bits = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));
  appendBits(bits, 0, Math.min(4, QR_DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bitsToByte(bits.slice(i, i + 8)));
  for (let pad = 0xec; data.length < QR_DATA_CODEWORDS; pad ^= 0xfd) data.push(pad);
  return data;
}

function appendBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function bitsToByte(bits) {
  return bits.reduce((value, current) => (value << 1) | current, 0);
}

function reedSolomon(data, degree) {
  const generator = rsGenerator(degree);
  const result = Array(degree).fill(0);
  data.forEach((byte) => {
    const factor = byte ^ result.shift();
    result.push(0);
    generator.forEach((coefficient, index) => {
      result[index] ^= gfMul(coefficient, factor);
    });
  });
  return result;
}

function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = Array(poly.length + 1).fill(0);
    poly.forEach((coefficient, index) => {
      next[index] ^= gfMul(coefficient, 1);
      next[index + 1] ^= gfMul(coefficient, gfPow(2, i));
    });
    poly = next;
  }
  return poly.slice(1);
}

function gfMul(x, y) {
  let result = 0;
  for (let i = 0; i < 8; i++) {
    if (y & 1) result ^= x;
    const carry = x & 0x80;
    x = (x << 1) & 0xff;
    if (carry) x ^= 0x1d;
    y >>>= 1;
  }
  return result;
}

function gfPow(x, power) {
  let result = 1;
  for (let i = 0; i < power; i++) result = gfMul(result, x);
  return result;
}

els.baseUrl.value = localStorage.getItem("constipation_base_url") || defaultBaseUrl();
els.visitToken.value = generateToken();
[els.patientId, els.visitToken, els.baseUrl].forEach((input) => input.addEventListener("input", () => {
  if (input === els.baseUrl) localStorage.setItem("constipation_base_url", els.baseUrl.value);
  updateOutput();
}));
els.tokenButton.addEventListener("click", () => {
  els.visitToken.value = generateToken();
  updateOutput();
});
els.copyUrlButton.addEventListener("click", copyUrl);
els.printButton.addEventListener("click", () => window.print());
updateOutput();
