import { MCREvent } from '../../generated/MCR/MCR'

import { MCRData } from '../../generated/schema'

export function handleMCREvent(event: MCREvent): void {
  let mcr = new MCRData(event.transaction.hash.toHexString() + '-' + event.logIndex.toString())
  mcr.block = event.params.blockNumber
  mcr.date = event.params.blockNumber
  mcr.currencies = event.params.allCurr.map<string>(c => c.toString())
  mcr.rates = event.params.allCurrRates
  mcr.mcrEtherx100 = event.params.mcrEtherx100
  mcr.mcrPercx100 = event.params.mcrPercx100
  mcr.vFull = event.params.vFull

  mcr.save()
}
