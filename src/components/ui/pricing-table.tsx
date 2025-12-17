
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckIcon, ArrowRightIcon, Cross1Icon } from "@radix-ui/react-icons"

export type PlanLevel = "starter" | "pro" | "all" | string

export interface PricingFeature {
  name: string
  included: PlanLevel | null
}

export interface PricingPlan {
  name: string
  description?: string;
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
}

export interface PricingTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  features: PricingFeature[]
  plans: PricingPlan[]
  onPlanSelect?: (plan: PlanLevel) => void
  defaultPlan?: PlanLevel
  defaultInterval?: "monthly" | "yearly"
  containerClassName?: string
  buttonClassName?: string
}

export function PricingTable({
  features,
  plans,
  onPlanSelect,
  defaultPlan = "pro",
  defaultInterval = "monthly",
  className,
  containerClassName,
  buttonClassName,
  ...props
}: PricingTableProps) {
  const [isYearly, setIsYearly] = React.useState(defaultInterval === "yearly")
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>(defaultPlan)

  const handlePlanSelect = (plan: PlanLevel) => {
    setSelectedPlan(plan)
    onPlanSelect?.(plan)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0",
      )}
    >
      <div
        className={cn("w-full max-w-4xl mx-auto px-4", containerClassName)}
        {...props}
      >
        <div className="flex justify-end mb-8">
            <div
                className="relative mx-auto grid w-fit grid-cols-2 rounded-full border bg-muted p-1"
            >
                <div
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute inset-1 w-[calc(50%-4px)] rounded-full bg-primary shadow ring-1 ring-black/5 transition-transform duration-500 ease-in-out',
                        isYearly ? "translate-x-full" : "translate-x-0"
                    )}
                />
                <button
                    className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                    onClick={() => setIsYearly(false)}
                    type="button"
                >
                    <span className={cn(!isYearly ? 'text-primary-foreground' : 'text-foreground')}>Monthly</span>
                </button>
                <button
                    className="relative duration-500 rounded-full h-8 w-24 text-sm hover:opacity-75"
                    onClick={() => setIsYearly(true)}
                    type="button"
                >
                    <span className={cn(isYearly ? 'text-primary-foreground' : 'text-foreground')}>Annually</span>
                </button>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => handlePlanSelect(plan.level)}
              className={cn(
                "flex-1 p-4 rounded-xl text-left transition-all",
                "border",
                selectedPlan === plan.level &&
                  "ring-2 ring-primary border-primary",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{plan.name}</span>
                {plan.popular && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>
               {plan.description && (
                <p className="text-xs text-muted-foreground mb-2">{plan.description}</p>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {formatPrice(
                    isYearly ? plan.price.yearly : plan.price.monthly,
                  )}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px] divide-y">
              <div className="flex items-center p-4 bg-muted">
                <div className="flex-1 text-sm font-medium">Features</div>
                <div className="flex items-center gap-8 text-sm">
                  {plans.map((plan) => (
                    <div
                      key={plan.level}
                      className="w-16 text-center font-medium"
                    >
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center p-4 transition-colors",
                    feature.included === selectedPlan &&
                      "bg-primary/10",
                  )}
                >
                  <div className="flex-1 text-sm">{feature.name}</div>
                  <div className="flex items-center gap-8 text-sm">
                    {plans.map((plan) => (
                      <div
                        key={plan.level}
                        className={cn(
                          "w-16 flex justify-center",
                          plan.level === selectedPlan && "font-medium",
                        )}
                      >
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <CheckIcon className="w-5 h-5 text-primary" />
                        ) : (
                          <Cross1Icon className="w-4 h-4 text-destructive/50" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            className={cn(
              "w-full sm:w-auto px-8 py-2 rounded-xl",
              buttonClassName,
            )}
          >
            Get started with {plans.find((p) => p.level === selectedPlan)?.name}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function shouldShowCheck(
  included: PricingFeature["included"],
  level: string,
): boolean {
  if (level === 'business') return true;
  if (level === 'pro' && (included === 'pro' || included === 'starter' || included === 'free')) return true;
  if (level === 'starter' && (included === 'starter' || included === 'free')) return true;
  if (level === 'free' && included === 'free') return true;
  return false;
}
