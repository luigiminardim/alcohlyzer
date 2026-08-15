# Barfometer — Ubiquitous Language

## Purpose

Shared vocabulary for the Barfometer domain. All code, specs, documentation, and conversations should use these terms consistently.

## Glossary

| Term                       | Definition                                                                                               | Code Representation                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Officer**                | A groomsman/bridesmaid who operates the barfometer and secretly presets the result zone                  | User role (no entity — represented by actions)                    |
| **Blower**                 | A wedding guest who blows into the phone microphone for the "breathalyzer test"                          | User role (no entity — represented by actions)                    |
| **IntensityZone**          | One of three result regions on the gauge. Each zone maps to a charge level                               | `IntensityZone` value object: `LOW_ZONE`, `MID_ZONE`, `HIGH_ZONE` |
| **Low Zone**               | The "clean" zone — no charge for the guest                                                               | `IntensityZone.LOW_ZONE`                                          |
| **Mid Zone**               | The "small charge" zone — a minor penalty                                                                | `IntensityZone.MID_ZONE`                                          |
| **High Zone**              | The "big charge" zone — a major penalty                                                                  | `IntensityZone.HIGH_ZONE`                                         |
| **Preset Zone**            | The zone secretly selected by the officer. The needle will always land here regardless of the blow       | `BarfometerSession.targetZone`                                    |
| **Session**                | A single test cycle from setup through result to reset                                                   | `BarfometerSession` entity                                        |
| **Gauge**                  | The velocimeter-style semi-circular meter displayed on screen, divided into three colored zones          | `Gauge` React component (SVG)                                     |
| **Needle**                 | The animated pointer on the gauge that wobbles dramatically during a test and settles on the preset zone | `GaugeNeedle` React component                                     |
| **Blow**                   | The act of a guest blowing into the phone microphone, detected via Web Audio API                         | Detected by `MicrophonePort` + `SoundAnalyzerPort`                |
| **Blow Detection**         | The process of analyzing microphone input to determine if someone is actively blowing                    | `SoundAnalyzerPort.isBlowDetected()`                              |
| **Intensity**              | A normalized measure (0-100) of how hard the blower is blowing, derived from audio volume                | `Intensity` value object                                          |
| **PortMeasureEvent**       | Event emitted by the MeasurePort with the accumulated blow time (measurePercent in seconds)              | `PortMeasureEvent`                                                |
| **BarfometerMeasureEvent** | Rigged event emitted by BarfometerSession containing the final target zone and jittered intensity        | `BarfometerMeasureEvent`                                          |
| **Charge**                 | The penalty/fee/dare assigned to the guest based on the result zone                                      | Displayed via `ResultDisplay` component                           |
| **Toast**                  | A brief, auto-dismissing notification confirming the officer's zone preset                               | Mantine `notifications.show()`                                    |
| **Wobble**                 | The dramatic, non-linear needle animation that occurs during a test, creating suspense                   | `useGaugeAnimation` hook                                          |
| **Reset**                  | Returning the barfometer to a ready state after showing a result, preserving the preset zone             | `ResetSessionUseCase`                                             |

## State Machine States

| State         | Description                                    | Triggered By                    |
| ------------- | ---------------------------------------------- | ------------------------------- |
| **IDLE**      | Initial state. No zone set. Shows start button | App launch / first load         |
| **ZONE_SET**  | Officer has preset a zone. Ready for testing   | Officer double-taps a zone      |
| **LISTENING** | Microphone is active, waiting for blow         | Officer taps "Start Test"       |
| **ANIMATING** | Needle is wobbling after blow detected         | Blow detected by sound analyzer |
| **RESULT**    | Final zone is displayed with charge message    | Animation completes             |

## Flow

```
Officer double-taps zone → Toast confirms → Officer taps "Start Test"
→ Mic activates → Blower blows → Needle wobbles → Settles on preset zone
→ Result flashes → Officer taps "Reset" → Ready for next guest
```
