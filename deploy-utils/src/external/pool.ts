import { Address, Contract, contract } from "@stellar/stellar-sdk";
import { u32, i128 } from "@stellar/stellar-sdk/contract";

export interface TokenInfo {
    address: string;
    target_ratio: u32;
    total_supply: i128;
  }

  export interface poolInitArgs {
    admin: Address | string;
    oracle: Address | string;
    position_manager: Address | string;
    spl: Address | string;
    token_a: TokenInfo;
    token_b: TokenInfo;
  }

  export interface depositArgs {
    user: Address | string;
    token_a_amount: i128;
    token_b_amount: i128;
  }

  export interface withdrawArgs {
    user: Address | string;
    slp_amount: i128;
  }

  export interface borrowArgs {
    user: Address | string;
    token: Address | string;
    amount: i128;
    fee: i128;
  }

  export interface repayArgs {
    user: Address | string;
    token: Address | string;
    amount: i128;
    fee: i128;
  }

  export class PoolContract extends Contract {
    static spec: contract.Spec = new contract.Spec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAGT3JhY2xlAAAAAAAAAAAAAAAAAA9Qb3NpdGlvbk1hbmFnZXIAAAAAAAAAAAAAAAAIU2xwVG9rZW4AAAAAAAAAAAAAAAlTbHBTdXBwbHkAAAAAAAAAAAAAAAAAAAZUb2tlbkEAAAAAAAAAAAAAAAAABlRva2VuQgAA",
        "AAAAAQAAAAAAAAAAAAAACVRva2VuSW5mbwAAAAAAAAMAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAMdGFyZ2V0X3JhdGlvAAAABAAAAAAAAAAMdG90YWxfc3VwcGx5AAAACw==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAAAAAAEHBvc2l0aW9uX21hbmFnZXIAAAATAAAAAAAAAANzcGwAAAAAEwAAAAAAAAAHdG9rZW5fYQAAAAfQAAAACVRva2VuSW5mbwAAAAAAAAAAAAAHdG9rZW5fYgAAAAfQAAAACVRva2VuSW5mbwAAAAAAAAA=",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAOdG9rZW5fYV9hbW91bnQAAAAAAAsAAAAAAAAADnRva2VuX2JfYW1vdW50AAAAAAALAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAKc2xwX2Ftb3VudAAAAAAACwAAAAEAAAPtAAAAAgAAAAsAAAAL",
        "AAAAAAAAAAAAAAAGYm9ycm93AAAAAAADAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAADZmVlAAAAAAsAAAAA",
        "AAAAAAAAAAAAAAAFcmVwYXkAAAAAAAADAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAADZmVlAAAAAAsAAAAA",
        "AAAAAAAAAAAAAAAKZ2V0X29yYWNsZQAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAAAAAAAAOZ2V0X3NscF9zdXBwbHkAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAAAAAAAAOZ2V0X3Rva2VuX2luZm8AAAAAAAEAAAAAAAAABXRva2VuAAAAAAAAEwAAAAEAAAfQAAAACVRva2VuSW5mbwAAAA==",
        "AAAABAAAAAAAAAAAAAAACVBvb2xFcnJvcgAAAAAAAAoAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAH0AAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAfUAAAAAAAAAEkludmFsaWRUb2tlblN1cHBseQAAAAAB9gAAAAAAAAASSW52YWxpZFRhcmdldFJhdGlvAAAAAAH3AAAAAAAAABpEZXBvc2l0RG9lc05vdEltcHJvdmVSYXRpbwAAAAAB+AAAAAAAAAAVSW5zdWZmaWNpZW50TGlxdWlkaXR5AAAAAAAB+QAAAAAAAAATSW52YWxpZFRva2VuQWRkcmVzcwAAAAH6AAAAAAAAAA5TdGFsZVByaWNlRGF0YQAAAAAB+wAAAAAAAAAeSW5zdWZmaWNpZW50RnVuZHNGb3JXaXRoZHJhd2FsAAAAAAH8AAAAAAAAABJFeGNlc3NpdmVCb3Jyb3dpbmcAAAAAAf0=",
        "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR"
    ]);

    static readonly parsers = {
        initialize: () => {},
        deposit: (result: string): i128 => PoolContract.spec.funcResToNative('deposit', result),
        withdraw: (result: string): [i128, i128] => PoolContract.spec.funcResToNative('withdraw', result),
        borrow: () => {},
        repay: () => {},
        getOracle: (result: string): Address => PoolContract.spec.funcResToNative('get_oracle', result),
        getSlpSupply: (result: string): i128 => PoolContract.spec.funcResToNative('get_slp_supply', result),
        getTokenInfo: (result: string): TokenInfo => PoolContract.spec.funcResToNative('get_token_info', result),
    };

    initialize(initArgs: poolInitArgs): string {
        return this.call(
            'initialize',
            ...PoolContract.spec.funcArgsToScVals('initialize', initArgs)
          ).toXDR('base64');
    }

    deposit(depositArgs: depositArgs): string {
        return this.call(
            'deposit',
            ...PoolContract.spec.funcArgsToScVals('deposit', depositArgs)
          ).toXDR('base64');
    }

    withdraw(withdrawArgs: withdrawArgs): string {
        return this.call(
            'withdraw',
            ...PoolContract.spec.funcArgsToScVals('withdraw', withdrawArgs)
          ).toXDR('base64');
    }

    borrow(borrowArgs: borrowArgs): string {
        return this.call(
            'borrow',
            ...PoolContract.spec.funcArgsToScVals('borrow', borrowArgs)
          ).toXDR('base64');
    }

    repay(repayArgs: repayArgs): string {
        return this.call(
            'repay',
            ...PoolContract.spec.funcArgsToScVals('repay', repayArgs)
          ).toXDR('base64');
    }

    getOracle(): string {
        return this.call(
            'get_oracle',
            ...PoolContract.spec.funcArgsToScVals('get_oracle', {})
          ).toXDR('base64');
    }

    getSlpSupply(): string {
        return this.call(
            'get_slp_supply',
            ...PoolContract.spec.funcArgsToScVals('get_slp_supply', {})
          ).toXDR('base64');
    }

    getTokenInfo(token: Address | string): string {
        return this.call(
            'get_token_info',
            ...PoolContract.spec.funcArgsToScVals('get_token_info', { token })
          ).toXDR('base64');
    }
  }