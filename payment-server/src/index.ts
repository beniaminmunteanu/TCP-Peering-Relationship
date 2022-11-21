import dotenv from 'dotenv';
import { ClientService } from './clientService';
import { ConnectionService } from './connectionService';
import { PaymentServer } from './paymentServer';
dotenv.config();

const clientService = new ClientService();
const connectionService = new ConnectionService();

const paymentServer = new PaymentServer(clientService, connectionService);

paymentServer.start(process.env.PORT!);
