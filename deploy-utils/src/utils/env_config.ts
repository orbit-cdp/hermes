import { Keypair, SorobanRpc } from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

class EnvConfig {
  rpc: SorobanRpc.Server;
  passphrase: string;
  friendbot: string;
  admin: Keypair;

  constructor(
    rpc: SorobanRpc.Server,
    passphrase: string,
    friendbot: string,
    admin: Keypair
  ) {
    this.rpc = rpc;
    this.passphrase = passphrase;
    this.friendbot = friendbot;
    this.admin = admin;
  }

  /**
   * Load the environment config from the .env file
   * @returns Environment config
   */
  static loadFromFile(): EnvConfig {
    const rpc_url = process.env.RPC_URL;
    const passphrase = process.env.NETWORK_PASSPHRASE;
    const friendbot_url = process.env.FRIENDBOT_URL;
    const admin = process.env.ADMIN;

    if (
      rpc_url == undefined ||
      passphrase == undefined ||
      friendbot_url == undefined ||
      admin == undefined
    ) {
      throw new Error('Error: .env file is missing required fields');
    }

    return new EnvConfig(
      new SorobanRpc.Server(rpc_url, { allowHttp: true }),
      passphrase,
      friendbot_url,
      Keypair.fromSecret(admin)
    );
  }

  /**
   * Get the Keypair for a user from the env file
   * @param userKey - The name of the user in the env file
   * @returns Keypair for the user
   */
  getUser(userKey: string): Keypair {
    const userSecretKey = process.env[userKey];
    if (userSecretKey != undefined) {
      return Keypair.fromSecret(userSecretKey);
    } else {
      throw new Error(`${userKey} secret key not found in .env`);
    }
  }
}

export const config = EnvConfig.loadFromFile();