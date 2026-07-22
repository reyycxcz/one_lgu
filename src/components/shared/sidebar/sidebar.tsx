'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  collapsed?: boolean
  onToggle?: () => void
  user?: { name?: string; role?: string; email?: string }
  logoSrc?: string
  appTitle?: string
  appSubtitle?: string
  onLogout?: () => void
}

export function Sidebar({
  navGroups,
  collapsed = false,
  onToggle,
  user,
  appTitle = 'ONELGU',
  appSubtitle = 'Dingras',
  onLogout,
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

  const [openGroups, setOpenGroups] = useState(() =>
    navGroups.reduce(
      (acc, g) => ({ ...acc, [g.label]: true }),
      {} as Record<string, boolean>
    )
  )

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div
      className="flex flex-col bg-white border-r border-sidebar-border flex-shrink-0 overflow-hidden will-change-[width] h-full"
      style={{
        width: collapsed ? 68 : 260,
        transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ─── Logo + Collapse Toggle ─── */}
      <div
        className={cn(
          'flex items-center flex-shrink-0 transition-all duration-200 border-b border-sidebar-border py-3',
          collapsed ? 'flex-col gap-2 px-0' : 'gap-3 px-6'
        )}
      >
        <img 
          src="/images/logo/one_lgu.png" 
          alt="OneLGU Logo" 
          className="w-10 h-10 object-contain flex-shrink-0" 
        />
        <div
          className={cn(
            'min-w-0 leading-tight transition-all duration-200 ease-in-out',
            collapsed
              ? 'opacity-0 w-0 pointer-events-none select-none overflow-hidden'
              : 'opacity-100 flex-1'
          )}
        >
          <p className="text-base font-bold text-foreground tracking-wider whitespace-nowrap font-sans uppercase">
            {appTitle}
          </p>
          <p className="text-[10px] text-primary/70 font-semibold truncate uppercase mt-0.5 whitespace-nowrap tracking-widest font-sans">
            {appSubtitle}
          </p>
        </div>
        {!collapsed && onToggle && (
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="flex items-center justify-center rounded-lg text-foreground/40 hover:bg-slate-100 hover:text-foreground transition-colors w-7 h-7 flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {collapsed && onToggle && (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="flex items-center justify-center rounded-lg text-foreground/40 hover:bg-slate-100 hover:text-foreground transition-colors w-7 h-7 flex-shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav
        data-lenis-prevent
        className="flex-1 py-6 px-4 space-y-6 overflow-x-hidden min-h-0"
        style={{ overflowY: collapsed ? 'hidden' : 'auto' }}
      >
        {navGroups.map((group) => {
          const isOpen = openGroups[group.label]
          return (
            <div key={group.label} className="space-y-2">
              <div className="relative">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'flex items-center justify-between w-full px-2 text-[10px] font-bold tracking-widest uppercase text-foreground/45 font-sans transition-all duration-150',
                    collapsed
                      ? 'h-0 opacity-0 pointer-events-none overflow-hidden mb-0'
                      : 'h-6 opacity-100 mb-1'
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={10}
                    className={cn(
                      'transition-transform duration-200 flex-shrink-0',
                      isOpen ? 'rotate-0' : '-rotate-90'
                    )}
                  />
                </button>

                {/* Divider (visible when collapsed) */}
                <div
                  className={cn(
                    'h-px bg-sidebar-border transition-all duration-150',
                    collapsed
                      ? 'my-3 mx-1 opacity-100'
                      : 'h-0 my-0 opacity-0 overflow-hidden'
                  )}
                />
              </div>

              <div
                className={cn(
                  'space-y-1.5 overflow-hidden transition-all duration-200',
                  !collapsed && !isOpen && 'max-h-0 opacity-0',
                  (collapsed || isOpen) && 'max-h-[800px] opacity-100'
                )}
              >
                {group.items.map(({ path, label, icon: Icon, badge }) => {
                  const active = isActive(path)
                  const isLogout = label === 'Logout'
                  return (
                    <Link
                      key={path}
                      href={path}
                      title={collapsed ? label : undefined}
                      onClick={
                        isLogout
                          ? (e) => {
                              e.preventDefault()
                              handleLogout()
                            }
                          : undefined
                      }
                      className={cn(
                        'group relative flex items-center w-full rounded-md text-sm font-semibold transition-all duration-150',
                        collapsed
                          ? 'px-2.5 py-2.5 justify-center'
                          : 'px-3 py-2.5 gap-3',
                        active
                          ? 'text-white border-t border-white/40 border-b-2 border-b-black/20 bg-gradient-to-br from-[#20AD66] to-[#0B5A30]'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                      style={
                        active
                          ? {
                              boxShadow:
                                'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 6px rgba(11,90,48,0.35)',
                            }
                          : undefined
                      }
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                          active ? 'bg-white/15' : 'bg-sidebar-accent/50 group-hover:bg-sidebar-accent'
                        )}
                      >
                        <Icon
                          size={17}
                          weight={active ? 'fill' : 'duotone'}
                          className={active ? 'text-white' : 'text-sidebar-foreground/65'}
                        />
                      </span>
                      <span
                        className={cn(
                          'text-left truncate transition-all duration-200 ease-in-out whitespace-nowrap font-sans text-xs tracking-wide',
                          collapsed
                            ? 'opacity-0 w-0 pointer-events-none select-none overflow-hidden'
                            : 'opacity-100 flex-1'
                        )}
                      >
                        {label}
                      </span>
                      {badge && !collapsed && (
                        <span className="ml-auto text-[9px] font-extrabold tracking-wider text-primary bg-secondary px-1.5 py-0.5 rounded uppercase leading-none border border-primary/10">
                          {badge}
                        </span>
                      )}
                      {!active && !collapsed && (
                        <ChevronRight size={12} className="opacity-30 flex-shrink-0 ml-auto" />
                      )}
                      {badge && collapsed && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ─── Footer: Profile Card ─── */}
      <div className="p-3 border-t border-sidebar-border bg-slate-50/30">
        {collapsed ? (
          <div className="flex flex-col gap-3 items-center justify-center py-2">
            <img 
              src={`https://api.dicebear.com/10.x/open-peeps/svg?seed=${user?.name || 'User'}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-sidebar-border cursor-pointer hover:opacity-90"
              onClick={handleLogout}
              title="Logout"
            />
          </div>
        ) : (
          <div
            className="relative overflow-hidden text-white p-4 rounded-2xl space-y-4 flex flex-col justify-between border-t border-white/40 border-x border-x-black/10 border-b-2 border-b-black/25 backdrop-blur-xl bg-gradient-to-br from-[#22B36B] via-[#0F8A4E] to-[#0A5C32]"
            style={{
              boxShadow:
                "0 10px 28px rgba(9,60,34,0.45), inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {/* glossy top highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
            {/* soft light bloom */}
            <div className="pointer-events-none absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/25 blur-2xl" />

            <div className="relative space-y-1">
              <span className="text-[8px] font-bold text-emerald-100 uppercase tracking-widest block font-sans">
                {appSubtitle === 'Ilocos Norte' ? 'MUNICIPAL HALL' : 'BARANGAY HALL'}
              </span>
              <h5 className="font-sans font-bold text-sm leading-tight text-white truncate">
                {user?.name || 'LGU Administrator'}
              </h5>
              <p className="text-[10px] text-emerald-100/80 font-medium truncate">
                {user?.role || 'Super Admin'}
              </p>
            </div>

            <div className="relative flex items-center justify-between pt-2 border-t border-white/20">
              <Link
                href={appSubtitle === 'Ilocos Norte' ? '/lgu/profile' : '/barangay/profile'}
                className="text-[9px] font-bold tracking-wider uppercase text-emerald-100 hover:text-white flex items-center gap-1 transition-colors"
              >
                View Profile <ArrowRight size={10} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-[9px] font-bold tracking-wider uppercase text-red-200 hover:text-red-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
