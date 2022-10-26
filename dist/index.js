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
const usernames = [];
const players = [];
let grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
];
const turn = 1;
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
    }
    else {
        socket.on("message", (payload) => {
            const json = JSON.parse(payload.toString());
            if ("connect" in json && "username" in json && checkIfConnected(json, socket)) {
                // do nothing
                return;
            }
            else {
                connect(json, socket);
            }
        });
    }
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
