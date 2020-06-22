import { metrics } from '@protofire/subgraph-toolkit'

export let totalContracts = metrics.getCounter('contracts')
export let totalUsers = metrics.getCounter('users')
