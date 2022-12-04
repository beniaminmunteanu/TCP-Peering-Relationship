import { Cli } from './cli';
import { PromptOptions } from './models/PromptOptions.enum';
import { SocketMessages } from './models/socketMessages.enum';
import { CustomSocket } from './socket';

export class Client {
    public balance = 0;
    private onPending(message: string) {
        this.cli.startSpinner(message, { color: 'red' });
    }

    registerCallback(onMessage: string, cb: (data: string) => void): void {
        this.socket.callbackByData(onMessage, cb);
    }

    private async onPeeringRelationshipEstablished(message: string) {
        this.balance = 0;
        this.cli.stopSpinner();
        this.cli.info(message, 'yellow');
        const option = await this.cli.askForOptions();
        await this.handleOptionInput(option);
    }

    private onPayReceived(message: string) {
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
            const option = await this.cli.askForOptions();
            await this.handleOptionInput(option);
        } else if (option === PromptOptions.pay) {
            const amount = await this.cli.askAmount();
            this.send(amount);
            const option = await this.cli.askForOptions();
            this.handleOptionInput(option);
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

    constructor(private socket: CustomSocket, private cli: Cli) {
        this.registerCallback(SocketMessages.PENDING, this.onPending.bind(this));
        this.registerCallback(SocketMessages.REL_ESTABLISHED, this.onPeeringRelationshipEstablished.bind(this));
        this.registerCallback(SocketMessages.PAY, this.onPayReceived.bind(this));
    }
}
