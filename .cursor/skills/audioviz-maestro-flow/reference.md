# AudioViz Maestro reference

Proven on the iPhone 17 Pro simulator against `AudioViz/.maestro/recording-journey.yaml`.

## Launch

The app opens on Analyzer. Splash takes about 1.5s. Wait up to 20s for `tab-record`, then tap it when the journey starts on Record.

```yaml
appId: com.anonymous.AudioViz
---
- launchApp:
    clearState: true
    stopApp: true
    permissions:
      microphone: allow
- extendedWaitUntil:
    visible:
      id: tab-record
    timeout: 20000
```

Maestro grants the microphone by default. Still set `microphone: allow`. If an `Allow` or `OK` prompt is visible, tap it inside `runFlow` `when: visible`.

## Existing ids

| id | Control |
| --- | --- |
| `tab-analyzer` | Analyzer tab |
| `tab-record` | Record tab |
| `tab-library` | Library tab |
| `start-recording` | Mic button. Visible headline is "Tap to Record", which is not inside the button. |
| `discard-recording` | Discard |
| `stop-and-save` | Stop & Save |
| `pause-resume` | Pause, then Resume. The id does not change. |
| `rename-input` | Rename field |
| `rename-cancel` | Cancel |
| `rename-save` | Save. Do not call `hideKeyboard`; it fails on this simulator. Save stays above the keyboard. |

## Selectors that must not be exact

- Timers. Each second is on screen briefly. Wait for `00:0[2-9]|00:[1-5][0-9]`, quoted so YAML does not parse it as a time. Timeout 20s.
- Status copy uses a unicode ellipsis: `Recording…`, `Listening…`. Copy that character from source.
- Completed actions join the icon and the word: match `.*Play`, `.*Pause`, `.*Rename`, `.*Done`.
- Rename title can be followed by other words. Match `Rename recording.*`. After save, assert that pattern is gone.
- First simulator keyboard use can show a QuickPath coach mark. If `Continue` is visible, tap it before typing.
- A library row is one accessibility string: title, date, duration, size. Match `Voice memo.*` (or whatever title was typed), not the title alone.
- Chips join the icon and the word. Match `.*Favorites`.
- Record-tab title is `Echo Wave`. Library title is `EchoWave`.

## Quote these YAML values

Quote any `HH:MM` or `MM:SS` string, and quote labels that contain `·` or regex characters.
