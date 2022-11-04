"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = __importDefault(require("ws"));
dotenv_1.default.config();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
const app = (0, express_1.default)();
const wsServer = new ws_1.default.Server({ noServer: true });
app.use((0, cors_1.default)());
let connectedUsers = 0;
let usernames = [];
let players = [];
let grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
];
let turn = 1;
const connect = (json, _socket) => {
    if (usernames.includes(json.username))
        return;
    usernames.push(json.username);
    connectedUsers++;
    players.push({
        id: connectedUsers,
        name: json.username,
    });
    wsServer.clients.forEach((client) => {
        client.send(JSON.stringify({
            players,
            grid,
            turn,
        }));
    });
};
const checkIfConnected = (json, _socket) => {
    if (usernames.includes(json.username))
        return true;
    return false;
};
wsServer.on("connection", (socket) => {
    socket.on("message", (payload) => {
        const json = JSON.parse(payload.toString());
        // DO THIS IF CONNECTED USERS IS 2
        if (connectedUsers === 2) {
            if ("connect" in json && "username" in json && !checkIfConnected(json, socket)) {
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
                return Object.assign(Object.assign({}, player), { id: idx + 1 });
            });
            connectedUsers--;
            usernames = usernames.filter((name) => name !== json.username);
            if (connectedUsers === 0) {
                grid = [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ];
            }
        }
        if ("move" in json && "grid" in json) {
            grid = json.grid;
            console.log(grid);
            turn = turn === 1 ? 2 : 1;
            wsServer.clients.forEach((client) => {
                client.send(JSON.stringify({
                    grid,
                    turn,
                }));
            });
            return;
        }
    });
    socket.send(JSON.stringify({
        players,
        grid,
        turn,
    }));
});
const server = app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
server.on("upgrade", (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit("connection", socket, request);
    });
});
