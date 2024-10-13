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
    contractId: "CAKLUDFPCNKR2ABGM5FIQMFJBMYZPUKDN5TX4EAOBPZNA4GOVRR5K3VG",
  }
} as const

export type DataKey = {tag: "Oracle", values: void} | {tag: "PoolContract", values: void} | {tag: "TokenA", values: void} | {tag: "TokenB", values: void} | {tag: "Position", values: readonly [string]};


export interface Position {
  borrowed: i128;
  collateral: i128;
  entry_price: i128;
  filled: boolean;
  leverage: u32;
  stop_loss: i128;
  take_profit: i128;
  timestamp: u64;
  token: string;
}

export const Errors = {
  601: {message:"AlreadyInitialized"},

  602: {message:"PositionAlreadyExists"},

  603: {message:"NoPositionExists"},

  604: {message:"StalePriceData"},

  605: {message:"PositionNotLiquidatable"},

  607: {message:"OverflowError"},

  608: {message:"PoolOperationFailed"},

  609: {message:"TokenTransferFailed"},

  610: {message:"PositionAlreadyFilled"},

  611: {message:"PositionNotFilled"},

  10: {message:"InvalidInput"}
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
  initialize: ({pool_contract, oracle, token_a, token_b}: {pool_contract: string, oracle: string, token_a: string, token_b: string}, options?: {
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
   * Construct and simulate a open_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  open_position: ({user, input, size, token}: {user: string, input: i128, size: u32, token: string}, options?: {
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
   * Construct and simulate a open_limit_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  open_limit_position: ({user, input, size, token, entry_price}: {user: string, input: i128, size: u32, token: string, entry_price: i128}, options?: {
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
   * Construct and simulate a add_stop_loss transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_stop_loss: ({user, stop_loss}: {user: string, stop_loss: i128}, options?: {
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
   * Construct and simulate a add_take_profit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_take_profit: ({user, take_profit}: {user: string, take_profit: i128}, options?: {
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
   * Construct and simulate a fill_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  fill_position: ({user, fee_taker}: {user: string, fee_taker: string}, options?: {
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
   * Construct and simulate a close_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_position: ({user}: {user: string}, options?: {
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
   * Construct and simulate a liquidate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  liquidate: ({user, liquidator}: {user: string, liquidator: string}, options?: {
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
   * Construct and simulate a get_position transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_position: ({user}: {user: string}, options?: {
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
  }) => Promise<AssembledTransaction<Position>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAANcG9vbF9jb250cmFjdAAAAAAAABMAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAAAAAAHdG9rZW5fYQAAAAATAAAAAAAAAAd0b2tlbl9iAAAAABMAAAAA",
        "AAAAAAAAAAAAAAANb3Blbl9wb3NpdGlvbgAAAAAAAAQAAAAAAAAABHVzZXIAAAATAAAAAAAAAAVpbnB1dAAAAAAAAAsAAAAAAAAABHNpemUAAAAEAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAATb3Blbl9saW1pdF9wb3NpdGlvbgAAAAAFAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAFaW5wdXQAAAAAAAALAAAAAAAAAARzaXplAAAABAAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAtlbnRyeV9wcmljZQAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAANYWRkX3N0b3BfbG9zcwAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAlzdG9wX2xvc3MAAAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAPYWRkX3Rha2VfcHJvZml0AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAt0YWtlX3Byb2ZpdAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAANZmlsbF9wb3NpdGlvbgAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAlmZWVfdGFrZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAOY2xvc2VfcG9zaXRpb24AAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAJbGlxdWlkYXRlAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAACmxpcXVpZGF0b3IAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAMZ2V0X3Bvc2l0aW9uAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAH0AAAAAhQb3NpdGlvbg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAABk9yYWNsZQAAAAAAAAAAAAAAAAAMUG9vbENvbnRyYWN0AAAAAAAAAAAAAAAGVG9rZW5BAAAAAAAAAAAAAAAAAAZUb2tlbkIAAAAAAAEAAAAAAAAACFBvc2l0aW9uAAAAAQAAABM=",
        "AAAAAQAAAAAAAAAAAAAACFBvc2l0aW9uAAAACQAAAAAAAAAIYm9ycm93ZWQAAAALAAAAAAAAAApjb2xsYXRlcmFsAAAAAAALAAAAAAAAAAtlbnRyeV9wcmljZQAAAAALAAAAAAAAAAZmaWxsZWQAAAAAAAEAAAAAAAAACGxldmVyYWdlAAAABAAAAAAAAAAJc3RvcF9sb3NzAAAAAAAACwAAAAAAAAALdGFrZV9wcm9maXQAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABgAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAABAAAAAAAAAAAAAAAFFBvc2l0aW9uTWFuYWdlckVycm9yAAAACwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAJZAAAAAAAAABVQb3NpdGlvbkFscmVhZHlFeGlzdHMAAAAAAAJaAAAAAAAAABBOb1Bvc2l0aW9uRXhpc3RzAAACWwAAAAAAAAAOU3RhbGVQcmljZURhdGEAAAAAAlwAAAAAAAAAF1Bvc2l0aW9uTm90TGlxdWlkYXRhYmxlAAAAAl0AAAAAAAAADU92ZXJmbG93RXJyb3IAAAAAAAJfAAAAAAAAABNQb29sT3BlcmF0aW9uRmFpbGVkAAAAAmAAAAAAAAAAE1Rva2VuVHJhbnNmZXJGYWlsZWQAAAACYQAAAAAAAAAVUG9zaXRpb25BbHJlYWR5RmlsbGVkAAAAAAACYgAAAAAAAAARUG9zaXRpb25Ob3RGaWxsZWQAAAAAAAJjAAAAAAAAAAxJbnZhbGlkSW5wdXQAAAAK",
        "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        open_position: this.txFromJSON<null>,
        open_limit_position: this.txFromJSON<null>,
        add_stop_loss: this.txFromJSON<null>,
        add_take_profit: this.txFromJSON<null>,
        fill_position: this.txFromJSON<null>,
        close_position: this.txFromJSON<null>,
        liquidate: this.txFromJSON<null>,
        get_position: this.txFromJSON<Position>
  }
}