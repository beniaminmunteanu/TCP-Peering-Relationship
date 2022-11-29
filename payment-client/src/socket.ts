import net, { NetConnectOpts, Socket } from 'net';
import { EventEmitter } from 'events';

export class CustomSocket {
    private socket: Socket;

    public registerMessageEmitter(message: string): EventEmitter {
        const eventEmitter = new EventEmitter();

        this.socket.on('data', (data) => {
            const stringData = data.toString();
            if (stringData.search(message) !== -1) {
                eventEmitter.emit(message, data.toString());
            }
        });
        return eventEmitter;
    }

    public write(message: string, onSuccess: () => void, onError: () => void) {
        this.socket.write(message, (err) => {
            if (err) {
                onError();
            } else {
                onSuccess();
            }
        });
    }

    constructor(connectionOptions: NetConnectOpts) {
        this.socket = net.connect(connectionOptions);
        this.socket.on('connect', () => {
            console.log('CONNECTED');
        });
    }
}
