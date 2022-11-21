import chalk from 'chalk';
import dotenv from 'dotenv';
import net from 'net';
import inquirer from 'inquirer';
import { createSpinner, Spinner } from 'nanospinner';
dotenv.config();

enum PromptOptions {
    balance = 'see my balance',
    pay = 'pay',
}

const bottomBar = new inquirer.ui.BottomBar();

let balance = 0;
let spinner: Spinner | null = null;

const socket = net.connect({ port: 3000, host: '127.0.0.1' });

socket.on('connect', () => {
    console.log(chalk.greenBright('connected to server'));
});

socket.on('data', async (data) => {
    const stringData = data.toString();
    if (stringData.search('Please wait') !== -1) {
        spinner = createSpinner(stringData, { color: 'red' });
        spinner.start();
        return;
    } else if (stringData.search('Peering relationship established') !== -1) {
        balance = 0;
        if (spinner) {
            spinner.success();
        }
        console.log(chalk.yellowBright(stringData));
        await handleOptionInput(await askForOptions());
    } else if (stringData.search('PAY') !== -1) {
        const amount = Number(stringData.split('{{')[1].split('}}')[0]);
        bottomBar.log.write(chalk.greenBright(`You received ${amount}`));
        balance += amount;
    }
});

const seeBalance = async () => {
    bottomBar.log.write(chalk.yellowBright(`Current balance is : ${balance}`));
};

const askAmount = async () => {
    const promptOptions = await inquirer.prompt({ name: 'amount', type: 'input', message: 'How much would you like to send?' });
    return promptOptions.amount;
};

const askForOptions = async () => {
    const promptOptions = await inquirer.prompt({ name: 'option', type: 'list', choices: [PromptOptions.balance, PromptOptions.pay], message: 'What do you want to do?' });
    return promptOptions.option;
};

const handleOptionInput = async (option: PromptOptions) => {
    if (option === PromptOptions.balance) {
        seeBalance();
        await handleOptionInput(await askForOptions());
    } else if (option === PromptOptions.pay) {
        const amount = await askAmount();
        socket.write(`PAY{{${amount}}}`, () => {
            bottomBar.log.write(chalk.greenBright('Successfully sent 50'));
        });
        balance -= amount;

        handleOptionInput(await askForOptions());
    }
};
