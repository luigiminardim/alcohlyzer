# Barfometer — Context Map

## Overview

Barfometer operates as a **single bounded context** with a simple domain. The complexity lies in the integration with browser APIs (microphone, storage) rather than in domain logic.

## Bounded Context: Barfometer Game

```
┌──────────────────────────────────────────────────────────┐
│                    BARFOMETER GAME                        │
│                                                          │
│   ┌────────────────────────────────────────────────┐     │
│   │              CORE SUBDOMAIN                     │     │
│   │            (Game Logic)                         │     │
│   │                                                 │     │
│   │  Entities:  BarfometerSession (Aggregate Root)  │     │
│   │  Values:    Zone, BlowResult                    │     │
│   │  States:    IDLE → ZONE_SET → LISTENING →       │     │
│   │             ANIMATING → RESULT                  │     │
│   │                                                 │     │
│   │  Use Cases: SetZone, StartTest,                 │     │
│   │             ProcessBlow, ResetSession            │     │
│   └───────────────────┬────────────────────────────┘     │
│                       │                                   │
│           ┌───────────┼───────────┐                      │
│           │           │           │                      │
│   ┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────────┐     │
│   │    AUDIO     │ │ PERSIST.  │ │ PRESENTATION  │     │
│   │  DETECTION   │ │           │ │               │     │
│   │ (Supporting) │ │(Supporting)│ │ (Supporting)  │     │
│   │              │ │           │ │               │     │
│   │ Mic access   │ │ Zone      │ │ SVG Gauge     │     │
│   │ Sound        │ │ storage   │ │ Needle anim.  │     │
│   │ analysis     │ │ Language  │ │ Toast/notif.  │     │
│   │ Blow detect  │ │ prefs     │ │ i18n toggle   │     │
│   └──────────────┘ └───────────┘ └───────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Subdomains

### Core Subdomain: Game Logic
- **What it is**: The rules of the barfometer game — state management, zone presets, blow processing, result determination
- **Why it's core**: This is the unique business logic that makes Barfometer what it is. Without it, there's no game.
- **Implementation**: Domain entities + Application use cases
- **Dependencies**: NONE (pure TypeScript, no frameworks)

### Supporting Subdomain: Audio Detection
- **What it is**: Microphone access and sound analysis to detect blowing
- **Why it's supporting**: It serves the core domain but could be replaced with a different detection mechanism (e.g., button press) without changing game rules
- **Implementation**: Infrastructure adapters implementing domain ports
- **External deps**: Web Audio API (`getUserMedia`, `AudioContext`, `AnalyserNode`)

### Supporting Subdomain: Persistence
- **What it is**: Saving and loading user preferences (preset zone, language)
- **Why it's supporting**: The game works without persistence, but it improves UX
- **Implementation**: Infrastructure adapter implementing `StoragePort`
- **External deps**: `window.localStorage`

### Supporting Subdomain: Presentation
- **What it is**: The visual interface — SVG gauge, animations, notifications, language toggle
- **Why it's supporting**: The domain logic is independent of how it's rendered
- **Implementation**: React components + Mantine UI + CSS Modules
- **External deps**: React, Mantine, react-i18next

## Integration Patterns

All subdomains communicate through **ports** (interfaces defined in the domain layer):

| Port | Core ↔ Subdomain | Direction |
|------|-------------------|-----------|
| `MicrophonePort` | Core ↔ Audio Detection | Core calls adapter |
| `SoundAnalyzerPort` | Core ↔ Audio Detection | Core calls adapter |
| `StoragePort` | Core ↔ Persistence | Core calls adapter |
| React Hooks | Core ↔ Presentation | Presentation wraps use cases |

## Why a Single Bounded Context?

The domain is simple enough that splitting into multiple bounded contexts would be over-engineering. All concepts (zones, sessions, blows) share the same ubiquitous language and operate on the same aggregate (`BarfometerSession`).
