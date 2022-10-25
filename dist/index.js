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
const connect = (json, socket) => {
    if (usernames.includes(json.username))
        return;
    usernames.push(json.username);
    connectedUsers++;
    socket.send(JSON.stringify({
        id: connectedUsers,
    }));
};
const checkIfConnected = (json, _socket) => {
    if (usernames.includes(json.username))
        return;
};
wsServer.on("connection", (socket) => {
    if (connectedUsers === 2) {
        socket.close();
        return;
    }
    socket.on("message", (payload) => {
        const json = JSON.parse(payload.toString());
        if ('username' in json)
            checkIfConnected(json, socket);
        if ('connect' in json)
            connect(json, socket);
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
