import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT ?? 4000;

app.get("/", cors(), (_req: Request, res: Response) => {
  res.send("hello world");
});


app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
