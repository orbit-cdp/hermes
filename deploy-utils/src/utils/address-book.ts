import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AddressBook {
  private contracts: Map<string, string>;
    private tokens: Map<string, string>;
  private hashes: Map<string, string>;
  private fileName: string;

  constructor(ids: Map<string, string>, tokens: Map<string, string>, hashes: Map<string, string>, fileName: string) {
    this.contracts = ids;
    this.tokens = tokens;
    this.hashes = hashes;
    this.fileName = fileName;
  }

  /**
   * Load the address book from a file or create a blank one
   *
   * @param name - The name of the file to load the contracts for
   * @returns Contracts object loaded based on the network
   */
  static loadFromFile(name: string) {
    const fileName = `../../${name}.contracts.json`;
    try {
      console.log("reading file")
      const contractFile = readFileSync(path.join(__dirname, fileName));
      const contractObj = JSON.parse(contractFile.toString());
      return new AddressBook(
        new Map(Object.entries(contractObj.ids)),
        new Map(Object.entries(contractObj.tokens)),
        new Map(Object.entries(contractObj.hashes)),
        fileName
      );
    } catch {
      // unable to load file, it likely doesn't exist
      const token_map = new Map();
      token_map.set('XLM', 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');
      return new AddressBook(new Map(), token_map, new Map(), fileName);
    }
  }

  /**
   * Write the current address book to a file
   */
  writeToFile() {
    const newFile = JSON.stringify(
      this,
      (key, value) => {
        if (value instanceof Map) {
          return Object.fromEntries(value);
        } else if (key != 'fileName') {
          return value;
        }
      },
      2
    );
    writeFileSync(path.join(__dirname, this.fileName), newFile);
  }

  /**
   * Get the hex encoded contractId for a given contractKey
   * @param contractKey - The name of the contract
   * @returns Hex encoded contractId
   */
  getContractId(contractKey: string) {
    const contractId = this.contracts.get(contractKey);

    if (contractId != undefined) {
      return contractId;
    } else {
      console.error(`unable to find address for ${contractKey} in ${this.fileName}`);
      throw Error();
    }
  }

  /**
   * Set the hex encoded contractId for a given contractKey
   * @param contractKey - The name of the contract
   * @param contractId Hex encoded contractId
   */
  setContractId(contractKey: string, contractId: string) {
    this.contracts.set(contractKey, contractId);
  }

      /**
     * Get the hex encoded token for a given tokenKey
     * @param tokenKey - The name of the token
     * @returns Hex encoded token
     */
      getToken(tokenKey: string) {
        const token = this.tokens.get(tokenKey);

        if (token != undefined) {
            return token;
        } else {
            console.error(`unable to find token for ${tokenKey} in ${this.fileName}`);
            throw Error();
        }
    }

    /**
     * Set the hex encoded token for a given tokenKey
     * @param tokenKey - The name of the token
     * @param token - Hex encoded token
     */
    setToken(tokenKey: string, token: string) {
        this.tokens.set(tokenKey, token);
    }

  /**
   * Get the hex encoded wasmHash for a given contractKey
   * @param contractKey - The name of the contract
   * @returns Hex encoded wasmHash
   */
  getWasmHash(contractKey: string) {
    const washHash = this.hashes.get(contractKey);

    if (washHash != undefined) {
      return washHash;
    } else {
      console.error(`unable to find hash for ${contractKey} in ${this.fileName}`);
      throw Error();
    }
  }

  /**
   * Set the hex encoded wasmHash for a given contractKey
   * @param contractKey - The name of the contract
   * @param wasmHash - Hex encoded wasmHash
   */
  setWasmHash(contractKey: string, wasmHash: string) {
    this.hashes.set(contractKey, wasmHash);
  }
}

const network = process.argv[2];
if (network == undefined || network == '') {
  throw new Error('Error: Network argument required');
}
 
export const addressBook = AddressBook.loadFromFile(network);