# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, make sure you have the correct version of [Node.js](https://nodejs.org/) installed. See the [`.nvmrc`](./.nvmrc) file for the version used in this project.

Run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development without manually migrating.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

If you want to use Android Studio or Xcode to edit the native code, you can open the `example/android` or `example/ios` directories respectively in those editors. To edit the Objective-C or Swift files, open `example/ios/ReactNativeWheelPickerNativeExample.xcworkspace` in Xcode and find the source files at `Pods > Development Pods > @apolloscooters/react-native-wheel-picker-native`.

To edit the Java or Kotlin files, open `example/android` in Android studio and find the source files at `apolloscooters-react-native-wheel-picker-native` under `Android`.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "ReactNativeWheelPickerNativeExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

Before sending a change, run the same checks CI runs:

```sh
yarn typecheck
yarn lint
yarn test
```

`yarn lint --fix` fixes formatting.

### Scripts

- `yarn`: install dependencies.
- `yarn typecheck`: type-check with TypeScript.
- `yarn lint`: lint with [ESLint](https://eslint.org/).
- `yarn test`: run the unit tests with Jest.
- `yarn prepare`: build the package into `lib`.
- `yarn example start`: start Metro for the example app.
- `yarn example ios` / `yarn example android`: run the example app.

### The one rule of the native code

A wheel that is on screen must never be rebuilt, because a touch that lands while a `UIPickerView` reloads its rows crashes the app (see "Why this exists" in the README). When you change the native code:

- never call `reloadAllComponents` (iOS) or change `displayedValues` (Android) on a wheel that is on screen; build a new wheel instead,
- only move the selection from code when nobody is touching the wheel,
- keep `+shouldBeRecycled` returning `NO` on iOS.

Test changes in the example app's "In a modal" section: open the wheel, flick it, tap it while it is still moving, close it, and repeat many times.

### Publishing a release

Releases are published from GitHub. Bump `version` in `package.json`, add the changes to `CHANGELOG.md`, merge to `main`, then create a GitHub release with a tag like `v0.2.0`. The release workflow builds the package and publishes it to npm with provenance. It needs an `NPM_TOKEN` secret with publish rights on the `@apolloscooters` scope.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
