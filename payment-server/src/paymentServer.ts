import { Server } from 'net';
import { Client, CustomSocket } from './client';
import { ClientService } from './clientService';
import { ConnectionService } from './connectionService';

export class PaymentServer {
    public server: Server;

    disconnectHandler(clientId: number) {
        return () => {
            if (!clientId) {
                return;
            }
            this.removeClient(clientId);
        };
    }

    newConnectionHandler(socket: CustomSocket) {
        if (!this.connectionService.canCreatePeerRelationship()) {
            this.connectionService.enqueueClient(new Client(socket, undefined));
            return;
        }

        const pendingClient = this.connectionService.dequeueClient();
        if (!pendingClient) {
            return;
        }

        const newClient = { socket: socket, pairedWith: pendingClient.socket.id };

        this.clientService.setClient(socket.id, newClient);
        this.clientService.setClient(pendingClient.socket.id, { ...pendingClient, pairedWith: newClient.socket.id });

        this.connectionService.establish(newClient.socket, pendingClient.socket);
    }

    private removeClient(index: number) {
        this.clientService.deleteClient(index);

        if (this.connectionService.canCreatePeerRelationship()) {
            this.connectionService.dequeueClient();
        }

        const pairedClientKey = this.clientService.findPairedClientId(index);
        if (!pairedClientKey) {
            return;
        }

        const pairedClient = this.clientService.getClientById(pairedClientKey);
        if (!pairedClient) {
            return;
        }

        this.clientService.deleteClient(pairedClientKey);
        this.connectionService.enqueueClient({ ...pairedClient, pairedWith: undefined });
    }

    start(port: string) {
        this.server.listen(port);
        console.log('Payment Server listening on port: ', process.env.PORT);
    }

    constructor(private clientService: ClientService, private connectionService: ConnectionService) {
        this.server = connectionService.createServer(this.newConnectionHandler.bind(this), this.disconnectHandler.bind(this));
    }
}
