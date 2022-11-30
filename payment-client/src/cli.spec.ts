import chalk from 'chalk';
import { Cli } from './cli';
import inquirer from 'inquirer';

import nanospinner from 'nanospinner';
import { PromptOptions } from './models/PromptOptions.enum';

jest.mock('nanospinner');

describe('Cli', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('info', () => {
        it('should write messages to the bottomBar', () => {
            const cli = new Cli();
            const writeSpy = jest.spyOn(cli.bottomBar.log, 'write').mockImplementation(() => true);

            cli.info('test');
            expect(writeSpy).toHaveBeenCalled();
        });

        it('should write with different colors', () => {
            const cli = new Cli();
            const writeSpy = jest.spyOn(cli.bottomBar.log, 'write').mockImplementation(() => true);
            cli.info('test', 'yellow');
            expect(writeSpy).toHaveBeenCalledWith(chalk.yellowBright('test'));
            cli.info('test', 'green');
            expect(writeSpy).toHaveBeenCalledWith(chalk.greenBright('test'));
        });
    });

    describe('Spinner', () => {
        it('should create a spinner with given message and then start it', () => {
            const spinnerMock = { start: jest.fn() };
            (nanospinner.createSpinner as jest.Mock).mockReturnValue(spinnerMock);
            const createSpinnerSpy = jest.spyOn(nanospinner, 'createSpinner');

            const startSpy = jest.spyOn(spinnerMock, 'start');

            const cli = new Cli();
            cli.startSpinner('test');
            expect(createSpinnerSpy).toHaveBeenCalledWith('test', undefined);
            expect(startSpy).toHaveBeenCalled();
        });

        it('should stop the spinner', () => {
            const spinnerMock = { success: jest.fn(), start: jest.fn() };
            (nanospinner.createSpinner as jest.Mock).mockReturnValue(spinnerMock);

            const stopSpy = jest.spyOn(spinnerMock, 'success');

            const cli = new Cli();
            cli.startSpinner('test', undefined);

            cli.stopSpinner();

            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('Balance', () => {
        it('should display the given balance in the bottomBar', () => {
            const cli = new Cli();
            jest.spyOn(cli, 'info').mockImplementation(() => true);
            cli.showBalance(50);
            expect(cli.info).toHaveBeenCalledWith('Current balance is : 50', 'yellow');
        });
    });

    describe('User interaction', () => {
        it('should prompt the user for amount', async () => {
            const promptSpy = jest.spyOn(inquirer, 'prompt').mockImplementation(() =>
                Promise.resolve({
                    amount: 3,
                })
            );

            const cli = new Cli();

            const amount = await cli.askAmount();
            expect(promptSpy).toHaveBeenCalled();
            expect(amount).toBe(3);
        });

        it('should prompt the user for option selection', async () => {
            const promptSpy = jest.spyOn(inquirer, 'prompt').mockImplementation(() =>
                Promise.resolve({
                    option: PromptOptions.balance,
                })
            );

            const cli = new Cli();

            const amount = await cli.askForOptions();
            expect(promptSpy).toHaveBeenCalled();
            expect(amount).toBe(PromptOptions.balance);
        });
    });
});
