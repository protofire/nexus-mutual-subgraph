import { Payout as PayoutEvent } from '../../generated/Pool1/Pool1'
import { Cover, Payout } from '../../generated/schema'

export function handleClaimPayout(event: PayoutEvent): void {
  let cover = Cover.load(event.params.coverId.toString())

  if (cover != null) {
    let payout = new Payout('PAYOUT-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString())
    payout.cover = cover.id
    payout.amount = event.params.tokens

    payout.save()
  }
}
