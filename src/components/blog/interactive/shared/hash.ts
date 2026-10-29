const encoder = new TextEncoder();

/** MurmurHash3 (x86, 32-bit) of a string's UTF-8 bytes, as an unsigned integer. */
export function murmur3(key: string, seed = 0): number {
  const data = encoder.encode(key);
  const length = data.length;
  const blocks = length >> 2;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let h = seed >>> 0;

  for (let i = 0; i < blocks; i++) {
    const j = i * 4;
    let k = data[j] | (data[j + 1] << 8) | (data[j + 2] << 16) | (data[j + 3] << 24);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }

  const tail = blocks * 4;
  const rest = length & 3;
  if (rest > 0) {
    let k = 0;
    if (rest === 3) k ^= data[tail + 2] << 16;
    if (rest >= 2) k ^= data[tail + 1] << 8;
    k ^= data[tail];
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);
    h ^= k;
  }

  h ^= length;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function randomIPv4() {
  const n = Math.floor(Math.random() * 2 ** 32);
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}
