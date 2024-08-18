import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CD3X45MVIZ364HCZGGDGSSOT6I7DBLUM325Y22P247J7AXS3WKHJZF3O",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "Oracle", values: void} | {tag: "PositionManager", values: void} | {tag: "SlpToken", values: void} | {tag: "SlpSupply", values: void} | {tag: "TokenA", values: void} | {tag: "TokenB", values: void};


export interface TokenInfo {
  address: string;
  target_ratio: u32;
  total_supply: i128;
}

export const Errors = {
  500: {message:"NotInitialized"},

  501: {message:"AlreadyInitialized"},

  502: {message:"InvalidTokenSupply"},

  503: {message:"InvalidTargetRatio"},

  504: {message:"DepositDoesNotImproveRatio"},

  505: {message:"InsufficientLiquidity"},

  506: {message:"InvalidTokenAddress"},

  507: {message:"StalePriceData"},

  508: {message:"InsufficientFundsForWithdrawal"},

  509: {message:"ExcessiveBorrowing"}
}

/**
 * Price data for an asset at a specific timestamp
 */
export interface PriceData {
  price: i128;
  timestamp: u64;
}

/**
 * Asset type
 */
export type Asset = {tag: "Stellar", values: readonly [string]} | {tag: "Other", values: readonly [string]};


export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin, oracle, position_manager, spl, token_a, token_b}: {admin: string, oracle: string, position_manager: string, spl: string, token_a: TokenInfo, token_b: TokenInfo}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: ({user, token_a_amount, token_b_amount}: {user: string, token_a_amount: i128, token_b_amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: ({user, slp_amount}: {user: string, slp_amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<readonly [i128, i128]>>

  /**
   * Construct and simulate a borrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  borrow: ({token, amount, fee}: {token: string, amount: i128, fee: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a repay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  repay: ({token, amount, fee}: {token: string, amount: i128, fee: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_oracle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_oracle: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_slp_supply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_slp_supply: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_token_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_token_info: ({token}: {token: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<TokenInfo>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAGT3JhY2xlAAAAAAAAAAAAAAAAAA9Qb3NpdGlvbk1hbmFnZXIAAAAAAAAAAAAAAAAIU2xwVG9rZW4AAAAAAAAAAAAAAAlTbHBTdXBwbHkAAAAAAAAAAAAAAAAAAAZUb2tlbkEAAAAAAAAAAAAAAAAABlRva2VuQgAA",
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
        "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        deposit: this.txFromJSON<i128>,
        withdraw: this.txFromJSON<readonly [i128, i128]>,
        borrow: this.txFromJSON<null>,
        repay: this.txFromJSON<null>,
        get_oracle: this.txFromJSON<string>,
        get_slp_supply: this.txFromJSON<i128>,
        get_token_info: this.txFromJSON<TokenInfo>
  }
}