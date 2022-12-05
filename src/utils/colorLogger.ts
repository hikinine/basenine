interface Logger {
  color: number;
  message: string;
}

export enum Color {
  "pink" = 35,
  "red" = 31,
  "green" = 32,
  "yellow" = 33,
  "purple" = 34,
  "cyan" = 36,
  "gray" = 37,
}
function generate(color: number, append: string) {
  return `\x1b[${color}m${append}\x1b[0m`;
}

export function GenerateColorByHttpMethod(method: string) {
  if (method === "HTTP") return Color.purple;
  if (method === "DELETE") return Color.red;
  if (method === "POST") return Color.green;
  if (method === "PUT") return Color.yellow;
  if (method === "GET") return Color.cyan;
  return Color.gray;
}

export function logger(props: Logger | Logger[]) {
  const log = props instanceof Array
    ? props
      .map((prop) =>
        prop.message.length > 3 ? generate(prop.color, prop.message) : ""
      )
      .join("")
    : props.message !== "{}"
      ? generate(props.color, props.message)
      : null;

  if (log) {
    // tslint:disable-next-line:no-console
    console.log(log);
  }
}
