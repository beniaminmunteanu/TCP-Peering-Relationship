import { CustomSocket } from './client';
import { ConnectionService } from './connectionService';

// const mockSocket = { on: jest.fn(), write: jest.fn() } as unknown as Socket;
const mockedCustomSockets = [{ id: 1, write: jest.fn(), on: jest.fn() } as unknown as CustomSocket, { id: 2, write: jest.fn(), on: jest.fn() } as unknown as CustomSocket];

const connectionService = new ConnectionService();
describe('ConnectionService', () => {
    describe('on enqueue', () => {
        it('should notify the enqueued client that he is in a pending state', () => {
            const socketWriteSpy = jest.spyOn(mockedCustomSockets[0], 'write');
            connectionService.enqueueClient({ socket: mockedCustomSockets[0], pairedWith: undefined });
            expect(socketWriteSpy).toHaveBeenCalled();
        });
    });

    describe('establish connection between two clients', () => {
        it('should pipe data received by a client to the other one and vice versa', () => {
            const socket1OnSpy = jest.spyOn(mockedCustomSockets[0], 'on');
            const socket1WriteSpy = jest.spyOn(mockedCustomSockets[0], 'write');

            const socket2OnSpy = jest.spyOn(mockedCustomSockets[1], 'on');
            const socket2WriteSpy = jest.spyOn(mockedCustomSockets[1], 'write');

            connectionService.establish(mockedCustomSockets[0], mockedCustomSockets[1]);
            expect(socket1OnSpy).toHaveBeenCalled();
            expect(socket1WriteSpy).toHaveBeenCalled();
            expect(socket2OnSpy).toHaveBeenCalled();
            expect(socket2WriteSpy).toHaveBeenCalled();
        });
    });
});
