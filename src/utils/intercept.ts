import { NextFunction, Request, Response } from "express";
import { Color, GenerateColorByHttpMethod, logger } from "./colorLogger";

export function interceptAndLogger(
  request: Request,
  response: Response,
  next: NextFunction
) {

  const ip = request?.headers?.["x-forwarded-for"] || request?.connection?.remoteAddress;
  process.stdout.write("\u001b[2J\u001b[0;0H");
  // tslint:disable-next-line:no-console
  console.error(" ")
  // tslint:disable-next-line:no-console
  console.log("Request started at " + new Date().toISOString())

  const controllerName = request.route.stack[request.route.stack.length - 1].name

  logger([
    {
      color: Color.purple,
      message: `HTTP Request from ${ip} `
    },
    {
      color: GenerateColorByHttpMethod(request.method),
      message: `${(request.method)} ${request.baseUrl + request.path}`
    },
    {
      color: Color.yellow,
      message: `\nController = ${controllerName}`
    },
    {
      color: Color.gray,
      message: `\n` + JSON.stringify(request.body, null, 2)
    },
    {
      color: Color.gray,
      message: `\n` + JSON.stringify(request.query, null, 2)
    }

  ])
  // tslint:disable-next-line:no-console
  console.log("======================================================================>")

  next();


}