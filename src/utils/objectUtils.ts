import { Euler, Object3D, Vector3 } from "three";
function dumpVec3(v3: Vector3 | Euler, precision = 3) {
  return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(
    precision,
  )}, ${v3.z.toFixed(precision)}`;
}
export function dumpObject(
  obj: Object3D,
  lines: string[] = [],
  isLast = true,
  prefix = "",
) {
  const localPrefix = isLast ? "└─" : "├─";
  lines.push(
    `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
      obj.type
    }]`,
  );
  const dataPrefix = obj.children.length
    ? isLast
      ? "  │ "
      : "│ │ "
    : isLast
    ? "    "
    : "│   ";
  lines.push(`${prefix}${dataPrefix}  pos: ${dumpVec3(obj.position)}`);
  lines.push(`${prefix}${dataPrefix}  rot: ${dumpVec3(obj.rotation)}`);
  lines.push(`${prefix}${dataPrefix}  scl: ${dumpVec3(obj.scale)}`);
  const newPrefix = prefix + (isLast ? "  " : "│ ");
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines.join("\n");
}
