import dotenv from 'dotenv';
import { Cli } from './cli';
import { Client } from './client';
import { SocketMessages } from './models/socketMessages.enum';
import { CustomSocket } from './socket';
dotenv.config();

const cli = new Cli();
const socket = new CustomSocket({ port: +process.env.PORT!, host: process.env.HOST });
const client = new Client(socket, cli);

const pendingListener = socket.registerMessageEmitter(SocketMessages.PENDING);
pendingListener.on(SocketMessages.PENDING, (message: string) => {
    client.onPending(message);
});
const establishedListener = socket.registerMessageEmitter(SocketMessages.REL_ESTABLISHED);
establishedListener.on(SocketMessages.REL_ESTABLISHED, (message: string) => {
    client.onPeeringRelationshipEstablished(message);
});

const payListener = socket.registerMessageEmitter(SocketMessages.PAY);
payListener.on(SocketMessages.PAY, (message) => {
    client.onPayReceived(message);
});
