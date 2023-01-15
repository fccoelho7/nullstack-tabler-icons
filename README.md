# Nullstack Tabler Icons

![https://raw.githubusercontent.com/tabler/tabler-icons/master/.github/og.png](https://raw.githubusercontent.com/tabler/tabler-icons/master/.github/og.png)

## Description

This package allows you to use the [Tabler Icons](https://tabler-icons.io/) in your Nullstack applications. Tabler Icons is a set of free MIT-licensed high-quality SVG icons for you to use in your web projects. Each icon is designed on a 24x24 grid and a 2px stroke.

## Usage

1. Install the package

```sh
npm install nullstack-tabler-icons
# or
yarn add nullstack-tabler-icons
```

2. Import and use it

```jsx
import { IconBrandTwitter } from "nullstack-tabler-icons";

export default function MyApp() {
  return (
    <IconBrandTwitter
      size={36} // set custom `width` and `height`
      color="red" // set `stroke` color
      stroke={3} // set `stroke-width`
    />
  );
}
```

## Available icons

List of available icons: https://tabler-icons.io/

This version includes **Tabler Icons v1.119.0**, see [changelog](https://tabler-icons.io/changelog) to know which icons are available.
