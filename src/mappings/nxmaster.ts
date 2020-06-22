import { DelegateCallBackCall } from '../../generated/NXMaster/NXMaster'
import { PoolData } from '../../generated/NXMaster/PoolData'

import { Claim } from '../../generated/schema'

import { POOL_DATA } from '../contracts'
import { claimStatus } from './claims-data'

let PD = PoolData.bind(POOL_DATA)

export function handleDelegateCallBack(call: DelegateCallBackCall): void {
  let type = PD.getApiIdTypeOf(call.inputs.myid)

  if (type.toString() == 'CLA') {
    let claimId = PD.getIdOfApiId(call.inputs.myid)

    let claim = Claim.load(claimId.toString())

    if (claim != null) {
      let status = claimStatus(claimId)

      if (claim.status != status) {
        claim.status = status
        claim.save()
      }
    }
  }
}
