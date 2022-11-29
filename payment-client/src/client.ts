import { Cli } from './cli';
import { PromptOptions } from './models/PromptOptions.enum';
import { CustomSocket } from './socket';

export class Client {
    public balance = 0;
    onPending(message: string) {
        this.cli.startSpinner(message, { color: 'red' });
    }

    async onPeeringRelationshipEstablished(message: string) {
        this.balance = 0;
        this.cli.stopSpinner();
        this.cli.info(message, 'yellow');
        await this.handleOptionInput(await this.cli.askForOptions());
    }

    onPayReceived(message: string) {
        try {
            const amount = Number(message.split('{{')[1].split('}}')[0]);
            this.cli.info(`You received ${amount}`, 'green');
            this.balance += amount;
        } catch (e) {
            throw new Error('Unable to determine the amount received');
        }
    }

    private async handleOptionInput(option: PromptOptions) {
        if (option === PromptOptions.balance) {
            this.cli.showBalance(this.balance);
            await this.handleOptionInput(await this.cli.askForOptions());
        } else if (option === PromptOptions.pay) {
            const amount = await this.cli.askAmount();
            this.send(amount);

            this.handleOptionInput(await this.cli.askForOptions());
        }
    }

    private send(amount: number) {
        this.socket.write(
            `PAY{{${amount}}}`,
            () => {
                this.balance -= amount;
                this.cli.info(`Successfully sent ${amount}`, 'green');
            },
            () => {
                this.cli.info(`Unable to send money`, 'yellow');
            }
        );
    }

    constructor(private socket: CustomSocket, private cli: Cli) {}
}
