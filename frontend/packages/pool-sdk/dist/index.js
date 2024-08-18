import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CD3X45MVIZ364HCZGGDGSSOT6I7DBLUM325Y22P247J7AXS3WKHJZF3O",
    }
};
export const Errors = {
    500: { message: "NotInitialized" },
    501: { message: "AlreadyInitialized" },
    502: { message: "InvalidTokenSupply" },
    503: { message: "InvalidTargetRatio" },
    504: { message: "DepositDoesNotImproveRatio" },
    505: { message: "InsufficientLiquidity" },
    506: { message: "InvalidTokenAddress" },
    507: { message: "StalePriceData" },
    508: { message: "InsufficientFundsForWithdrawal" },
    509: { message: "ExcessiveBorrowing" }
};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAGT3JhY2xlAAAAAAAAAAAAAAAAAA9Qb3NpdGlvbk1hbmFnZXIAAAAAAAAAAAAAAAAIU2xwVG9rZW4AAAAAAAAAAAAAAAlTbHBTdXBwbHkAAAAAAAAAAAAAAAAAAAZUb2tlbkEAAAAAAAAAAAAAAAAABlRva2VuQgAA",
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
            "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR"]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        deposit: (this.txFromJSON),
        withdraw: (this.txFromJSON),
        borrow: (this.txFromJSON),
        repay: (this.txFromJSON),
        get_oracle: (this.txFromJSON),
        get_slp_supply: (this.txFromJSON),
        get_token_info: (this.txFromJSON)
    };
}
