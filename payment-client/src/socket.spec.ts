import { CustomSocket } from './socket';

import net, { Socket } from 'net';
import { EventEmitter } from 'stream';

jest.mock('net');

describe('Custom socket', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('on init', () => {
        it('should create a connection socket and add a handler to the "connect" event', () => {
            const emitter = new EventEmitter();
            (net.connect as jest.Mock).mockReturnValue(emitter);
            const connectHandlerSpy = jest.spyOn(emitter, 'on');
            new CustomSocket({ port: 3000, host: '127.0.0.1' });
            expect(connectHandlerSpy).toHaveBeenCalledWith('connect', expect.any(Function));
        });

        it('should log the connection established event', () => {
            const emitter = new EventEmitter();
            (net.connect as jest.Mock).mockReturnValue(emitter);
            new CustomSocket({ port: 3000, host: '127.0.0.1' });
            const consoleSpy = jest.spyOn(console, 'log');
            emitter.emit('connect');
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('write', () => {
        it('should write the message received and callback on success', () => {
            const emitter = new Socket();

            (net.connect as jest.Mock).mockReturnValue(emitter);
            const customSocket = new CustomSocket({ port: 3000, host: '127.0.0.1' });
            const successCallback = jest.fn();
            const errorCallBack = jest.fn();
            emitter['write'] = jest.fn().mockImplementation((message, cb: (err?: Error) => void) => {
                cb();
                return true;
            });
            customSocket.write('test', successCallback, errorCallBack);
            expect(emitter.write).toHaveBeenCalledWith('test', expect.any(Function));
            expect(successCallback).toHaveBeenCalled();
        });

        it('should call the error callback if the write was not succesfull', () => {
            const emitter = new Socket();

            (net.connect as jest.Mock).mockReturnValue(emitter);
            const customSocket = new CustomSocket({ port: 3000, host: '127.0.0.1' });
            const successCallback = jest.fn();
            const errorCallBack = jest.fn();
            emitter['write'] = jest.fn().mockImplementation((message, cb: (err: Error) => void) => {
                cb(new Error('eroare'));
                return false;
            });
            customSocket.write('test', successCallback, errorCallBack);
            expect(emitter.write).toHaveBeenCalled();
            expect(errorCallBack).toHaveBeenCalled();
        });
    });

    describe('callback by data', () => {
        it('should add a given callback to a given message received on the data event of the socket', () => {
            const emitter = new EventEmitter();

            (net.connect as jest.Mock).mockReturnValue(emitter);
            const customSocket = new CustomSocket({ port: 3000, host: '127.0.0.1' });
            const callback = jest.fn();

            customSocket.callbackByData('test', callback);

            emitter.emit('data', 'test');

            expect(callback).toHaveBeenCalled();
        });
    });
});
