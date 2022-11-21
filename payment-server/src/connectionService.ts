import { Client, CustomSocket } from './client';
import net, { Server, Socket } from 'net';

export class ConnectionService {
    private _server?: Server;
    private _socketCounter = 0;

    public createServer(newConnectionHandler: (customSocket: CustomSocket) => void, handleDisconnect: (id: number) => () => void) {
        this._server = net.createServer((socket: Socket) => {
            this._socketCounter++;
            const customSocket = socket as CustomSocket;
            customSocket.id = this._socketCounter;
            customSocket.on('close', handleDisconnect(customSocket.id));
            newConnectionHandler(customSocket);
        });
        return this._server;
    }

    private connectionQueue: Client[] = [];

    public enqueueClient(client: Client) {
        this.connectionQueue.push(client);
        client.socket.write(`Please wait for another user...\n`);
    }

    public dequeueClient() {
        return this.connectionQueue.pop();
    }

    private bindSockets(socket1: CustomSocket, socket2: CustomSocket) {
        socket1.on('data', (data) => {
            socket2.write(data);
        });

        socket2.on('data', (data) => {
            socket1.write(data);
        });
    }

    canCreatePeerRelationship() {
        return this.connectionQueue.length === 1;
    }

    establish(socket1: CustomSocket, socket2: CustomSocket) {
        this.bindSockets(socket1, socket2);
        socket1.write('Peering relationship established');
        socket2.write('Peering relationship established');
    }
}
