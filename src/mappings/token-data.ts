import { decimal, integer } from '@protofire/subgraph-toolkit'

import { AddStakeCall, Commission as CommissionEvent } from '../../generated/TokenData/TokenData'
import { Commission, Stake } from '../../generated/schema'

import { getOrCreateInsuredContract, getOrCreateUser } from '../entities'

const DAYS_TO_STAKE = 250

export function handleCommission(event: CommissionEvent): void {
  let contract = getOrCreateInsuredContract(event.params.stakedContractAddress, event.block, event.transaction)

  if (contract != null) {
    let user = getOrCreateUser(event.params.stakerAddress, event.block, event.transaction)

    if (user != null) {
      let commision = new Commission(event.transaction.hash.toHexString() + '-' + event.logIndex.toHexString())
      commision.contract = contract.id
      commision.user = user.id
      commision.stakedContractIndex = event.params.scIndex
      commision.amount = decimal.convert(event.params.commissionAmount)
      commision.save()
    }
  }
}

export function handleStake(call: AddStakeCall): void {
  let contract = getOrCreateInsuredContract(call.inputs._stakedContractAddress, call.block, call.transaction)

  if (contract != null) {
    let user = getOrCreateUser(call.inputs._stakerAddress, call.block, call.transaction)

    if (user != null) {
      let stake = new Stake(call.inputs._stakerAddress.toHexString() + '-' + call.outputs.scIndex.toString())
      stake.contract = contract.id
      stake.user = user.id
      stake.stakedContractIndex = call.outputs.scIndex
      stake.amount = decimal.convert(call.inputs._amount)
      stake.unlockedAmount = decimal.ZERO
      stake.burntAmount = decimal.ZERO
      stake.created = call.block.timestamp
      stake.expires = call.block.timestamp.plus(integer.fromNumber(DAYS_TO_STAKE * 24 * 60 * 60))
      stake.save()

      user.stakeCount = user.stakeCount.plus(integer.ONE)
      user.save()
    }
  }
}
