// ==========================================
// PERLIN NOISE - خوارزمية الضوضاء للتوليد الإجرائي
// ==========================================

class PerlinNoise {
  constructor(seed = 0) {
    this.seed = seed;
    this.permutation = this.generatePermutation(seed);
    this.p = [...this.permutation, ...this.permutation];
  }

  // ===== توليد جدول الترتيب =====
  generatePermutation(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // خلط باستخدام الـ seed
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(((seed * 16807) % 2147483647) / (2147483647 / (i + 1)));
      [p[i], p[j]] = [p[j], p[i]];
    }

    return p;
  }

  // ===== دالة التنعيم (Smoothstep) =====
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // ===== دالة الاستيفاء الخطي (Lerp) =====
  lerp(t, a, b) {
    return a + t * (b - a);
  }

  // ===== حساب Gradient =====
  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // ===== Perlin Noise ثلاثي الأبعاد =====
  noise(x, y, z) {
    // العثور على وحدة الخلية
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    // الموقع النسبي داخل الخلية
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    // التنعيم
    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    // جدول الترتيب
    const p = this.p;

    // حساب مؤشرات الزوايا
    const n000 = p[p[p[xi] + yi] + zi];
    const n100 = p[p[p[xi + 1] + yi] + zi];
    const n010 = p[p[p[xi] + yi + 1] + zi];
    const n110 = p[p[p[xi + 1] + yi + 1] + zi];
    const n001 = p[p[p[xi] + yi] + zi + 1];
    const n101 = p[p[p[xi + 1] + yi] + zi + 1];
    const n011 = p[p[p[xi] + yi + 1] + zi + 1];
    const n111 = p[p[p[xi + 1] + yi + 1] + zi + 1];

    // حساب Gradient values
    const g000 = this.grad(n000, xf, yf, zf);
    const g100 = this.grad(n100, xf - 1, yf, zf);
    const g010 = this.grad(n010, xf, yf - 1, zf);
    const g110 = this.grad(n110, xf - 1, yf - 1, zf);
    const g001 = this.grad(n001, xf, yf, zf - 1);
    const g101 = this.grad(n101, xf - 1, yf, zf - 1);
    const g011 = this.grad(n011, xf, yf - 1, zf - 1);
    const g111 = this.grad(n111, xf - 1, yf - 1, zf - 1);

    // الاستيفاء
    const nx00 = this.lerp(u, g000, g100);
    const nx10 = this.lerp(u, g010, g110);
    const nx0 = this.lerp(v, nx00, nx10);

    const nx01 = this.lerp(u, g001, g101);
    const nx11 = this.lerp(u, g011, g111);
    const nx1 = this.lerp(v, nx01, nx11);

    return this.lerp(w, nx0, nx1);
  }

  // ===== Perlin Noise ثنائي الأبعاد =====
  noise2D(x, y) {
    return this.noise(x, y, 0);
  }

  // ===== Octave Noise (لتضاريس أكثر تعقيداً) =====
  octaveNoise(x, y, z, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(
        x * frequency,
        y * frequency,
        z * frequency
      ) * amplitude;

      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }

  // ===== 2D Octave Noise =====
  octaveNoise2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    return this.octaveNoise(x, y, 0, octaves, persistence, lacunarity);
  }
}

export default PerlinNoise;
