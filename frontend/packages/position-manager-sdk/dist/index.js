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
        contractId: "CDDMX3D5VTA7KSUTRI4QX7UCXEM3JU2GCAPBJ35MBKOQF55OFV2CPKMO",
    }
};
export const Errors = {
    601: { message: "AlreadyInitialized" },
    602: { message: "PositionAlreadyExists" },
    603: { message: "NoPositionExists" },
    604: { message: "StalePriceData" },
    605: { message: "PositionNotLiquidatable" },
    607: { message: "OverflowError" },
    608: { message: "PoolOperationFailed" },
    609: { message: "TokenTransferFailed" },
    10: { message: "InvalidInput" }
};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAANcG9vbF9jb250cmFjdAAAAAAAABMAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAANb3Blbl9wb3NpdGlvbgAAAAAAAAQAAAAAAAAABHVzZXIAAAATAAAAAAAAAAVpbnB1dAAAAAAAAAsAAAAAAAAABHNpemUAAAAEAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
            "AAAAAAAAAAAAAAAOY2xvc2VfcG9zaXRpb24AAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAJbGlxdWlkYXRlAAAAAAAAAgAAAAAAAAAEdXNlcgAAABMAAAAAAAAACmxpcXVpZGF0b3IAAAAAABMAAAAA",
            "AAAAAAAAAAAAAAAMZ2V0X3Bvc2l0aW9uAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAH0AAAAAhQb3NpdGlvbg==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABk9yYWNsZQAAAAAAAAAAAAAAAAAMUG9vbENvbnRyYWN0AAAAAQAAAAAAAAAIUG9zaXRpb24AAAABAAAAEw==",
            "AAAAAQAAAAAAAAAAAAAACFBvc2l0aW9uAAAABQAAAAAAAAAIYm9ycm93ZWQAAAALAAAAAAAAAApjb2xsYXRlcmFsAAAAAAALAAAAAAAAAAtlbnRyeV9wcmljZQAAAAALAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAGAAAAAAAAAAV0b2tlbgAAAAAAABM=",
            "AAAABAAAAAAAAAAAAAAAFFBvc2l0aW9uTWFuYWdlckVycm9yAAAACQAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAJZAAAAAAAAABVQb3NpdGlvbkFscmVhZHlFeGlzdHMAAAAAAAJaAAAAAAAAABBOb1Bvc2l0aW9uRXhpc3RzAAACWwAAAAAAAAAOU3RhbGVQcmljZURhdGEAAAAAAlwAAAAAAAAAF1Bvc2l0aW9uTm90TGlxdWlkYXRhYmxlAAAAAl0AAAAAAAAADU92ZXJmbG93RXJyb3IAAAAAAAJfAAAAAAAAABNQb29sT3BlcmF0aW9uRmFpbGVkAAAAAmAAAAAAAAAAE1Rva2VuVHJhbnNmZXJGYWlsZWQAAAACYQAAAAAAAAAMSW52YWxpZElucHV0AAAACg==",
            "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
            "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR"]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        open_position: (this.txFromJSON),
        close_position: (this.txFromJSON),
        liquidate: (this.txFromJSON),
        get_position: (this.txFromJSON)
    };
}
