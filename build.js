#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const converter = require("number-to-words");
const { pascalCase } = require("pascal-case");
const babel = require("@babel/core");

const PATH = path.resolve("node_modules/@tabler/icons/icons");

function formatIconName(name) {
  name = name.replace(/\d+/g, (match) => converter.toWords(match)); // convert numbers to words
  name = pascalCase(name.replace(".svg", ""));
  return name + "Icon";
}

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
      const nameCamel = formatIconName(name);

      // create and transform component
      const component = componentTemplate(nameCamel, content);
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
      const filePath = path.resolve(`icons/${nameCamel}.jsx`);
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
