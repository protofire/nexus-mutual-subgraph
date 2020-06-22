import { Address } from '@graphprotocol/graph-ts'
import { decimal, integer, ZERO_ADDRESS } from '@protofire/subgraph-toolkit'

import { NXMToken, Approval, BlackListed, Transfer, WhiteListed } from '../../generated/NXMToken/NXMToken'

import {
  Token,
  ApprovalEvent,
  BurnEvent,
  MintEvent,
  TransferEvent,
  WhiteListedEvent,
  BlackListedEvent,
} from '../../generated/schema'

export function handleApproval(event: Approval): void {
  let token = getToken(event.address)

  if (token != null) {
    let eventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

    // Log approval event
    let approval = new ApprovalEvent(token.id + '-APPROVAL-' + eventId)
    approval.token = token.id
    approval.account = event.params.owner
    approval.amount = decimal.convert(event.params.value, token.decimals)
    approval.spender = event.params.spender

    approval.block = event.block.number
    approval.timestamp = event.block.timestamp
    approval.transaction = event.transaction.hash

    approval.save()

    // Update token info
    token.approvalEventCount = token.approvalEventCount.plus(integer.ONE)
    token.eventCount = token.eventCount.plus(integer.ONE)

    token.save()
  }
}

export function handleBlackListed(event: BlackListed): void {
  let token = getToken(event.address)

  if (token != null) {
    let eventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

    // Log whitelisted address
    let blacklisted = new BlackListedEvent(token.id + '-BLACKLISTED-' + eventId)
    blacklisted.token = token.id
    blacklisted.account = event.params.member

    blacklisted.block = event.block.number
    blacklisted.timestamp = event.block.timestamp
    blacklisted.transaction = event.transaction.hash

    blacklisted.save()

    // Remove member from whitelist
    let whitelist = token.whitelist
    let pos = whitelist.indexOf(event.params.member)

    if (pos > -1) {
      token.whitelist = whitelist.splice(pos, 1)

      token.save()
    }
  }
}

export function handleTransfer(event: Transfer): void {
  let token = getToken(event.address)

  if (token != null) {
    let eventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    let amount = decimal.convert(event.params.value, token.decimals)

    token.eventCount = token.eventCount.plus(integer.ONE)

    if (event.params.to.toHexString() == ZERO_ADDRESS) {
      // Log burn event
      let burn = new BurnEvent(token.id + '-BURN-' + eventId)
      burn.token = token.id
      burn.account = event.params.from
      burn.amount = amount

      burn.block = event.block.number
      burn.timestamp = event.block.timestamp
      burn.transaction = event.transaction.hash

      burn.save()

      // Update token info
      token.burnEventCount = token.burnEventCount.plus(integer.ONE)
      token.totalBurned = token.totalBurned.plus(amount)
      token.totalSupply = token.totalSupply.minus(amount)
    } else if (event.params.from.toHexString() == ZERO_ADDRESS) {
      // Log mint event
      let mint = new MintEvent(token.id + '-MINT-' + eventId)
      mint.token = token.id
      mint.account = event.params.from
      mint.amount = amount

      mint.block = event.block.number
      mint.timestamp = event.block.timestamp
      mint.transaction = event.transaction.hash

      mint.save()

      // Update token info
      token.mintEventCount = token.mintEventCount.plus(integer.ONE)
      token.totalMinted = token.totalMinted.plus(amount)
      token.totalSupply = token.totalSupply.plus(amount)
    } else {
      // Log transfer event
      let transfer = new TransferEvent(token.id + '-TRANSFER-' + eventId)
      transfer.token = token.id
      transfer.account = event.params.from
      transfer.amount = amount
      transfer.from = event.params.from
      transfer.to = event.params.to

      transfer.block = event.block.number
      transfer.timestamp = event.block.timestamp
      transfer.transaction = event.transaction.hash

      transfer.save()

      // Update token info
      token.transferEventCount = token.transferEventCount.plus(integer.ONE)
      token.totalTransferred = token.totalTransferred.plus(amount)
    }

    token.save()
  }
}

export function handleWhiteListed(event: WhiteListed): void {
  let token = getToken(event.address)

  if (token != null) {
    let eventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()

    // Log whitelisted address
    let whitelisted = new WhiteListedEvent(token.id + '-WHITELIST-' + eventId)
    whitelisted.token = token.id
    whitelisted.account = event.params.member

    whitelisted.block = event.block.number
    whitelisted.timestamp = event.block.timestamp
    whitelisted.transaction = event.transaction.hash

    whitelisted.save()

    // Add member to whitelist
    let whitelist = token.whitelist

    if (!whitelist.includes(event.params.member)) {
      token.whitelist = whitelist.concat([event.params.member])

      token.save()
    }
  }
}

function getToken(address: Address): Token {
  let token = Token.load(address.toHexString())

  if (token == null) {
    let contract = NXMToken.bind(address)

    token = new Token(address.toHexString())
    token.operator = contract.operator()

    token.decimals = contract.decimals()
    token.name = contract.name()
    token.symbol = contract.symbol()

    token.eventCount = integer.ZERO
    token.approvalEventCount = integer.ZERO
    token.burnEventCount = integer.ZERO
    token.mintEventCount = integer.ZERO
    token.transferEventCount = integer.ZERO

    token.totalSupply = decimal.ZERO
    token.totalBurned = decimal.ZERO
    token.totalMinted = decimal.ZERO
    token.totalTransferred = decimal.ZERO

    token.whitelist = []
  }

  return token as Token
}
