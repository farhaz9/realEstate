
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const socialLinks = [
    { name: "Facebook", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg> },
    { name: "Instagram", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z" /></svg> },
    { name: "LinkedIn", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg> },
    { name: "Twitter", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.791 4.649-.69.188-1.423.23-2.162.084.616 1.923 2.394 3.315 4.491 3.355-1.711 1.33-3.882 2.011-6.195 1.745 2.189 1.407 4.795 2.229 7.621 2.229 9.141 0 14.153-7.58 13.841-14.432 .865-.62 1.611-1.4 2.205-2.283z"/></svg> }
];

export default function Footer() {
    return (
        <footer className="bg-primary/5 border-t">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4">
                        <div className="mb-6">
                             <div className="text-left lg:text-left">
                                <div className="text-3xl font-semibold tracking-wide text-black">
                                FALCON AXE
                                </div>

                                <div className="mt-1 text-xs tracking-[0.4em] text-purple-700">
                                HOMES
                                </div>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-md mx-0 lg:mx-0 text-left lg:text-left">
                           Discover Delhi's best real estate and interior design company. We offer luxury properties, bespoke interiors, and complete construction solutions in Delhi.
                        </p>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/properties" className="text-muted-foreground hover:text-primary">Properties</Link></li>
                            <li><Link href="/interiors" className="text-muted-foreground hover:text-primary">Interiors</Link></li>
                            <li><Link href="/services" className="text-muted-foreground hover:text-primary">Services</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>

                     <div className="lg:col-span-2">
                        <h3 className="font-bold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
                            <li><Link href="/refund-policy" className="text-muted-foreground hover:text-primary">Refund Policy</Link></li>
                             <li><Link href="/support" className="text-muted-foreground hover:text-primary">Support</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-4 text-center lg:text-left">
                        <h3 className="font-bold mb-4">Subscribe to our Newsletter</h3>
                        <p className="text-muted-foreground text-sm mb-4">Get the latest properties and news delivered to your inbox.</p>
                        <form className="flex items-center gap-2">
                            <Input type="email" placeholder="Enter your email" className="flex-grow" />
                            <Button type="submit">Subscribe</Button>
                        </form>
                         <div className="flex justify-center lg:justify-start gap-4 mt-6">
                            {socialLinks.map((link) => (
                                <Link key={link.name} href="#" className="text-muted-foreground hover:text-primary">
                                    {link.icon}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t">
                 <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Falcon Axe Homes. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}
