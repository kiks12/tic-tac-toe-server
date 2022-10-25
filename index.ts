import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import ws from "ws";

dotenv.config();

const PORT = process.env.PORT ?? 4000;
const app: Express = express();
const wsServer = new ws.Server({ noServer: true });

app.use(cors());

let connectedUsers = 0;
const usernames: string[] = [];

const connect = (json: any, socket: any) => {
  if (usernames.includes(json.username)) return;
  usernames.push(json.username);
  connectedUsers++;
  socket.send(JSON.stringify({
    id: connectedUsers,
  }));
}

const checkIfConnected = (json: any, _socket: any) => {
  if (usernames.includes(json.username)) return;
}

wsServer.on("connection", (socket) => {
  
  if (connectedUsers === 2) {
    socket.close();
    return;
  }

  socket.on("message", (payload) => {
    const json = JSON.parse(payload.toString());
    if ('username' in json) checkIfConnected(json, socket);
    if ('connect' in json) connect(json, socket);
  });
});



const server = app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
