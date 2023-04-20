import type { Deployment } from '@openzeppelin/upgrades-core';
import debug from './debug';
import type { ethers, ContractFactory } from 'ethers';
import { utils, BigNumber } from 'ethers';
import { getContractAddress } from 'ethers/lib/utils';

export interface DeployTransaction {
  deployTransaction: ethers.providers.TransactionResponse;
}

export async function deploy(
  factory: ContractFactory,
  ...args: unknown[]
): Promise<Required<Deployment & DeployTransaction>> {
  const gasArgs = {
    maxFeePerGas: utils.parseUnits('250', 'gwei'),
    maxPriorityFeePerGas: utils.parseUnits('50', 'gwei'),
    gasLimit: BigNumber.from(4000000),
  };
  console.log('gasArgs', gasArgs);
  console.log('sender', await factory.signer.getAddress());
  const contractInstance = await factory.deploy(...args, gasArgs);
  const { deployTransaction } = contractInstance;

  const address: string = getContractAddress({
    from: await factory.signer.getAddress(),
    nonce: deployTransaction.nonce,
  });
  if (address !== contractInstance.address) {
    debug(
      `overriding contract address from ${contractInstance.address} to ${address} for nonce ${deployTransaction.nonce}`,
    );
  }

  const txHash = deployTransaction.hash;
  return { address, txHash, deployTransaction };
}
