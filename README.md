# Repro: `replace()` from a `fitToContents` form sheet keeps the sheet's height

Minimal reproduction for [react-native-screens#3615](https://github.com/software-mansion/react-native-screens/issues/3615).

A screen with `presentation: 'formSheet'` and `sheetAllowedDetents: 'fitToContents'` replaces itself
with a plain screen of the same stack. The replacement is shown inside the sheet that UIKit has
already presented, and it keeps the detent that was measured for the *previous* screen: its content
is cut off there, and anything below the sheet's edge no longer takes touches.

## Steps to reproduce

1. `npm install`
2. `npx expo run:ios`
3. The app starts with the form sheet open — as it is when a deep link opens it (see below)
4. Tap **replace() with the Long screen**

## What happens

`Long` appears cut off at the height that was measured for `Sheet` — roughly a third of the screen —
with the rest of the screen blank: only 4 of its 30 rows are visible. The remaining rows are only
reachable by scrolling, and the button at the end of the list does not respond to taps.

## What was expected

`Long` is a plain screen of the stack, so it should fill the screen — as it does when it is opened
directly (`navigate('Long')`).

## What it takes

Both of these are needed; drop either one and the replacement is presented at full size:

- The sheet is part of the navigation state the app **starts with** — a deep link, a push
  notification or a restored state. Tap **Open the form sheet (works)** on `Home` to open the very
  same sheet a moment later: replacing it then measures the replacement correctly.
- The sheet lives in a stack **nested** in another navigator (here: a native bottom tab navigator).
  The same `replace()` in the root stack presents the replacement at full size.

## Notes

- A full-height detent on the replacing screen (`sheetAllowedDetents: [1]`) does not help: without
  its own `formSheet` presentation, `registerContentWrapper` returns `NO` and the sheet update paths
  return early (`ios/RNSScreen.mm`), so nothing re-measures.
- Giving the replacing screen the form sheet presentation *does* re-measure, but a screen taller
  than the sheet then caps at `maximumDetentValue` while its content wrapper keeps the full height —
  the part below the edge stays visible and stops taking touches.

## Workaround

Leave the sheet first and navigate one frame later — synchronously the dismissal that is still
running swallows the navigation:

```ts
navigation.goBack()
requestAnimationFrame(() => navigation.navigate('Long'))
```

## Environment

- `react-native-screens` 4.26.0
- `react-native` 0.86.2
- `expo` 57.0.12
- `@react-navigation/native` 7.3.16, `@react-navigation/native-stack` 7.18.8
- iOS 27.0 simulator (iPhone Air), New Architecture
