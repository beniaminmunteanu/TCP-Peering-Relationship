import net, { NetConnectOpts, Socket } from 'net';

export class CustomSocket {
    private socket: Socket;

    public callbackByData(message: string, cb: (data: string) => void) {
        this.socket.on('data', (data: Buffer) => {
            const stringData = data.toString();
            stringData.search(message) !== -1 && cb(stringData);
        });
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
