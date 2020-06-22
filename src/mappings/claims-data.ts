import { BigInt } from '@graphprotocol/graph-ts'
import { integer } from '@protofire/subgraph-toolkit'

import { ClaimRaise, ClaimsData, VoteCast } from '../../generated/ClaimsData/ClaimsData'

import { Claim, Cover, Vote } from '../../generated/schema'
import { getOrCreateUser } from '../entities'

import { CLAIMS_DATA } from '../contracts'

let CD = ClaimsData.bind(CLAIMS_DATA)

export function handleClaimRaise(event: ClaimRaise): void {
  let user = getOrCreateUser(event.params.userAddress, event.block, event.transaction)

  if (user != null) {
    let cover = Cover.load(event.params.coverId.toString())

    if (cover != null) {
      let CD = ClaimsData.bind(event.address)

      let claim = new Claim(event.params.claimId.toString())
      claim.user = user.id
      claim.cover = cover.id
      claim.maxVotingTime = CD.maxVotingTime()
      claim.submitDate = event.params.dateSubmit
      claim.status = 'CA_VOTE'
      claim.statusLastUpdated = event.params.dateSubmit
      claim.voteCount = integer.ZERO
      claim.save()

      user.claimCount = user.claimCount.plus(integer.ONE)
      user.save()
    }
  }
}

export function handleVoteCast(event: VoteCast): void {
  let user = getOrCreateUser(event.params.userAddress, event.block, event.transaction)

  if (user != null) {
    let claim = Claim.load(event.params.claimId.toString())

    if (claim != null) {
      let vote = new Vote(claim.id + '-' + user.id)
      vote.user = user.id
      vote.claim = claim.id
      vote.verdict = event.params.verdict == 1 ? 'ACCEPTED' : 'DENIED'
      vote.submitDate = event.params.submitDate
      vote.save()

      claim.voteCount = claim.voteCount.plus(integer.ONE)
      claim.save()

      user.voteCount = user.voteCount.plus(integer.ONE)
      user.save()
    }
  }
}

export function claimStatus(claimId: BigInt): string {
  let status = CD.getClaimStatusNumber(claimId).value1.toI32()

  if (status >= 1 && status <= 5) {
    return 'MEMBER_VOTE'
  } else if (status > 5) {
    return status == 6 ? 'DENIED' : 'ACCEPTED'
  }

  return 'CA_VOTE'
}
