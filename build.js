#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { pascalCase } = require("pascal-case");
const babel = require("@babel/core");

const PATH = path.resolve("node_modules/@tabler/icons/icons");

const componentTemplate = (name, svg) =>
  `
import Nullstack from 'nullstack';

export default function ${name}({ size = 24, color = "currentColor", stroke = 2 }) {
  const allProps = {
    width: size,
    height: size,
    "stroke-width": stroke,
    stroke: color,
  };

  return ${svg
    .replace(/<svg([^>]+)>/, "<svg$1 {...allProps}>")
    .replace("icon ", "inline-flex icon ")};
}
`.trim();

const typingTemplate = `
import { NullstackFunctionalComponent } from 'nullstack';

export type TablerIconProps = {
  size?: number | string;
  color?: string;
  stroke?: number;
}

export type TablerIconComponent = NullstackFunctionalComponent<TablerIconProps>;
`.trim();

const aliases = {
  "2fa.svg": "two-factor-auth.svg",
  "3d-cube-sphere.svg": "threed-cube-sphere.svg",
  "3d-cube-sphere-off.svg": "threed-cube-sphere-off.svg",
  "3d-rotate.svg": "threed-rotate.svg",
  "123.svg": "onetwotree.svg",
  "360-view.svg": "deg360-view.svg",
  "24-hours.svg": "twenty-four-hours.svg",
};

fs.readdir(PATH, (err, items) => {
  let index = [];
  let typings = [];
  items
    .filter((name) => name.endsWith(".svg"))
    .forEach((name, pos) => {
      process.stdout.write(
        `Building ${pos}/${items.length}: ` + name.padEnd(42) + "\r"
      );

      let content = fs
        .readFileSync(`${PATH}/${name}`, "utf-8")
        .replace(/\n/gm, " ");

      // make name
      if (name in aliases) name = aliases[name];
      let nameCamel =
        "Icon" + pascalCase(name.replace(".svg", "")).replace(/_(\d)/g, "$1");

      // create and transform component
      let component = componentTemplate(nameCamel, content);
      const compiled = babel.transform(component, {
        plugins: [
          [
            "@babel/plugin-transform-react-jsx",
            {
              runtime: "classic",
              pragma: "Nullstack.element",
              pragmaFrag: "Nullstack.fragment",
              useSpread: true,
            },
          ],
        ],
      }).code;

      // write icon component
      let filePath = path.resolve(`icons/${nameCamel}.jsx`);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, compiled, "utf-8");

      index.push(`export { default as ${nameCamel} } from './${nameCamel}';`);
      typings.push(`export const ${nameCamel}: TablerIconComponent;`);
    });

  index.push("");
  typings.push("");

  fs.writeFileSync("./icons/index.js", index.join("\n"), "utf-8");
  fs.writeFileSync(
    "./index.d.ts",
    typingTemplate + "\n\n" + typings.join("\n"),
    "utf-8"
  );
});
