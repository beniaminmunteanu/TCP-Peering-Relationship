import dotenv from 'dotenv';
import { Cli } from './cli';
import { Client } from './client';
import { CustomSocket } from './socket';
dotenv.config();

const cli = new Cli();
const socket = new CustomSocket({ port: +process.env.PORT!, host: process.env.HOST });
new Client(socket, cli);
