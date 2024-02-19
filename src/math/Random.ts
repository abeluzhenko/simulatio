// https://en.wikipedia.org/wiki/Multiply-with-carry_pseudorandom_number_generator
export class Random {
  private static w = 123456789
  private static z = 987654321
  private static mask = 0xffffffff

  static seed(seed: number) {
    this.w = (123456789 + seed) & this.mask
    this.z = (987654321 - seed) & this.mask
  }

  static next() {
    this.z = (36969 * (this.z & 65535) + (this.z >> 16)) & this.mask
    this.w = (18000 * (this.w & 65535) + (this.w >> 16)) & this.mask
    let result = ((this.z << 16) + (this.w & 65535)) >>> 0
    result /= 4294967296
    return result
  }
}
