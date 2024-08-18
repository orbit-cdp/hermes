use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PoolError {
    NotInitialized = 500,
    AlreadyInitialized = 501,
    InvalidTokenSupply = 502,
    InvalidTargetRatio = 503,
    DepositDoesNotImproveRatio = 504,
    InsufficientLiquidity = 505,
    InvalidTokenAddress = 506,
    StalePriceData = 507,
    InsufficientFundsForWithdrawal = 508,
    ExcessiveBorrowing = 509,
}