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
let usernames: string[] = [];
let players: any[] = [];
let grid: number[][] = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
let turn: number = 1;

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
  socket.on("message", (payload) => {
    const json = JSON.parse(payload.toString());

    // DO THIS IF CONNECTED USERS IS 2
    if (connectedUsers === 2) {
      if ("connect" in json && "username" in json && !checkIfConnected(json, socket)) {
        socket.close();
        return;
      }
    }

    if (connectedUsers < 2) {
      if ("connect" in json && "username" in json) {
        connect(json, socket);
      }
    }

    if ("close" in json && "username" in json) {
      socket.close();
      players = players.filter((player) => player.name !== json.username);
      players = players.map((player, idx) => {
        return {
          ...player, 
          id: idx + 1,
        }
      });
      connectedUsers--;
      usernames = usernames.filter((name) => name !== json.username);
    }

    if ("move" in json && "grid" in json) {
      grid = json.grid;
      console.log(grid);
      turn = turn === 1 ? 2 : 1;
      wsServer.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            grid,
            turn,
          })
        );
      });
      return;
    }
  });

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
