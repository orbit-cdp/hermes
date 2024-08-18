use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PositionManagerError {
    // Initialization errors
    AlreadyInitialized = 601,

    // Position-related errors
    PositionAlreadyExists = 602,
    NoPositionExists = 603,

    // Oracle-related errors
    StalePriceData = 604,

    // Liquidation-related errors
    PositionNotLiquidatable = 605,

    // Calculation errors
    OverflowError = 607,

    // Pool interaction errors
    PoolOperationFailed = 608,

    // Token transfer errors
    TokenTransferFailed = 609,

    // General errors
    InvalidInput = 10,
}