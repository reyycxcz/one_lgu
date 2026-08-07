"use client";

import Link from "next/link";
import { UserCircle, Lock, ShieldCheck, SignOut, CaretDown } from "@phosphor-icons/react/dist/ssr";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { signOut } from "@/actions/auth";

export function HeaderProfileMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 pl-3 border-l border-border hover:opacity-80 transition-opacity outline-none">
          <div className="text-right leading-none hidden sm:block">
            <p className="text-xs font-bold text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{email}</p>
          </div>
          <InitialsAvatar name={name} size={36} />
          <CaretDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2 border-b border-border mb-1">
          <p className="text-sm font-bold text-foreground truncate">{name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/lgu/profile" className="cursor-pointer">
            <UserCircle className="h-4 w-4" weight="duotone" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/lgu/profile/password" className="cursor-pointer">
            <Lock className="h-4 w-4" weight="duotone" />
            Change Password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/lgu/profile" className="cursor-pointer">
            <ShieldCheck className="h-4 w-4" weight="duotone" />
            Two-Factor Auth
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <SignOut className="h-4 w-4" weight="duotone" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
