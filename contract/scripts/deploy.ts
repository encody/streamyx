import { ethers } from "hardhat";

async function main() {
  const Scheduler = await ethers.getContractFactory("Scheduler");
  const scheduler = await Scheduler.deploy({ });

  await scheduler.deployed();

  console.log(`Scheduler deployed to ${scheduler.address}.`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
