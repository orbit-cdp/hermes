import { Asset, Contract, Operation, nativeToScVal } from '@stellar/stellar-sdk';

export class TokenContract extends Contract {
  private stellarAsset?: Asset;
  constructor(address: string, asset?: Asset) {
    super(address);
    this.stellarAsset = asset;
  }

  get asset(): Asset {
    if (!this.stellarAsset) throw new Error('Asset not set');
    return this.stellarAsset;
  }
  public classic_trustline(user: string) {
    if (!this.asset) throw new Error('Asset not set');
    const operation = Operation.changeTrust({
      source: user,
      asset: this.asset,
    });
    return operation.toXDR('base64');
  }

  public classic_mint(user: string, amount: string) {
    if (!this.asset) throw new Error('Asset not set');
    const operation = Operation.payment({
      amount: amount,
      asset: this.asset,
      destination: user,
      source: this.asset.issuer,
    });
    return operation.toXDR('base64');
  }

  public initialize(admin: string, decimal: number, name: string, symbol: string) {
    const invokeArgs = {
      method: 'initialize',
      args: [
        nativeToScVal(admin, { type: 'address' }),
        nativeToScVal(decimal, { type: 'u32' }),
        nativeToScVal(name, { type: 'string' }),
        nativeToScVal(symbol, { type: 'string' }),
      ],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);
    return operation.toXDR('base64');
  }

  public mint(to: string, amount: bigint) {
    const invokeArgs = {
      method: 'mint',
      args: [nativeToScVal(to, { type: 'address' }), nativeToScVal(amount, { type: 'i128' })],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);

    return operation.toXDR('base64');
  }

  public set_admin(new_admin: string) {
    const invokeArgs = {
      method: 'set_admin',
      args: [nativeToScVal(new_admin, { type: 'address' })],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);

    return operation.toXDR('base64');
  }

  public admin() {
    const invokeArgs = {
      method: 'admin',
      args: [],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);

    return operation.toXDR('base64');
  }

  public approve(from: string, spender: string, amount: bigint, expiration_ledger: number) {
    const invokeArgs = {
      method: 'approve',
      args: [
        nativeToScVal(from, { type: 'address' }),
        nativeToScVal(spender, { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' }),
        nativeToScVal(expiration_ledger, { type: 'u32' }),
      ],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);

    return operation.toXDR('base64');
  }

  public transfer(from: string, to: string, amount: bigint) {
    const invokeArgs = {
      method: 'transfer',
      args: [
        nativeToScVal(from, { type: 'address' }),
        nativeToScVal(to, { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' }),
      ],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);

    return operation.toXDR('base64');
  }

  public transfer_from(spender: string, from: string, to: string, amount: bigint) {
    const invokeArgs = {
      method: 'transfer_from',
      args: [
        nativeToScVal(spender, { type: 'address' }),
        nativeToScVal(from, { type: 'address' }),
        nativeToScVal(to, { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' }),
      ],
    };
    const operation = this.call(invokeArgs.method, ...invokeArgs.args);

    return operation.toXDR('base64');
  }
}