import chalk from 'chalk';
import inquirer from 'inquirer';
import { createSpinner, Spinner, Options } from 'nanospinner';
import { PromptOptions } from './models/PromptOptions.enum';
export class Cli {
    bottomBar = new inquirer.ui.BottomBar();
    spinner: Spinner | undefined;

    info(message: string, color: 'green' | 'yellow') {
        switch (color) {
            case 'green':
                this.bottomBar.log.write(chalk.greenBright(message));
                break;
            case 'yellow':
                this.bottomBar.log.write(chalk.yellowBright(message));
                break;
            default:
                this.bottomBar.log.write(chalk.cyanBright(message));
        }
    }

    startSpinner(message: string, options?: Options) {
        this.spinner = createSpinner(message, options);
        this.spinner.start();
    }

    stopSpinner() {
        this.spinner && this.spinner.success();
    }

    async showBalance(balance: number) {
        this.info(`Current balance is : ${balance}`, 'yellow');
    }

    async askAmount() {
        const promptOptions = await inquirer.prompt({ name: 'amount', type: 'input', message: 'How much would you like to send?' });
        return promptOptions.amount;
    }

    async askForOptions() {
        const promptOptions = await inquirer.prompt({ name: 'option', type: 'list', choices: [PromptOptions.balance, PromptOptions.pay], message: 'What do you want to do?' });
        return promptOptions.option;
    }
}
