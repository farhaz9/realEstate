'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Mail, Phone, MapPin, MessageSquare, Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { sendEmail } from '@/app/actions/send-email';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { motion } from 'framer-motion';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full h-12 text-base" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
         <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
         </>
      )}
    </Button>
  );
}

export default function ContactPage() {
  const initialState = { success: false, message: '' };
  const [state, dispatch] = useActionState(sendEmail, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
          variant: 'success',
        });
        formRef.current?.reset();
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      content: "myfalconaxe@gmail.com",
      href: "mailto:myfalconaxe@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+91 8080248631",
      href: "tel:+918080248631",
    },
    {
      icon: WhatsAppIcon,
      title: "WhatsApp",
      content: "+91 8080248631",
      href: "https://wa.me/918080248631",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Get In Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you have a question about a property, our services, or anything else, our team is ready to answer all your questions.
            </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-2xl shadow-sm">
                <h2 className="text-3xl font-bold mb-6">Send a Message</h2>
                <form ref={formRef} action={dispatch} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Input name="name" placeholder="Your Name" required minLength={2} className="h-12 bg-muted border-transparent focus:bg-background" />
                        <Input name="email" type="email" placeholder="Your Email" required className="h-12 bg-muted border-transparent focus:bg-background" />
                    </div>
                  <Input name="subject" placeholder="Subject" required minLength={2} className="h-12 bg-muted border-transparent focus:bg-background" />
                  <Textarea name="message" placeholder="Your Message" rows={5} required minLength={10} className="bg-muted border-transparent focus:bg-background" />
                  <SubmitButton />
                </form>
            </div>
            <div className="space-y-8">
                 <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={cardVariants}
                    className="bg-card p-8 rounded-2xl shadow-sm"
                 >
                     <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                     <div className="space-y-6">
                        {contactMethods.map((method, index) => (
                            <a href={method.href} target="_blank" key={index} className="flex items-start gap-4 group">
                                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                                    <method.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">{method.title}</h4>
                                    <p className="text-muted-foreground group-hover:text-primary transition-colors">
                                        {method.content}
                                    </p>
                                </div>
                            </a>
                        ))}
                     </div>
                 </motion.div>
                 <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={cardVariants}
                    className="bg-card p-8 rounded-2xl shadow-sm"
                  >
                     <h3 className="text-2xl font-bold mb-6">Our Office</h3>
                     <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">Delhi, India</h4>
                            <p className="text-muted-foreground">Rohini, Delhi-110085, India</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
}
