"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTicTacToe = void 0;
const checkTicTacToe = (board) => {
    // check rows
    for (let i = 0; i < board.length; i++) {
        if (board[i][0] !== 0 && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            return board[i][0];
        }
    }
    // check columns
    for (let i = 0; i < board.length; i++) {
        if (board[0][i] !== 0 && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
            return board[0][i];
        }
    }
    // check for diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== 0) {
        return board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== 0) {
        return board[0][2];
    }
    return 0;
};
exports.checkTicTacToe = checkTicTacToe;
