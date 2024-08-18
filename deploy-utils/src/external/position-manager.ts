import { Address, contract, Contract } from "@stellar/stellar-sdk";
import { i128, u32, u64 } from "@stellar/stellar-sdk/contract";

export interface Position {
    borrowed: i128;
    collateral: i128;
    entry_price: i128;
    timestamp: u64;
    token: string;
  }

  export interface positionManagerInitArgs {
    pool_contract: Address | string;
    oracle: Address | string;
    token_a: Address | string;
    token_b: Address | string;
  }

  export interface openPositionArgs {
    user: Address | string;
    input: i128;
    size: u32;
    token: Address | string;
    }

    export interface liquidateArgs {
        user: Address | string;
        liquidator: Address | string;
    }
    


  export class PositionManagerContract extends Contract {
    static spec: contract.Spec = new contract.Spec([ "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAANcG9vbF9jb250cmFjdAAAAAAAABMAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAAAAAAHdG9rZW5fYQAAAAATAAAAAAAAAAd0b2tlbl9iAAAAABMAAAAA",
        "AAAAAAAAAAAAAAANb3Blbl9wb3NpdGlvbgAAAAAAAAQAAAAAAAAABHVzZXIAAAATAAAAAAAAAAVpbnB1dAAAAAAAAAsAAAAAAAAABHNpemUAAAAEAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAOY2xvc2VfcG9zaXRpb24AAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAJbGlxdWlkYXRlAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAACmxpcXVpZGF0b3IAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAMZ2V0X3Bvc2l0aW9uAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAH0AAAAAhQb3NpdGlvbg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAABk9yYWNsZQAAAAAAAAAAAAAAAAAMUG9vbENvbnRyYWN0AAAAAAAAAAAAAAAGVG9rZW5BAAAAAAAAAAAAAAAAAAZUb2tlbkIAAAAAAAEAAAAAAAAACFBvc2l0aW9uAAAAAQAAABM=",
        "AAAAAQAAAAAAAAAAAAAACFBvc2l0aW9uAAAABQAAAAAAAAAIYm9ycm93ZWQAAAALAAAAAAAAAApjb2xsYXRlcmFsAAAAAAALAAAAAAAAAAtlbnRyeV9wcmljZQAAAAALAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAGAAAAAAAAAAV0b2tlbgAAAAAAABM=",
        "AAAABAAAAAAAAAAAAAAAFFBvc2l0aW9uTWFuYWdlckVycm9yAAAACQAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAJZAAAAAAAAABVQb3NpdGlvbkFscmVhZHlFeGlzdHMAAAAAAAJaAAAAAAAAABBOb1Bvc2l0aW9uRXhpc3RzAAACWwAAAAAAAAAOU3RhbGVQcmljZURhdGEAAAAAAlwAAAAAAAAAF1Bvc2l0aW9uTm90TGlxdWlkYXRhYmxlAAAAAl0AAAAAAAAADU92ZXJmbG93RXJyb3IAAAAAAAJfAAAAAAAAABNQb29sT3BlcmF0aW9uRmFpbGVkAAAAAmAAAAAAAAAAE1Rva2VuVHJhbnNmZXJGYWlsZWQAAAACYQAAAAAAAAAMSW52YWxpZElucHV0AAAACg==",
        "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR" ]);

    static readonly parsers = {
        initialize: () => {},
        openPosition: () => {},
        closePosition: () => {},
        liquidate: () => {},
        getPosition: (result: string): Position => PositionManagerContract.spec.funcResToNative('get_position', result),
    };

    initialize(args: positionManagerInitArgs): string {
        return this.call('initialize', ...PositionManagerContract.spec.funcArgsToScVals('initialize', args)).toXDR('base64');
    }

    openPosition(args: openPositionArgs): string {
        return this.call('open_position', ...PositionManagerContract.spec.funcArgsToScVals('open_position', args)).toXDR('base64');
    }

    closePosition(user: Address | string): string {
        return this.call('close_position', ...PositionManagerContract.spec.funcArgsToScVals('close_position', {user})).toXDR('base64');
    }

    liquidate(args: liquidateArgs): string {
        return this.call('liquidate', ...PositionManagerContract.spec.funcArgsToScVals('liquidate', args)).toXDR('base64');
    }

    getPosition(user: Address | string): string {
        return this.call('get_position', ...PositionManagerContract.spec.funcArgsToScVals('get_position', {user})).toXDR('base64');
    }

  }