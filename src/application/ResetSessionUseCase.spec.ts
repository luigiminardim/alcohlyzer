import { describe, it, expect, beforeEach } from "vitest";
import { ResetSessionUseCase } from "./ResetSessionUseCase";
import {
  AlcohlyzerSession,
  SessionStatus,
} from "../domain/entities/AlcohlyzerSession";
import { IntensityZone } from "../domain/value-objects/IntensityZone";
import { Intensity } from "../domain/value-objects/Intensity";
import { AlcohlyzerResult } from "../domain/value-objects/AlcohlyzerResult";
import type {
  MeasurePort,
  PortMeasureEvent,
} from "../domain/ports/MeasurePort";
import { Observable } from "rxjs";

describe("ResetSessionUseCase", () => {
  let session: AlcohlyzerSession;
  let useCase: ResetSessionUseCase;

  beforeEach(() => {
    const mockPort: MeasurePort = {
      listenMeasure: () => new Observable<PortMeasureEvent>(),
      stopMeasure: () => {},
    };
    session = new AlcohlyzerSession(mockPort, IntensityZone.MID_ZONE);
    useCase = new ResetSessionUseCase(session);
  });

  it("should reset the session", () => {
    // Given: a session with a completed test
    session.startTest();

    // forcefully change state to test reset
    (session as any)._status = SessionStatus.RESULT;
    (session as any)._targetZone = IntensityZone.MID_ZONE;
    (session as any)._result = new AlcohlyzerResult(Intensity.fromPercent(100));

    expect(session.state.status).toBe(SessionStatus.RESULT);

    // When: the use case is executed
    useCase.execute();

    // Then: the session should be reset to IDLE and retain the targetZone
    expect(session.state.status).toBe(SessionStatus.IDLE);
    expect(session.targetZone).toBe(IntensityZone.MID_ZONE);
    expect(session.state.intensity.percent).toBe(0);
    expect(session.state.zone).toBe(IntensityZone.LOW_ZONE);
  });
});
