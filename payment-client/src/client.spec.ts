import { CustomSocket } from './socket';
import { Cli } from './cli';
import { Client } from './client';
import { PromptOptions } from './models/PromptOptions.enum';
import EventEmitter from 'events';
import net from 'net';

jest.mock('net');

const emitter = new EventEmitter();
(net.connect as jest.Mock).mockReturnValue(emitter);
const mockSocket = new CustomSocket({ port: 3000, host: '127.0.0.1' });

const mockCli = { askAmount: jest.fn(), askForOptions: jest.fn(), info: jest.fn(), showBalance: jest.fn(), startSpinner: jest.fn(), stopSpinner: jest.fn() } as unknown as Cli;

describe('Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('on Pending message received', () => {
        it('should inform the client that he should wait for another client to connect', async () => {
            const client = new Client(mockSocket, mockCli);
            const spinnerSpy = jest.spyOn(mockCli, 'startSpinner');
            emitter.emit('data', 'Please wait for another client to connect...');
            expect(spinnerSpy).toHaveBeenCalledWith('Please wait for another client to connect...', { color: 'red' });
            expect(client.balance).toBe(0);
        });
    });

    describe('on connection established message received', () => {
        it('should reset the balance to 0', async () => {
            const client = new Client(mockSocket, mockCli);

            emitter.emit('data', 'PAY {{50}}');
            expect(client.balance).toBe(50);

            emitter.emit('data', 'Peering relationship established');
            expect(client.balance).toBe(0);
        });

        it('should stop the spinner ', async () => {
            new Client(mockSocket, mockCli);
            const stopSpinnerSpy = jest.spyOn(mockCli, 'stopSpinner');
            emitter.emit('data', 'Peering relationship established');
            expect(stopSpinnerSpy).toHaveBeenCalled();
        });

        it('should display the message received', async () => {
            new Client(mockSocket, mockCli);
            const cliSpy = jest.spyOn(mockCli, 'info');
            emitter.emit('data', 'Peering relationship established');
            expect(cliSpy).toHaveBeenCalledWith('Peering relationship established', 'yellow');
        });

        it('should prompt for options in the cli', async () => {
            new Client(mockSocket, mockCli);
            const cliSpy = jest.spyOn(mockCli, 'askForOptions');
            emitter.emit('data', 'Peering relationship established');
            expect(cliSpy).toHaveBeenCalled();
        });
    });

    describe('on pay message received', () => {
        it('should determine the received amount and increase the balance accoringly', () => {
            const client = new Client(mockSocket, mockCli);
            emitter.emit('data', 'PAY {{50}}');
            expect(client.balance).toBe(50);
        });
        it('should determine the received amount and display it', () => {
            new Client(mockSocket, mockCli);
            const cliSpy = jest.spyOn(mockCli, 'info');
            emitter.emit('data', 'PAY {{50}}');
            expect(cliSpy).toHaveBeenCalledWith('You received 50', 'green');
        });
        it('should throw an Error if unable to determine the received amount (corrput input)', () => {
            expect(() => {
                new Client(mockSocket, mockCli);
                emitter.emit('data', 'PAY 50');
            }).toThrow(new Error('Unable to determine the amount received'));
        });
    });

    describe('on client cli input', () => {
        describe('selected option is Show Balance', () => {
            it('should display the balance in the cli', async () => {
                jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.balance));
                const balanceSpy = jest.spyOn(mockCli, 'showBalance');
                new Client(mockSocket, mockCli);
                emitter.emit('data', 'Peering relationship established');
                expect(await balanceSpy).toHaveBeenCalled();
            });
            it('should prompt for options again', async () => {
                const emitter = new EventEmitter();
                (net.connect as jest.Mock).mockReturnValue(emitter);
                const mockSocket = new CustomSocket({ port: 3000, host: '127.0.0.1' });

                const optionsSpy = jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.balance));
                new Client(mockSocket, mockCli);
                emitter.emit('data', 'Peering relationship established');
                expect(await optionsSpy).toHaveBeenCalledTimes(2);
            });
        });

        describe('selected option is Pay', () => {
            it('should prompt for amount and send the given amount, and then ask for options again', async () => {
                const emitter = new EventEmitter();
                (emitter as any).write = jest.fn();
                (net.connect as jest.Mock).mockReturnValue(emitter);
                const mockSocket = new CustomSocket({ port: 3000, host: '127.0.0.1' });

                jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.pay));
                const askAmountSpy = jest.spyOn(mockCli, 'askAmount').mockImplementation(() => Promise.resolve(20));
                const sendSpy = jest.spyOn(mockSocket, 'write');
                const optionsSpy = jest.spyOn(mockCli, 'askForOptions').mockImplementationOnce(() => Promise.resolve(PromptOptions.pay));

                new Client(mockSocket, mockCli);

                emitter.emit('data', 'Peering relationship established');
                expect(await optionsSpy).toHaveBeenCalledTimes(1);
                expect(await askAmountSpy).toHaveBeenCalled();
                expect(await sendSpy).toHaveBeenCalledWith(`PAY{{20}}`, expect.any(Function), expect.any(Function));
            });
        });
    });
});
