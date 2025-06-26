"use client";

import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Menu, Pyramid } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/advisor", label: "Penasihat" },
  { href: "/news", label: "Berita" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Pyramid className="h-6 w-6 text-primary" />
            <span className="font-bold font-heading sm:inline-block">
              ForesightX
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <WalletConnectButton />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="mr-6 flex items-center space-x-2 mb-8"
                  >
                    <Pyramid className="h-6 w-6 text-primary" />
                    <span className="font-bold font-heading">
                      ForesightX
                    </span>
                  </Link>
                </SheetClose>
                <nav className="flex flex-col gap-6 text-lg font-medium">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "transition-colors hover:text-foreground/80",
                          pathname === link.href
                            ? "text-foreground"
                            : "text-foreground/60"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
