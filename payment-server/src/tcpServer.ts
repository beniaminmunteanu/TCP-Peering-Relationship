import net, { Server, Socket } from 'net';
import { CustomSocket } from './client';

export class TcpServer {
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
}
