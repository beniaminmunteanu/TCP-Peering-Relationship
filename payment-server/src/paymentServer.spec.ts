import { Client, CustomSocket } from './client';
import { PaymentServer } from './paymentServer';
import { ClientService } from './clientService';
import { ConnectionService } from './connectionService';

const mockedSockets = [{ id: 1 } as CustomSocket, { id: 2 } as CustomSocket];
const mockPendingClient: Client = { pairedWith: undefined, socket: mockedSockets[0] };
const mockPairedClient: Client = { pairedWith: 2, socket: mockedSockets[0] };
const mockConnectionService = {
    enqueueClient: jest.fn(),
    canCreatePeerRelationship: jest.fn(),
    createServer: jest.fn(),
    dequeueClient: jest.fn(),
    establish: jest.fn(),
} as unknown as ConnectionService;

const mockClientService = {
    setClient: jest.fn(),
    getClient: jest.fn(),
    deleteClient: jest.fn(),
    findPairedClientId: jest.fn(),
    getClientById: jest.fn(),
} as unknown as ClientService;

const paymentServer = new PaymentServer(mockClientService, mockConnectionService);

describe('PaymentServer', () => {
    describe('on new tcp connection established', () => {
        it('If no other Client is pending a peering relationship, create a new Client for the received connection and enqueue', () => {
            jest.spyOn(mockConnectionService, 'canCreatePeerRelationship').mockImplementation(() => false);
            const enqueueSpy = jest.spyOn(mockConnectionService, 'enqueueClient');
            expect(paymentServer.newConnectionHandler(mockedSockets[0])).toReturn;
            expect(enqueueSpy).toHaveBeenCalledWith(new Client(mockedSockets[0], undefined));
        });

        it('If there is a pending client, establish the connection between the two', () => {
            jest.spyOn(mockConnectionService, 'canCreatePeerRelationship').mockImplementation(() => true);
            const setClientSpy = jest.spyOn(mockClientService, 'setClient');
            const dequeueSpy = jest.spyOn(mockConnectionService, 'dequeueClient').mockImplementation(() => mockPendingClient);
            const connectionEstablishSpy = jest.spyOn(mockConnectionService, 'establish');

            expect(paymentServer.newConnectionHandler(mockedSockets[1])).toReturn;
            expect(dequeueSpy).toHaveBeenCalled();
            expect(setClientSpy).toHaveBeenCalledTimes(2);
            expect(connectionEstablishSpy).toHaveBeenCalledWith(mockedSockets[1], mockedSockets[0]);
        });
    });

    describe('on socket disconnect ', () => {
        it(`It should remove the client associated to the disconnected socket`, () => {
            const deleteSpy = jest.spyOn(mockClientService, 'deleteClient');
            const handler = paymentServer.disconnectHandler(1);
            handler();
            expect(deleteSpy).toHaveBeenCalledWith(1);
        });

        it(`It should find the paired client, remove and enqueue`, () => {
            const findPairedClientIdSpy = jest.spyOn(mockClientService, 'findPairedClientId').mockImplementation(() => 1);
            const findPairedClientSpy = jest.spyOn(mockClientService, 'getClientById').mockImplementation(() => mockPairedClient);
            const deletePairedClientSpy = jest.spyOn(mockClientService, 'deleteClient');
            const enqueuePairedClientSpy = jest.spyOn(mockConnectionService, 'enqueueClient');
            const handler = paymentServer.disconnectHandler(1);
            handler();
            expect(findPairedClientIdSpy).toHaveBeenCalledWith(1);
            expect(findPairedClientSpy).toHaveBeenCalledWith(1);
            expect(deletePairedClientSpy).toHaveBeenCalledWith(1);
            expect(enqueuePairedClientSpy).toHaveBeenCalledWith(mockPendingClient);
        });
    });
});
