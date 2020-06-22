import { decimal, integer } from '@protofire/subgraph-toolkit'

import { CoverDetailsEvent, CoverStatusEvent, QuotationData } from '../../generated/QuotationData/QuotationData'
import { Cover } from '../../generated/schema'

import { getOrCreateInsuredContract, getOrCreateUser } from '../entities'

export function handleCoverDetailsEvent(event: CoverDetailsEvent): void {
  let contract = getOrCreateInsuredContract(event.params.scAdd, event.block, event.transaction)

  if (contract != null) {
    let QD = QuotationData.bind(event.address)

    contract.coverCount = contract.coverCount.plus(integer.ONE)
    contract.save()

    let user = getOrCreateUser(QD.getCoverMemberAddress(event.params.cid), event.block, event.transaction)
    user.coverCount = user.coverCount.plus(integer.ONE)
    user.save()

    let cover = new Cover(event.params.cid.toString())
    cover.address = event.params.scAdd
    cover.amount = event.params.sumAssured
    cover.created = event.block.timestamp
    cover.contract = contract.id
    cover.expires = event.params.expiry
    cover.period = QD.getCoverPeriod(event.params.cid)
    cover.premium = decimal.convert(event.params.premium)
    cover.premiumNXM = decimal.convert(event.params.premiumNXM)
    cover.status = coverStatus(QD.getCoverStatusNo(event.params.cid))
    cover.user = user.id
    cover.save()
  }
}

export function handleCoverStatusEvent(event: CoverStatusEvent): void {
  let cover = Cover.load(event.params.cid.toString())

  if (cover != null) {
    cover.status = coverStatus(event.params.statusNum)

    cover.save()
  }
}

function coverStatus(status: u32): string {
  switch (status) {
    case 0:
      return 'ACTIVE'
    case 1:
      return 'CLAIM_ACCEPTED'
    case 2:
      return 'CLAIM_DENIED'
    case 3:
      return 'COVER_EXPIRED'
    case 4:
      return 'CLAIM_SUBMITTED'
    case 5:
      return 'REQUESTED'
    default:
      return 'UNKNOWN'
  }
}
