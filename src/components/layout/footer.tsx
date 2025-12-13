
import Link from "next/link";
import { Building2, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const socialLinks = [
    { name: "Facebook", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg> },
    { name: "Instagram", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z" /></svg> },
    { name: "LinkedIn", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg> },
    { name: "Twitter", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.406 3.951 4.868-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.588-7.52 2.588-.49 0-.974-.03-1.455-.086 2.679 1.743 5.858 2.76 9.24 2.76 10.21 0 15.378-8.287 15.378-14.945 0-.227-.005-.453-.014-.678.987-.712 1.83-1.6 2.52-2.613z"/></svg> },
];

export default function Footer() {
  return (
    <footer className="bg-background dark:bg-card border-t border-border pt-16 pb-8 text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-muted/30 dark:bg-white/5 p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-10 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full lg:w-auto">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-primary">
                  <MapPin />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-foreground text-sm font-bold">Visit Us</h4>
                  <p className="text-muted-foreground text-sm">123 Design Avenue,<br/>Creative City, NY 10012</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-primary">
                  <Mail />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-foreground text-sm font-bold">Contact</h4>
                  <a className="text-muted-foreground text-sm hover:text-primary transition-colors" href="mailto:hello@estately.com">hello@estately.com</a>
                  <a className="text-muted-foreground text-sm hover:text-primary transition-colors" href="tel:+15551234567">+1 (555) 123-4567</a>
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-md">
              <h4 className="text-foreground text-sm font-bold mb-2">Subscribe to our newsletter</h4>
              <div className="flex w-full items-stretch rounded-lg h-12">
                <Input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-background dark:bg-card placeholder:text-muted-foreground px-4 text-sm" placeholder="Email address"/>
                <Button className="cursor-pointer items-center justify-center overflow-hidden rounded-r-lg px-6 bg-primary hover:bg-primary/90 transition-colors text-primary-foreground text-sm font-bold tracking-[0.015em]">
                    Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Latest market trends sent directly to your inbox.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2 w-fit">
                <Building2 className="text-primary h-8 w-8"/>
                <h2 className="text-foreground text-2xl font-black tracking-tight">Estately</h2>
              </Link>
              <p className="text-muted-foreground text-base font-normal leading-relaxed max-w-sm">
                  Designing dreams, building futures. Premium real estate and interior design solutions tailored to your unique lifestyle.
              </p>
            </div>
            <div className="flex gap-3">
                {socialLinks.map(link => (
                    <a key={link.name} aria-label={link.name} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 dark:bg-white/5 text-muted-foreground hover:bg-primary hover:text-white transition-all duration-200" href="#">
                        {link.icon}
                    </a>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-foreground text-xs font-bold uppercase tracking-wider mb-2">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">About Us</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Careers</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Press</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Blog</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-foreground text-xs font-bold uppercase tracking-wider mb-2">Services</h3>
            <ul className="flex flex-col gap-3">
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/interiors">Interior Design</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/properties">Property Listing</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/services">Renovation</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/contact">Consultation</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-foreground text-xs font-bold uppercase tracking-wider mb-2">Support</h3>
            <ul className="flex flex-col gap-3">
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/contact">Help Center</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/terms-and-conditions">Terms of Service</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link className="text-muted-foreground hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="/#contact-faq">FAQs</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-muted-foreground text-sm font-normal">
              © 2024 Estately. All rights reserved.
          </p>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link className="text-muted-foreground hover:text-primary text-sm font-normal transition-colors" href="/sitemap">Sitemap</Link>
            <Link className="text-muted-foreground hover:text-primary text-sm font-normal transition-colors" href="#">Cookies Settings</Link>
            <Link className="text-muted-foreground hover:text-primary text-sm font-normal transition-colors" href="/terms-and-conditions">Terms</Link>
            <Link className="text-muted-foreground hover:text-primary text-sm font-normal transition-colors" href="/privacy-policy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

    