
'use client';

import { PageHero } from "@/components/shared/page-hero";
import { Features } from "@/components/ui/features";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Lightbulb, Rocket, Users } from "lucide-react";

const founders = [
  {
    quote: "An ECE graduate with a passion for technology and real estate, Shahbaz leads the company's vision and strategy, ensuring Falcon Estates stays at the forefront of innovation.",
    name: "Shahbaz",
    designation: "Co-Founder & CEO",
    src: "https://placehold.co/500x500/6D28D9/FFFFFF/png?text=S",
  },
  {
    quote: "Also an ECE graduate, Farhaz is the technical architect behind the Falcon Estates platform. He is dedicated to building a seamless and secure user experience.",
    name: "Farhaz",
    designation: "Co-Founder & CTO",
    src: "https://placehold.co/500x500/1E2029/FFFFFF/png?text=F",
  }
];

const timelineEvents = [
  {
    year: "2022",
    title: "The Spark",
    description: "As ECE graduates, co-founders Shahbaz and Farhaz identified a gap in the market for a tech-driven, transparent, and user-friendly real estate platform in Delhi."
  },
  {
    year: "2023",
    title: "Building the Foundation",
    description: "Months of dedicated development and market research culminate in the first version of the Falcon Estates platform, focusing on a robust and secure user experience."
  },
  {
    year: "2024",
    title: "Official Launch",
    description: "Falcon Estates officially launches, offering a curated selection of properties and connecting buyers, sellers, and professionals across Delhi with a modern, efficient solution."
  },
   {
    year: "Present",
    title: "Growing Our Wings",
    description: "We continue to expand our services, enhance our technology, and grow our community, driven by our mission to simplify the real estate journey for everyone."
  }
];

const missionFeatures = [
    {
      id: 1,
      icon: Lightbulb,
      title: "Innovation",
      description: "Leveraging technology to create seamless and intelligent real estate solutions.",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=3540&auto=format&fit=crop",
    },
    {
      id: 2,
      icon: Users,
      title: "Community",
      description: "Building a network of trusted professionals and informed users.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=3540&auto=format&fit=crop",
    },
    {
      id: 3,
      icon: Rocket,
      title: "Excellence",
      description: "Striving for the highest standards in everything we do, from listings to customer support.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=3540&auto=format&fit=crop",
    },
];

export default function AboutUsPage() {
  return (
    <div className="bg-muted/40">
      <PageHero
        title="Our Story"
        subtitle="Discover the journey behind Falcon Estates and the values that drive us."
        image={{
          id: "contact-hero",
          imageHint: "team meeting",
        }}
      />
      
      <section className="py-16 md:py-24 bg-background">
        <Features 
            features={missionFeatures}
            primaryColor="primary"
            progressGradientLight="bg-gradient-to-r from-primary to-purple-500"
            progressGradientDark="bg-gradient-to-r from-primary to-purple-500"
        />
      </section>

      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Our Journey</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                From a shared vision to a growing platform.
              </p>
            </div>
            {/* Desktop Timeline */}
            <div className="relative hidden md:block">
                <div className="absolute left-1/2 h-full w-0.5 bg-border -translate-x-1/2"></div>
                {timelineEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-center my-16">
                        <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'pl-8'}`}>
                             {index % 2 === 0 && (
                                <>
                                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                                    <p className="text-muted-foreground mt-2">{event.description}</p>
                                </>
                            )}
                        </div>
                        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold z-10 shadow-lg shrink-0">
                            {event.year}
                        </div>
                         <div className={`w-5/12 ${index % 2 !== 0 ? 'pl-8' : 'text-left pr-8'}`}>
                            {index % 2 !== 0 && (
                                <>
                                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                                    <p className="text-muted-foreground mt-2">{event.description}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Timeline */}
            <div className="relative md:hidden">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-border"></div>
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-6 my-8">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold z-10 shadow-lg shrink-0">
                    {event.year}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                    <p className="text-muted-foreground mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Meet the Founders</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              The driving force behind Falcon Estates, united by a shared vision.
            </p>
          </div>
          <AnimatedTestimonials testimonials={founders} />
        </div>
      </section>
    </div>
  );
}
