import { CustomSocket } from './socket';
import { Cli } from './cli';
import { Client } from './client';
import { PromptOptions } from './models/PromptOptions.enum';

const mockSocket = { registerMessageEmitter: jest.fn(), write: jest.fn() } as unknown as CustomSocket;
const mockCli = { askAmount: jest.fn(), askForOptions: jest.fn(), info: jest.fn(), showBalance: jest.fn(), startSpinner: jest.fn(), stopSpinner: jest.fn() } as unknown as Cli;

describe('Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('on Pending message received', () => {
        it('should inform the client that he should wait for another client to connect', async () => {
            const client = new Client(mockSocket, mockCli);

            const spinnerSpy = jest.spyOn(mockCli, 'startSpinner');

            client.onPending('Please wait for another client to connect...');
            expect(spinnerSpy).toHaveBeenCalledWith('Please wait for another client to connect...', { color: 'red' });
            expect(client.balance).toBe(0);
        });
    });

    describe('on connection established message received', () => {
        it('should reset the balance to 0', async () => {
            const client = new Client(mockSocket, mockCli);

            client.onPayReceived(`You received {{50}}`);
            expect(client.balance).toBe(50);

            await client.onPeeringRelationshipEstablished('Peering relationship established');
            expect(client.balance).toBe(0);
        });

        it('should stop the spinner ', async () => {
            const client = new Client(mockSocket, mockCli);
            const stopSpinnerSpy = jest.spyOn(mockCli, 'stopSpinner');
            await client.onPeeringRelationshipEstablished('Peering relationship established');
            expect(stopSpinnerSpy).toHaveBeenCalled();
        });

        it('should display the message received', async () => {
            const client = new Client(mockSocket, mockCli);
            const cliSpy = jest.spyOn(mockCli, 'info');
            await client.onPeeringRelationshipEstablished('Peering relationship established');
            expect(cliSpy).toHaveBeenCalledWith('Peering relationship established', 'yellow');
        });

        it('should prompt for options in the cli', async () => {
            const client = new Client(mockSocket, mockCli);
            const cliSpy = jest.spyOn(mockCli, 'askForOptions');
            await client.onPeeringRelationshipEstablished('Peering relationship established');
            expect(cliSpy).toHaveBeenCalled();
        });
    });

    describe('on pay message received', () => {
        it('should determine the received amount and increase the balance accoringly', () => {
            const client = new Client(mockSocket, mockCli);
            client.onPayReceived(`PAY {{50}}`);
            expect(client.balance).toBe(50);
        });
        it('should determine the received amount and display it', () => {
            const client = new Client(mockSocket, mockCli);
            const cliSpy = jest.spyOn(mockCli, 'info');
            client.onPayReceived(`You received {{50}}`);
            expect(cliSpy).toHaveBeenCalledWith('You received 50', 'green');
        });
        it('should throw an Error if unable to determine the received amount (corrput input)', () => {
            const client = new Client(mockSocket, mockCli);
            expect(() => client.onPayReceived(`You received 50`)).toThrow(new Error('Unable to determine the amount received'));
        });
    });

    describe('on client cli input', () => {
        describe('selected option is Show Balance', () => {
            it('should display the balance in the cli', async () => {
                const client = new Client(mockSocket, mockCli);
                jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.balance));
                const balanceSpy = jest.spyOn(mockCli, 'showBalance');
                await client.onPeeringRelationshipEstablished('Peering relationship established');
                expect(balanceSpy).toHaveBeenCalled();
            });
            it('should prompt for options again', async () => {
                const client = new Client(mockSocket, mockCli);
                const optionsSpy = jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.balance));
                await client.onPeeringRelationshipEstablished('Peering relationship established');
                expect(optionsSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe('selected option is Pay', () => {
            it('should prompt for amount and send the given amount', async () => {
                const client = new Client(mockSocket, mockCli);
                jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.pay));
                const askAmountSpy = jest.spyOn(mockCli, 'askAmount').mockImplementation(() => Promise.resolve(20));
                const sendSpy = jest.spyOn(mockSocket, 'write');

                await client.onPeeringRelationshipEstablished('Peering relationship established');
                expect(askAmountSpy).toHaveBeenCalled();

                expect(sendSpy).toHaveBeenCalledWith(`PAY{{20}}`, expect.any(Function), expect.any(Function));
            });

            it('should prompt for options again', async () => {
                const client = new Client(mockSocket, mockCli);
                const optionsSpy = jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.pay));
                await client.onPeeringRelationshipEstablished('Peering relationship established');
                expect(optionsSpy).toHaveBeenCalledTimes(2);
            });
        });
    });
});
