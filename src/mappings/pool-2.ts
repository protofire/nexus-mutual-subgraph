import { Rebalancing as RebalancingEvent } from '../../generated/Pool2/Pool2'

import { Rebalancing } from '../../generated/schema'

export function handleRebalancing(event: RebalancingEvent): void {
  let rebalancing = new Rebalancing('REBALANCING-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  rebalancing.currency = event.params.iaCurr.toString()
  rebalancing.amount = event.params.tokenAmount

  rebalancing.save()
}
