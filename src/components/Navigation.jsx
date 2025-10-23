'use client'

import clsx from 'clsx'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

import { Button } from '@/components/Button'
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { useSectionStore } from '@/components/SectionProvider'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'
import { CloseButton } from '@headlessui/react'

function useInitialValue(value, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({ href, children }) {
  return (
    <li className="md:hidden">
      <CloseButton
        as={Link}
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </CloseButton>
    </li>
  )
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
}) {
  return (
    <CloseButton
      as={Link}
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </CloseButton>
  )
}

function VisibleSectionHighlight({ group, pathname }) {
  let [sections, visibleSections] = useInitialValue(
    [
      useSectionStore((s) => s.sections),
      useSectionStore((s) => s.visibleSections),
    ],
    useIsInsideMobileNavigation(),
  )

  let isPresent = useIsPresent()
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0],
    ),
  )
  let itemHeight = remToPx(2)
  let height = isPresent
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height, top }}
    />
  )
}

function ActivePageMarker({ group, pathname }) {
  let itemHeight = remToPx(2)
  let offset = remToPx(0.25)
  let activePageIndex = group.links.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-emerald-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({ group, className }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [pathname, sections] = useInitialValue(
    [usePathname(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation,
  )

  let isActiveGroup =
    group.links.findIndex((link) => link.href === pathname) !== -1

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}
                  >
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink
                          href={`${link.href}#${section.id}`}
                          tag={section.tag}
                          isAnchorLink
                        >
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export const navigation = [
  {
    title: 'Guides',
    links: [
      { title: 'Quickstart', href: '/quickstart' },
      { title: 'Authentication', href: '/authentication' },

    ],
  },
  {
  title: 'Endpoints',
  links: [
    { title: 'Active Addresses', href: '/endpoints/active-addresses' },
    { title: 'Active Receiving Addresses', href: '/endpoints/active-receiving-addresses' },
    { title: 'Active Sending Addresses', href: '/endpoints/active-sending-addresses' },
    { title: 'Adjusted Sopr', href: '/endpoints/adjusted-sopr' },
    { title: 'Average Cap', href: '/endpoints/average-cap' },
    { title: 'Average Dormancy', href: '/endpoints/average-dormancy' },
    { title: 'Average Sa Cdd', href: '/endpoints/average-sa-cdd' },
    { title: 'Binary Cdd', href: '/endpoints/binary-cdd' },
    { title: 'Block Interval', href: '/endpoints/block-interval' },
    { title: 'Block Rewards', href: '/endpoints/block-rewards' },
    { title: 'Block Rewards Usd', href: '/endpoints/block-rewards-usd' },
    { title: 'Block Size', href: '/endpoints/block-size' },
    { title: 'Blocks Mined', href: '/endpoints/blocks-mined' },
    { title: 'Cdd', href: '/endpoints/cdd' },
    { title: 'Coinbase Premium Gap', href: '/endpoints/coinbase-premium-gap' },
    { title: 'Coinbase Premium Index', href: '/endpoints/coinbase-premium-index' },
    { title: 'Delta Cap', href: '/endpoints/delta-cap' },
    { title: 'Difficulty', href: '/endpoints/difficulty' },
    { title: 'Estimated Leverage Ratio', href: '/endpoints/estimated-leverage-ratio' },
    { title: 'Exchange Depositing Addresses', href: '/endpoints/exchange-depositing-addresses' },
    { title: 'Exchange Depositing Transactions', href: '/endpoints/exchange-depositing-transactions' },
    { title: 'Exchange Inflow Age Bands', href: '/endpoints/exchange-inflow-age-bands' },
    { title: 'Exchange Inflow Age Bands Percent', href: '/endpoints/exchange-inflow-age-bands-percent' },
    { title: 'Exchange Inflow Cdd', href: '/endpoints/exchange-inflow-cdd' },
    { title: 'Exchange Inflow Mean', href: '/endpoints/exchange-inflow-mean' },
    { title: 'Exchange Inflow Mean Ma7', href: '/endpoints/exchange-inflow-mean-ma7' },
    { title: 'Exchange Inflow Top10', href: '/endpoints/exchange-inflow-top10' },
    { title: 'Exchange Inflow Total', href: '/endpoints/exchange-inflow-total' },
    { title: 'Exchange Inflow Value Bands', href: '/endpoints/exchange-inflow-value-bands' },
    { title: 'Exchange Inflow Value Bands Percent', href: '/endpoints/exchange-inflow-value-bands-percent' },
    { title: 'Exchange Inhouse Flow Mean', href: '/endpoints/exchange-inhouse-flow-mean' },
    { title: 'Exchange Inhouse Flow Total', href: '/endpoints/exchange-inhouse-flow-total' },
    { title: 'Exchange Inhouse Transactions', href: '/endpoints/exchange-inhouse-transactions' },
    { title: 'Exchange Netflow Total', href: '/endpoints/exchange-netflow-total' },
    { title: 'Exchange Outflow Mean', href: '/endpoints/exchange-outflow-mean' },
    { title: 'Exchange Outflow Mean Ma7', href: '/endpoints/exchange-outflow-mean-ma7' },
    { title: 'Exchange Outflow Top10', href: '/endpoints/exchange-outflow-top10' },
    { title: 'Exchange Outflow Total', href: '/endpoints/exchange-outflow-total' },
    { title: 'Exchange Reserve', href: '/endpoints/exchange-reserve' },
    { title: 'Exchange Reserve Usd', href: '/endpoints/exchange-reserve-usd' },
    { title: 'Exchange Shutdown Index', href: '/endpoints/exchange-shutdown-index' },
    { title: 'Exchange Stablecoins Ratio', href: '/endpoints/exchange-stablecoins-ratio' },
    { title: 'Exchange Stablecoins Ratio Combined', href: '/endpoints/exchange-stablecoins-ratio-combined' },
    { title: 'Exchange Stablecoins Ratio Usd', href: '/endpoints/exchange-stablecoins-ratio-usd' },
    { title: 'Exchange To Exchange Flow Mean', href: '/endpoints/exchange-to-exchange-flow-mean' },
    { title: 'Exchange To Exchange Flow Total', href: '/endpoints/exchange-to-exchange-flow-total' },
    { title: 'Exchange To Exchange Transactions', href: '/endpoints/exchange-to-exchange-transactions' },
    { title: 'Exchange To Miner Flow Mean', href: '/endpoints/exchange-to-miner-flow-mean' },
    { title: 'Exchange To Miner Flow Total', href: '/endpoints/exchange-to-miner-flow-total' },
    { title: 'Exchange To Miner Transactions', href: '/endpoints/exchange-to-miner-transactions' },
    { title: 'Exchange Whale Ratio', href: '/endpoints/exchange-whale-ratio' },
    { title: 'Exchange Withdrawing Addresses', href: '/endpoints/exchange-withdrawing-addresses' },
    { title: 'Exchange Withdrawing Transactions', href: '/endpoints/exchange-withdrawing-transactions' },
    { title: 'Fees Per Block Mean', href: '/endpoints/fees-per-block-mean' },
    { title: 'Fees Per Block Mean Usd', href: '/endpoints/fees-per-block-mean-usd' },
    { title: 'Fees Per Transaction Mean', href: '/endpoints/fees-per-transaction-mean' },
    { title: 'Fees Per Transaction Mean Usd', href: '/endpoints/fees-per-transaction-mean-usd' },
    { title: 'Fees Per Transaction Median', href: '/endpoints/fees-per-transaction-median' },
    { title: 'Fees Per Transaction Median Usd', href: '/endpoints/fees-per-transaction-median-usd' },
    { title: 'Fees To Reward Ratio', href: '/endpoints/fees-to-reward-ratio' },
    { title: 'Fees Total', href: '/endpoints/fees-total' },
    { title: 'Fees Total Usd', href: '/endpoints/fees-total-usd' },
    { title: 'Fund Flow Ratio', href: '/endpoints/fund-flow-ratio' },
    { title: 'Fund Holdings', href: '/endpoints/fund-holdings' },
    { title: 'Fund Market Premium', href: '/endpoints/fund-market-premium' },
    { title: 'Fund Price Usd', href: '/endpoints/fund-price-usd' },
    { title: 'Fund Volume', href: '/endpoints/fund-volume' },
    { title: 'Funding Rates', href: '/endpoints/funding-rates' },
    { title: 'Hashrate', href: '/endpoints/hashrate' },
    { title: 'Long Liquidations', href: '/endpoints/long-liquidations' },
    { title: 'Long Liquidations Usd', href: '/endpoints/long-liquidations-usd' },
    { title: 'Long Term Holder Sopr', href: '/endpoints/long-term-holder-sopr' },
    { title: 'Market Cap', href: '/endpoints/market-cap' },
    { title: 'Mean Coin Age', href: '/endpoints/mean-coin-age' },
    { title: 'Mean Coin Dollar Age', href: '/endpoints/mean-coin-dollar-age' },
    { title: 'Miner Depositing Addresses', href: '/endpoints/miner-depositing-addresses' },
    { title: 'Miner Depositing Transactions', href: '/endpoints/miner-depositing-transactions' },
    { title: 'Miner In House Flow Mean', href: '/endpoints/miner-in-house-flow-mean' },
    { title: 'Miner In House Flow Total', href: '/endpoints/miner-in-house-flow-total' },
    { title: 'Miner In House Transactions', href: '/endpoints/miner-in-house-transactions' },
    { title: 'Miner Inflow Mean', href: '/endpoints/miner-inflow-mean' },
    { title: 'Miner Inflow Mean Ma7', href: '/endpoints/miner-inflow-mean-ma7' },
    { title: 'Miner Inflow Top10', href: '/endpoints/miner-inflow-top10' },
    { title: 'Miner Inflow Total', href: '/endpoints/miner-inflow-total' },
    { title: 'Miner Netflow Total', href: '/endpoints/miner-netflow-total' },
    { title: 'Miner Outflow Mean', href: '/endpoints/miner-outflow-mean' },
    { title: 'Miner Outflow Mean Ma7', href: '/endpoints/miner-outflow-mean-ma7' },
    { title: 'Miner Outflow Top10', href: '/endpoints/miner-outflow-top10' },
    { title: 'Miner Outflow Total', href: '/endpoints/miner-outflow-total' },
    { title: 'Miner Reserve', href: '/endpoints/miner-reserve' },
    { title: 'Miner Reserve Usd', href: '/endpoints/miner-reserve-usd' },
    { title: 'Miner Supply Ratio', href: '/endpoints/miner-supply-ratio' },
    { title: 'Miner To Exchange Flow Mean', href: '/endpoints/miner-to-exchange-flow-mean' },
    { title: 'Miner To Exchange Flow Total', href: '/endpoints/miner-to-exchange-flow-total' },
    { title: 'Miner To Exchange Transactions', href: '/endpoints/miner-to-exchange-transactions' },
    { title: 'Miner To Miner Flow Mean', href: '/endpoints/miner-to-miner-flow-mean' },
    { title: 'Miner To Miner Flow Total', href: '/endpoints/miner-to-miner-flow-total' },
    { title: 'Miner To Miner Transactions', href: '/endpoints/miner-to-miner-transactions' },
    { title: 'Miner Withdrawing Addresses', href: '/endpoints/miner-withdrawing-addresses' },
    { title: 'Miner Withdrawing Transactions', href: '/endpoints/miner-withdrawing-transactions' },
    { title: 'Miners Position Index', href: '/endpoints/miners-position-index' },
    { title: 'Mvrv Ratio', href: '/endpoints/mvrv-ratio' },
    { title: 'Net Realized Pnl', href: '/endpoints/net-realized-pnl' },
    { title: 'Net Unrealized Loss', href: '/endpoints/net-unrealized-loss' },
    { title: 'Net Unrealized Pl', href: '/endpoints/net-unrealized-pl' },
    { title: 'Net Unrealized Profit', href: '/endpoints/net-unrealized-profit' },
    { title: 'New Supply', href: '/endpoints/new-supply' },
    { title: 'Nvm Ratio', href: '/endpoints/nvm-ratio' },
    { title: 'Nvt Golden Cross', href: '/endpoints/nvt-golden-cross' },
    { title: 'Nvt Ratio', href: '/endpoints/nvt-ratio' },
    { title: 'Open Interest', href: '/endpoints/open-interest' },
    { title: 'Price Ohlcv', href: '/endpoints/price-ohlcv' },
    { title: 'Puell Multiple', href: '/endpoints/puell-multiple' },
    { title: 'Realized Cap', href: '/endpoints/realized-cap' },
    { title: 'Realized Cap Utxo Age Bands', href: '/endpoints/realized-cap-utxo-age-bands' },
    { title: 'Realized Cap Utxo Age Bands Usd', href: '/endpoints/realized-cap-utxo-age-bands-usd' },
    { title: 'Realized Cap Utxo Value Bands', href: '/endpoints/realized-cap-utxo-value-bands' },
    { title: 'Realized Cap Utxo Value Bands Usd', href: '/endpoints/realized-cap-utxo-value-bands-usd' },
    { title: 'Realized Price', href: '/endpoints/realized-price' },
    { title: 'Realized Price Utxo Age Bands', href: '/endpoints/realized-price-utxo-age-bands' },
    { title: 'Short Liquidations', href: '/endpoints/short-liquidations' },
    { title: 'Short Liquidations Usd', href: '/endpoints/short-liquidations-usd' },
    { title: 'Sopr', href: '/endpoints/sopr' },
    { title: 'Sopr Ratio', href: '/endpoints/sopr-ratio' },
    { title: 'Spent Output Age Bands', href: '/endpoints/spent-output-age-bands' },
    { title: 'Spent Output Age Bands Percent', href: '/endpoints/spent-output-age-bands-percent' },
    { title: 'Spent Output Age Bands Usd', href: '/endpoints/spent-output-age-bands-usd' },
    { title: 'Spent Output Value Bands', href: '/endpoints/spent-output-value-bands' },
    { title: 'Spent Output Value Bands Percent', href: '/endpoints/spent-output-value-bands-percent' },
    { title: 'Spent Output Value Bands Usd', href: '/endpoints/spent-output-value-bands-usd' },
    { title: 'Stablecoin Supply Ratio', href: '/endpoints/stablecoin-supply-ratio' },
    { title: 'Sth Sopr', href: '/endpoints/sth-sopr' },
    { title: 'Stock To Flow', href: '/endpoints/stock-to-flow' },
    { title: 'Stock To Flow Reversion', href: '/endpoints/stock-to-flow-reversion' },
    { title: 'Sum Coin Age', href: '/endpoints/sum-coin-age' },
    { title: 'Sum Coin Age Distribution', href: '/endpoints/sum-coin-age-distribution' },
    { title: 'Sum Coin Age Distribution Percent', href: '/endpoints/sum-coin-age-distribution-percent' },
    { title: 'Sum Coin Dollar Age', href: '/endpoints/sum-coin-dollar-age' },
    { title: 'Supply Adjusted Cdd', href: '/endpoints/supply-adjusted-cdd' },
    { title: 'Supply Adjusted Dormancy', href: '/endpoints/supply-adjusted-dormancy' },
    { title: 'Supply In Loss', href: '/endpoints/supply-in-loss' },
    { title: 'Supply In Loss Percent', href: '/endpoints/supply-in-loss-percent' },
    { title: 'Supply In Profit', href: '/endpoints/supply-in-profit' },
    { title: 'Supply In Profit Percent', href: '/endpoints/supply-in-profit-percent' },
    { title: 'Taker Buy Ratio', href: '/endpoints/taker-buy-ratio' },
    { title: 'Taker Buy Sell Ratio', href: '/endpoints/taker-buy-sell-ratio' },
    { title: 'Taker Buy Volume', href: '/endpoints/taker-buy-volume' },
    { title: 'Taker Sell Ratio', href: '/endpoints/taker-sell-ratio' },
    { title: 'Taker Sell Volume', href: '/endpoints/taker-sell-volume' },
    { title: 'Thermo Cap', href: '/endpoints/thermo-cap' },
    { title: 'Tokens Transferred Mean', href: '/endpoints/tokens-transferred-mean' },
    { title: 'Tokens Transferred Median', href: '/endpoints/tokens-transferred-median' },
    { title: 'Tokens Transferred Total', href: '/endpoints/tokens-transferred-total' },
    { title: 'Total Supply', href: '/endpoints/total-supply' },
    { title: 'Transaction Count Mean', href: '/endpoints/transaction-count-mean' },
    { title: 'Transaction Count Total', href: '/endpoints/transaction-count-total' },
    { title: 'Utxo Age Bands', href: '/endpoints/utxo-age-bands' },
    { title: 'Utxo Age Bands Percent', href: '/endpoints/utxo-age-bands-percent' },
    { title: 'Utxo Age Bands Usd', href: '/endpoints/utxo-age-bands-usd' },
    { title: 'Utxo Count', href: '/endpoints/utxo-count' },
    { title: 'Utxo Count Age Bands', href: '/endpoints/utxo-count-age-bands' },
    { title: 'Utxo Count Age Bands Percent', href: '/endpoints/utxo-count-age-bands-percent' },
    { title: 'Utxo Count Value Bands', href: '/endpoints/utxo-count-value-bands' },
    { title: 'Utxo Count Value Bands Percent', href: '/endpoints/utxo-count-value-bands-percent' },
    { title: 'Utxo Value Bands', href: '/endpoints/utxo-value-bands' },
    { title: 'Utxo Value Bands Percent', href: '/endpoints/utxo-value-bands-percent' },
    { title: 'Utxos In Loss', href: '/endpoints/utxos-in-loss' },
    { title: 'Utxos In Loss Percent', href: '/endpoints/utxos-in-loss-percent' },
    { title: 'Utxos In Profit', href: '/endpoints/utxos-in-profit' },
    { title: 'Utxos In Profit Percent', href: '/endpoints/utxos-in-profit-percent' },
    { title: 'Velocity', href: '/endpoints/velocity' },
  ],
},

]

export function Navigation(props) {
  return (
    <nav {...props}>
      <ul role="list">       
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
