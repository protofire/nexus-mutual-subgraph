import { decimal, integer } from '@protofire/subgraph-toolkit'

import { Burned, Locked, Unlocked } from '../../generated/TokenController/TokenController'
import { TokenData } from '../../generated/TokenData/TokenData'

import { Stake } from '../../generated/schema'

import { TOKEN_DATA } from '../contracts'

let TD = TokenData.bind(TOKEN_DATA)

export function handleBurned(event: Burned): void {
  let staker = event.params.member

  let stakes = TD.getStakerStakedContractLength(staker)

  for (let index = integer.ZERO; index.lt(stakes); index = index.plus(integer.ONE)) {
    let burned = decimal.convert(TD.getStakerStakedBurnedByIndex(staker, index))

    if (burned.notEqual(decimal.ZERO)) {
      let stake = Stake.load(staker.toHexString() + '-' + index.toString())

      if (stake != null && stake.burntAmount.notEqual(burned)) {
        stake.burntAmount = burned
        stake.save()
      }
    }
  }
}

export function handleLocked(event: Locked): void {
  // TODO
}

export function handleUnlocked(event: Unlocked): void {
  let staker = event.params._of

  let stakes = TD.getStakerStakedContractLength(staker)

  for (let index = integer.ZERO; index.lt(stakes); index = index.plus(integer.ONE)) {
    let unlocked = decimal.convert(TD.getStakerUnlockedStakedTokens(staker, index))

    if (unlocked.notEqual(decimal.ZERO)) {
      let stake = Stake.load(staker.toHexString() + '-' + index.toString())

      if (stake != null && stake.burntAmount.notEqual(unlocked)) {
        stake.unlockedAmount = unlocked
        stake.save()
      }
    }
  }
}
