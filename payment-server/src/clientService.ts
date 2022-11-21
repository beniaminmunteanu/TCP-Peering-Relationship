import { Client } from './client';

export class ClientService {
    private _clients: Map<number, Client> = new Map();

    public get nrClients() {
        return this._clients.size;
    }

    public setClient(clientId: number, client: Client) {
        this._clients.set(clientId, client);
    }

    public getClientById(clientId: number): Client | undefined {
        return this._clients.get(clientId);
    }

    public deleteClient(clientId: number): boolean {
        return this._clients.delete(clientId);
    }

    public findPairedClientId = (idx: number) => {
        return this.findClientKeyByCriteria({ param: 'pairedWith', value: idx });
    };

    private findClientKeyByCriteria({ param, value }: { param: any; value: any }) {
        for (const [key, v] of Array.from(this._clients.entries())) {
            if (value === (v as any)[param]) {
                return key;
            }
        }
    }
}
