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
const players: any[] = [];
let grid: number[][] = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
const turn: number = 1;

const connect = (json: any, _socket: any) => {
  if (usernames.includes(json.username)) return;
  usernames.push(json.username);
  connectedUsers++;
  players.push({
    id: connectedUsers,
    name: json.username,
  });
  wsServer.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        players,
        grid,
        turn,
      })
    );
  });
};

const checkIfConnected = (json: any, _socket: any) => {
  if (usernames.includes(json.username)) return true;
  return false;
};

wsServer.on("connection", (socket) => {

  // DO THIS IF CONNECTED USERS IS 2
  if (connectedUsers === 2) {
    socket.on("message", (payload) => {
      const json = JSON.parse(payload.toString());
      if ("username" in json && checkIfConnected(json, socket)) {
        // do nothing
        return;
      }
      if ("move" in json && "grid" in json) {
        grid = json.grid;
        wsServer.clients.forEach((client) => {
          client.send(JSON.stringify({
            grid,
          }));
        });
        return;
      }
      socket.close();
      return;
    });
  } else {
    socket.on("message", (payload) => {
      const json = JSON.parse(payload.toString());
      if ("connect" in json && "username" in json && checkIfConnected(json, socket)) {
        // do nothing
        return;
      } else {
        connect(json, socket);
      }
    });
  }

  socket.send(
    JSON.stringify({
      players,
      grid,
      turn,
    })
  );
});

const server = app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});
