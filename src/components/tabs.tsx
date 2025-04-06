'use client'

import * as Headless from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import React, { Fragment } from 'react'

export type Tab = {
  name: string
  value: string
  current?: boolean
}

export function Tabs({
  tabs,
  onChange,
  className,
  vertical = false,
  defaultValue,
}: {
  tabs: Tab[]
  onChange?: (tabValue: string) => void
  className?: string
  vertical?: boolean
  defaultValue?: string
}) {
  const [selectedTab, setSelectedTab] = React.useState<string>(() => {
    if (defaultValue) return defaultValue
    const currentTab = tabs.find((tab) => tab.current)
    return currentTab ? currentTab.value : tabs[0]?.value || ''
  })

  const handleTabChange = (value: string) => {
    setSelectedTab(value)
    onChange?.(value)
  }

  const selectedTabName = tabs.find((tab) => tab.value === selectedTab)?.name || ''

  return (
    <div className={className}>
      {/* Mobile dropdown version */}
      <div className="grid grid-cols-1 sm:hidden">
        <Headless.Listbox value={selectedTab} onChange={handleTabChange}>
          <div className="relative">
            <Headless.ListboxButton className="w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-zinc-800 dark:text-white dark:outline-zinc-700">
              <span className="block truncate">{selectedTabName}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </span>
            </Headless.ListboxButton>

            <Headless.Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Headless.ListboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none dark:bg-zinc-800 dark:ring-zinc-700">
                {tabs.map((tab) => (
                  <Headless.ListboxOption
                    key={tab.value}
                    value={tab.value}
                    className={({ focus }) =>
                      clsx(
                        'relative cursor-default py-2 pr-9 pl-3 select-none',
                        focus ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                      )
                    }
                  >
                    {({ selected, focus }) => (
                      <>
                        <span className={clsx('block truncate', selected ? 'font-medium' : 'font-normal')}>
                          {tab.name}
                        </span>
                      </>
                    )}
                  </Headless.ListboxOption>
                ))}
              </Headless.ListboxOptions>
            </Headless.Transition>
          </div>
        </Headless.Listbox>
      </div>

      {/* Desktop tabs version */}
      <div className="hidden sm:block">
        <nav aria-label="Tabs" className={clsx('flex', vertical ? 'flex-col space-y-2' : 'space-x-4')}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              aria-current={tab.value === selectedTab ? 'page' : undefined}
              className={clsx(
                tab.value === selectedTab
                  ? 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200'
                  : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300',
                'rounded-md px-3 py-2 text-sm font-medium'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export function TabPanels({
  children,
  selectedValue,
  className,
}: {
  children: React.ReactNode
  selectedValue: string
  className?: string
}) {
  return (
    <div className={clsx('mt-4', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            selectedValue,
          } as any)
        }
        return child
      })}
    </div>
  )
}

export function TabPanel({
  children,
  value,
  selectedValue,
  className,
}: {
  children: React.ReactNode
  value: string
  selectedValue?: string
  className?: string
}) {
  if (value !== selectedValue) {
    return null
  }

  return <div className={className}>{children}</div>
}
