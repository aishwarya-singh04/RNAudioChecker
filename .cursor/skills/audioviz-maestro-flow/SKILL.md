---
name: audioviz-maestro-flow
description: >-
  Writes a Maestro YAML suite for one AudioViz user flow and runs it on a
  simulator until every command passes. Use when the user names this skill,
  audioviz-maestro-flow, or asks to script and run an AudioViz journey from a
  start screen to an end screen.
disable-model-invocation: true
---

# AudioViz Maestro flow

The user names a journey: where it starts, where it ends, and any extra notes. Write one Maestro flow for that path, run it, and fix failures until it passes.

## Input

Use only what the user described.

- **Start**: first screen or action.
- **End**: last screen or assertion that proves the journey finished.
- **Notes**: optional constraints (what to tap, what to skip, expected copy, data to type).

Cover the real path between start and end, including the states the user called out. Do not add side journeys they did not ask for.

## Write the suite

1. Read the screens on that path and copy labels from source or from `inspect_screen`. Do not invent strings. Maestro `text` is a full-string, case-insensitive regex: a partial label does not match.
2. Add one file: `AudioViz/.maestro/<kebab-name>.yaml`. One journey per file. Header `appId` is `com.anonymous.AudioViz`.
3. Add a `testID` and `accessibilityLabel` only when the control cannot be tapped by its on-screen text (label sits outside the `Pressable`, the control is icon-only, or iOS joins the icon and label into one accessibility name). Keep the visual UI the same.
4. Selector and app facts that already failed once are in [reference.md](reference.md). Read it before writing selectors.

## Run until it passes

1. Discover the Maestro MCP schema with `GetDynamicTools` before each call. The project namespace is `project-0-RNAudioChecker-maestro`. Call `cheat_sheet` before using an unfamiliar command.
2. Call `open_maestro_viewer` and give the user the URL. Do not launch it with `open` or any other shell command.
3. `list_devices`. Use a connected simulator `device_id`. If none is connected, ask the user to boot one. Do not invent an id.
4. `run` with `files` set to the absolute path of the YAML. Do not pass `yaml` and `files` together.
5. If `success` is false, `inspect_screen` (and `take_screenshot` when the hierarchy is ambiguous). Fix the selector or the accessibility id from what is actually on screen. Rerun the whole file.
6. Repeat until `success` is true and every command executed. Do not stop after a failed run.

`yarn ios` serves the JS bundle. A new `testID` is picked up on the next `launchApp` while that process is running. Relaunch once before treating a missing id as a native rebuild.

## Report

Tell the user the flow path, the device, and that the run passed. If earlier attempts failed, name the failing assertion and the change that fixed it.
