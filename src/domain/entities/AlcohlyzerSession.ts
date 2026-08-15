import { Observable, map } from 'rxjs';
import { IntensityZone } from '../value-objects/IntensityZone';
import { Intensity } from '../value-objects/Intensity';
import { AlcohlyzerResult } from '../value-objects/AlcohlyzerResult';
import type { MeasurePort, PortMeasureEvent } from '../ports/MeasurePort';

export enum SessionStatus {
  IDLE = 'IDLE',
  TESTING = 'TESTING',
  RESULT = 'RESULT',
}

export interface AlcohlyzerMeasureEvent {
  isFinal: boolean;
  result: AlcohlyzerResult;
}

export class AlcohlyzerSession {
  private _status: SessionStatus = SessionStatus.IDLE;
  private _targetZone: IntensityZone = IntensityZone.LOW_ZONE;
  private _result: AlcohlyzerResult = new AlcohlyzerResult(Intensity.fromPercent(0));

  constructor(
    private readonly measurePort: MeasurePort,
    targetZone: IntensityZone = IntensityZone.LOW_ZONE,
  ) {
    this._status = SessionStatus.IDLE;
    this._targetZone = targetZone;
  }

  get state(): {
    status: SessionStatus;
    intensity: Intensity;
    zone: IntensityZone;
  } {
    return {
      status: this._status,
      intensity: this._result.intensity,
      zone: this._result.zone,
    };
  }

  get targetZone(): IntensityZone {
    return this._targetZone;
  }

  setTarget(zone: IntensityZone): void {
    if (this._status !== SessionStatus.IDLE) {
      throw new Error(`Cannot set target zone in ${this._status} state`);
    }
    this._targetZone = zone;
  }

  startTest(): Observable<AlcohlyzerMeasureEvent> {
    if (this._status !== SessionStatus.IDLE) {
      throw new Error(`Cannot start test in ${this._status} state`);
    }

    this._status = SessionStatus.TESTING;
    this._result = new AlcohlyzerResult(Intensity.fromPercent(0));

    // Pick randomized target intensity for the whole session
    const boundaries = this._targetZone.intensityBoundary();
    const targetIntensityValue = boundaries[0] + Math.random() * (boundaries[1] - boundaries[0]);

    return this.measurePort.listenMeasure().pipe(
      map((portEvent: PortMeasureEvent) => {
        const progress = portEvent.measurePercent;
        const intencityPercent = Math.max(
          0,
          Math.min(100, (progress / 100) * targetIntensityValue),
        );
        const intensity = Intensity.fromPercent(intencityPercent);
        const result = new AlcohlyzerResult(intensity);

        if (this._status === SessionStatus.TESTING) {
          this._result = result;
          if (portEvent.isFinal) {
            this._status = SessionStatus.RESULT;
          }
        }

        return {
          isFinal: portEvent.isFinal,
          result,
        };
      }),
    );
  }

  reset(): void {
    if (this._status == SessionStatus.TESTING) {
      this.measurePort.stopMeasure();
    }
    this._status = SessionStatus.IDLE;
    this._result = new AlcohlyzerResult(Intensity.fromPercent(0));
  }
}
