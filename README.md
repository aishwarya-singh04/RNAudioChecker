# AudioViz 🎙️

AudioViz (a.k.a. EchoWave) is a cross-platform [Expo](https://expo.dev) / React Native app for **recording audio and visualizing sound in real time**. It draws a live frequency spectrum while you record, lets you analyze ambient sound, and keeps a searchable library of your recordings on-device.

## Features

- **Record** — Capture audio with a live, animated audio spectrum and a running timer. Pause, resume, and save recordings.
- **Analyzer** — Real-time frequency spectrum and level meter for ambient sound, with speech/music detection.
- **Library** — Browse saved recordings with waveform thumbnails; rename, favorite, and delete entries.
- **Recording details** — Inspect a recording (duration, size, format, bitrate) and play it back.
- **On-device persistence** — Recordings metadata is stored locally via `expo-file-system`; audio files live on the device.
- **Native-feeling UI** — Custom "EchoWave" dark theme, glass/blur surfaces, and Skia-powered visuals.

## Tech stack

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) + [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing, typed routes)
- React 19 / React Native 0.86
- [`react-native-audio-api`](https://github.com/software-mansion/react-native-audio-api) — audio capture & analysis
- [`@shopify/react-native-skia`](https://shopify.github.io/react-native-skia/) — spectrum/waveform rendering
- [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/) + worklets — animations
- `expo-glass-effect` / `expo-blur` — glass UI surfaces
- TypeScript

## Project structure

```
AudioViz/
├── app.json                 # Expo app config (name, icons, permissions, plugins)
├── src/
│   ├── app/                 # Expo Router routes
│   │   ├── (tabs)/          # Tab navigator: Record, Analyzer, Library
│   │   ├── details/[id].tsx # Recording detail + playback
│   │   ├── completed.tsx    # Post-recording summary
│   │   ├── settings.tsx
│   │   ├── permission.tsx   # Microphone permission (modal)
│   │   └── _layout.tsx      # Root stack, providers, theme
│   ├── components/          # UI + EchoWave (ew/) design system
│   ├── hooks/               # use-audio-spectrum, use-audio-player, ...
│   ├── store/               # recordings-store (context + disk persistence)
│   ├── data/                # recordings data helpers/types
│   └── constants/           # theme + echowave-theme
└── assets/                  # icons, splash, images
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   From the output you can open the app in an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), or a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

   > Microphone-dependent features require a development build or a real device — they won't work in Expo Go.

### Run directly on a device/simulator

```bash
npm run ios      # build & run on iOS
npm run android  # build & run on Android
npm run web      # run in the browser
```

## Permissions

AudioViz needs microphone access to record and analyze sound:

- **iOS** — `NSMicrophoneUsageDescription` (configured in `app.json`)
- **Android** — `RECORD_AUDIO`, plus foreground-service permissions for playback

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Build and run on the respective platform |
| `npm run web` | Run the web build |
| `npm run lint` | Lint with ESLint (`expo lint`) |
| `npm run reset-project` | Move starter code aside and start from a blank `app/` |

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [react-native-audio-api](https://github.com/software-mansion/react-native-audio-api)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
