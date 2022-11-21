import { Socket } from 'net';

export class CustomSocket extends Socket {
    id!: number;
    disconnectHandler: ((clientId: number) => void) | undefined = undefined;
}

export class Client {
    constructor(public socket: CustomSocket, public pairedWith: number | undefined) {}
}
