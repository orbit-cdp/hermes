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
        contractId: "CAYMADQ6S3DDNKQIX424GVOFB3OMRXHRB56XFX6CF4DQYTRKLOXFCHFU",
    }
};
/**
 * The error codes for the contract.
 */
export const Errors = {
    /**
     * The config assets don't contain persistent asset. Delete assets is not supported.
     */
    2: { message: "AssetMissing" }
};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["AAAABAAAACFUaGUgZXJyb3IgY29kZXMgZm9yIHRoZSBjb250cmFjdC4AAAAAAAAAAAAAEFByaWNlT3JhY2xlRXJyb3IAAAABAAAAUVRoZSBjb25maWcgYXNzZXRzIGRvbid0IGNvbnRhaW4gcGVyc2lzdGVudCBhc3NldC4gRGVsZXRlIGFzc2V0cyBpcyBub3Qgc3VwcG9ydGVkLgAAAAAAAAxBc3NldE1pc3NpbmcAAAAC",
            "AAAAAAAAAAAAAAAIc2V0X2RhdGEAAAAFAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABGJhc2UAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAZhc3NldHMAAAAAA+oAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAhkZWNpbWFscwAAAAQAAAAAAAAACnJlc29sdXRpb24AAAAAAAQAAAAA",
            "AAAAAAAAAAAAAAAJc2V0X3ByaWNlAAAAAAAAAgAAAAAAAAAGcHJpY2VzAAAAAAPqAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABgAAAAA=",
            "AAAAAAAAAAAAAAAQc2V0X3ByaWNlX3N0YWJsZQAAAAEAAAAAAAAABnByaWNlcwAAAAAD6gAAAAsAAAAA",
            "AAAAAAAAAAAAAAAEYmFzZQAAAAAAAAABAAAH0AAAAAVBc3NldAAAAA==",
            "AAAAAAAAAAAAAAAGYXNzZXRzAAAAAAAAAAAAAQAAA+oAAAfQAAAABUFzc2V0AAAA",
            "AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAKcmVzb2x1dGlvbgAAAAAAAAAAAAEAAAAE",
            "AAAAAAAAAAAAAAAFcHJpY2UAAAAAAAACAAAAAAAAAAVhc3NldAAAAAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAABAAAD6AAAB9AAAAAJUHJpY2VEYXRhAAAA",
            "AAAAAAAAAAAAAAAGcHJpY2VzAAAAAAACAAAAAAAAAAVhc3NldAAAAAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAAB3JlY29yZHMAAAAABAAAAAEAAAPoAAAD6gAAB9AAAAAJUHJpY2VEYXRhAAAA",
            "AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==",
            "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
            "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR"]), options);
        this.options = options;
    }
    fromJSON = {
        set_data: (this.txFromJSON),
        set_price: (this.txFromJSON),
        set_price_stable: (this.txFromJSON),
        base: (this.txFromJSON),
        assets: (this.txFromJSON),
        decimals: (this.txFromJSON),
        resolution: (this.txFromJSON),
        price: (this.txFromJSON),
        prices: (this.txFromJSON),
        lastprice: (this.txFromJSON)
    };
}
