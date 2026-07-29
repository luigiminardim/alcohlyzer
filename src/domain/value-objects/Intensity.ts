export class Intensity {
  private constructor(public readonly percent: number) {}

  static fromPercent(percent: number): Intensity {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    return new Intensity(clampedPercent);
  }

  isEquals(other: Intensity): boolean {
    return this.percent === other.percent;
  }
}
