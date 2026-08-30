'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InitialsAvatar } from '@/components/shared/initials-avatar'

export interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<any>
  badge?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

interface SidebarProps {
  navGroups: NavGroup[]
  user?: { name?: string; role?: string; email?: string }
  appSubtitle?: string
  onLogout?: () => void
  // Fired when a (non-logout) nav link is clicked — lets a mobile drawer
  // wrapping this Sidebar close itself on navigation instead of staying
  // open over the newly-loaded page.
  onNavigate?: () => void
}

const SIDEBAR_W = 260

export function Sidebar({
  navGroups,
  user,
  appSubtitle = 'Dingras',
  onLogout,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      router.replace('/login')
    }
  }

  useEffect(() => {
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        router.prefetch(item.path)
      })
    })
  }, [router, navGroups])

  const [closedGroups, setClosedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) => {
    setClosedGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const userName = user?.name || 'Administrator'

  return (
    <div
      className="flex flex-col bg-white border-r border-sidebar-border flex-shrink-0 overflow-hidden h-full"
      style={{ width: SIDEBAR_W }}
    >
      {/* ─── Logo Header ─── */}
      <div className="flex items-center justify-center flex-shrink-0 border-b border-sidebar-border h-16 px-4 gap-2.5">
        <img
          src="/images/logo/o_icon.png"
          alt="OneLGU"
          className="object-contain flex-shrink-0 h-9 w-9"
        />
        <div className="min-w-0 leading-tight text-center">
          <p className="text-sm font-bold text-foreground tracking-wider whitespace-nowrap uppercase">
            ONELGU
          </p>
          <p className="text-[9px] text-green-700/70 font-semibold truncate uppercase tracking-widest mt-0.5">
            {appSubtitle}
          </p>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav
        data-lenis-prevent
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-2"
      >
        {navGroups.map((group) => {
          const isOpen = !closedGroups[group.label]
          return (
            <div key={group.label} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-1.5 bg-transparent border-0 cursor-pointer hover:bg-slate-50"
              >
                <span className="text-[10.5px] font-bold tracking-wider uppercase text-slate-400">
                  {group.label}
                </span>
                <ChevronDown
                  size={12}
                  className={cn(
                    'flex-shrink-0 text-slate-400 transition-transform duration-200',
                    isOpen ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>

              {/* Items */}
              {isOpen &&
                group.items.map(({ path, label, icon: Icon, badge }) => {
                  const active = isActive(path)
                  const isLogout = label === 'Logout'

                  return (
                    <Link
                      key={path}
                      href={path}
                      onClick={
                        isLogout
                          ? (e) => {
                              e.preventDefault()
                              handleLogout()
                            }
                          : onNavigate
                      }
                      className={cn(
                        'group relative flex items-center gap-2.5 no-underline rounded-lg text-[13.5px] overflow-hidden whitespace-nowrap mx-2 my-0.5 px-2.5 py-[7px] justify-start',
                        active
                          ? 'font-semibold text-slate-800 bg-slate-100'
                          : 'font-normal text-zinc-500 hover:bg-slate-50 hover:text-zinc-700'
                      )}
                    >
                      {/* Active indicator bar */}
                      {active && (
                        <div className="absolute left-0 top-1/5 bottom-1/5 w-[3px] rounded-r-[3px] bg-[#20AD66]" />
                      )}

                      {/* Icon */}
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0',
                          active ? 'bg-[#20AD66]/10' : 'bg-slate-100'
                        )}
                      >
                        <Icon
                          size={16}
                          className={active ? 'text-[#20AD66]' : 'text-zinc-500'}
                        />
                      </span>

                      {/* Label */}
                      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis">
                        {label}
                      </span>

                      {/* Badge */}
                      {badge && (
                        <span className="ml-auto text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded flex-shrink-0 bg-yellow-200 text-yellow-800 border border-yellow-300">
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}

              <div className="h-1" />
            </div>
          )
        })}
      </nav>

      {/* ─── Footer: User Card ─── */}
      <div className="flex items-center gap-2 flex-nowrap overflow-hidden flex-shrink-0 border-t border-slate-200 px-2.5 py-3 justify-start">
        <InitialsAvatar name={userName} size={28} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">
            {userName}
          </div>
          <div className="text-[10.5px] text-zinc-500">
            {user?.role || 'Super Admin'}
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center justify-center p-1 rounded-md flex-shrink-0 bg-transparent border-0 cursor-pointer text-zinc-500 hover:text-red-600 hover:bg-red-100"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}
