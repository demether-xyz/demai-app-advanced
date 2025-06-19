import { useMemo } from 'react'
import { ethers } from 'ethers'
import { VAULT_FACTORY_ADDRESSES, BEACON_ADDRESS, BEACON_PROXY_CREATION_CODE } from '../config/tokens'

/**
 * Hook to calculate vault addresses using deterministic CREATE2
 */
const useVaultAddress = (vaultOwner: string | undefined, chainId: number) => {
  const vaultAddress = useMemo(() => {
    if (!vaultOwner) return ''
    
    try {
      const factoryAddress = VAULT_FACTORY_ADDRESSES[chainId]
      if (!factoryAddress) {
        console.error('Factory address not found for chain:', chainId)
        return ''
      }

      // Use the same salt logic as the contract: keccak256(abi.encodePacked(VAULT_DEPLOYER_ID, vaultOwner))
      const VAULT_DEPLOYER_ID = ethers.keccak256(ethers.toUtf8Bytes("DEMAI_VAULT_FACTORY_V1"))
      const salt = ethers.keccak256(ethers.concat([VAULT_DEPLOYER_ID, ethers.zeroPadValue(vaultOwner, 20)]))

      // 1. Prepare the initialization data for the Vault's `initialize` function
      const vaultInterface = new ethers.Interface([
        "function initialize(address factoryAdmin, address vaultOwner)"
      ])
      const initData = vaultInterface.encodeFunctionData("initialize", [
        factoryAddress,
        vaultOwner
      ])

      // 2. Encode the constructor arguments for the BeaconProxy
      const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes'],
        [BEACON_ADDRESS, initData]
      )

      // 3. Construct the full bytecode for deployment
      const creationCodeBytes = new Uint8Array(
        BEACON_PROXY_CREATION_CODE.slice(2).match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      )
      const fullBytecode = ethers.concat([creationCodeBytes, constructorArgs])

      // 4. Compute the CREATE2 address
      const predictedAddress = ethers.getCreate2Address(
        factoryAddress,
        salt,
        ethers.keccak256(fullBytecode)
      )

      return predictedAddress
    } catch (error) {
      console.error('Error calculating vault address:', error)
      return ''
    }
  }, [vaultOwner, chainId])

  return {
    vaultAddress,
    // For backward compatibility
    address: vaultAddress
  }
}

export { useVaultAddress } 