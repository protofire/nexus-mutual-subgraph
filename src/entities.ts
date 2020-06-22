import { Address, ethereum } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

import { Contract, User } from '../generated/schema'

import { totalContracts, totalUsers } from './metrics'

export function getOrCreateInsuredContract(
  contractAddress: Address,
  block: ethereum.Block,
  transaction: ethereum.Transaction,
): Contract {
  let address = contractAddress.toHexString()
  let contract = Contract.load(address)

  if (contract == null) {
    contract = new Contract(address)
    contract.address = contractAddress

    contract.coverCount = integer.ZERO
    contract.stakeCount = integer.ZERO

    contract.addedAt = block.timestamp
    contract.addedAtBlock = block.number
    contract.addedAtTransaction = transaction.hash

    contract.save()

    totalContracts.increase().save()
  }

  return contract as Contract
}

export function getOrCreateUser(
  accountAddress: Address,
  block: ethereum.Block,
  transaction: ethereum.Transaction,
): User {
  let userId = accountAddress.toHexString()
  let user = User.load(userId)

  if (user == null) {
    user = new User(userId)
    user.address = accountAddress

    user.isMember = false

    user.coverCount = integer.ZERO
    user.stakeCount = integer.ZERO
    user.claimCount = integer.ZERO
    user.voteCount = integer.ZERO

    user.addedAt = block.timestamp
    user.addedAtBlock = block.number
    user.addedAtTransaction = transaction.hash

    user.save()

    totalUsers.increase().save()
  }

  return user as User
}
