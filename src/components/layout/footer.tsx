
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted partner in luxury living.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h3 className="font-semibold tracking-wider uppercase">Explore</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/properties" className="text-muted-foreground hover:text-foreground">Properties</Link></li>
                <li><Link href="/interiors" className="text-muted-foreground hover:text-foreground">Interiors</Link></li>
                <li><Link href="/services" className="text-muted-foreground hover:text-foreground">Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider uppercase">Connect</h3>
              <div className="flex mt-4 space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Farhaz Homes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

    