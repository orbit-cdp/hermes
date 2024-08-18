import { deployFutureContracts, deployOracleContract, deployTokenContract, installContracts } from "./logic.js";
import { addressBook } from "./utils/address-book.js";

async function fullDeploy() {
    console.log("Installing contracts");
    await installContracts();

    console.log("Creating tokens");
    await deployTokenContract("oUSD");
    await deployTokenContract("SLP");
    console.log("Tokens created");

    console.log("Create oracle");
    await deployOracleContract("oracle");
    console.log("Oracle created");

    console.log("Deploy futures");
    await deployFutureContracts('oracle', "SLP", "oUSD", "XLM", 0.5, 0.5);
    console.log("Futures deployed");


}

fullDeploy().catch((error) => {
    console.error('Error:', error);
  });