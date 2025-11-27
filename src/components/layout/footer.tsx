
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary via-primary/80 to-purple-900 text-primary-foreground">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-md p-2 inline-block">
              <Logo />
            </div>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Your trusted partner in luxury living.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary-foreground/80">Explore</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/properties" className="text-primary-foreground/90 hover:text-white">Properties</Link></li>
                <li><Link href="/interiors" className="text-primary-foreground/90 hover:text-white">Interiors</Link></li>
                <li><Link href="/services" className="text-primary-foreground/90 hover:text-white">Services</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary-foreground/80">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/#faq" className="text-primary-foreground/90 hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="text-primary-foreground/90 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold tracking-wider uppercase text-primary-foreground/80">Connect</h3>
              <div className="flex mt-4 space-x-4">
                <Link href="#" className="text-primary-foreground/90 hover:text-white"><Twitter className="h-5 w-5" /></Link>
                <Link href="#" className="text-primary-foreground/90 hover:text-white"><Linkedin className="h-5 w-5" /></Link>
                <Link href="#" className="text-primary-foreground/90 hover:text-white"><Github className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} Farhaz Homes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
