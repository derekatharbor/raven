"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { 
  Shield, 
  Building2, 
  Vote, 
  FileText, 
  AlertTriangle,
  TrendingUp 
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const categories = [
  {
    icon: Shield,
    title: "Crime & Safety",
    description: "Arrests, incidents, court outcomes, and emerging patterns across your area.",
    examples: ["Break-ins by neighborhood", "DUI checkpoints", "Court dispositions"],
    span: "col-span-2 row-span-2",
  },
  {
    icon: Building2,
    title: "Development",
    description: "New construction, zoning changes, and planning board decisions.",
    examples: ["Permit applications", "Rezoning votes", "Infrastructure projects"],
    span: "col-span-1 row-span-1",
  },
  {
    icon: Vote,
    title: "Elections",
    description: "Candidate filings, ballot measures, and local election results.",
    examples: ["Who's running", "Voting deadlines", "Results analysis"],
    span: "col-span-1 row-span-2",
  },
  {
    icon: AlertTriangle,
    title: "Sex Offenders",
    description: "Registry updates and relocations within your notification radius.",
    examples: ["New registrations", "Address changes", "Compliance status"],
    span: "col-span-1 row-span-1",
  },
  {
    icon: FileText,
    title: "Public Records",
    description: "Business licenses, property transfers, and government filings.",
    examples: ["New businesses", "Property sales", "FOIA responses"],
    span: "col-span-2 row-span-1",
  },
  {
    icon: TrendingUp,
    title: "Trends",
    description: "What's changing over time. Patterns you'd miss reading daily news.",
    examples: ["Crime trends", "Growth corridors", "Budget shifts"],
    span: "col-span-1 row-span-1",
  },
]

export function CategoriesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in from left
      gsap.fromTo(
        headerRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      )

      const cards = gridRef.current?.querySelectorAll("article")
      if (cards && cards.length > 0) {
        gsap.set(cards, { y: 60, opacity: 0 })
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="categories" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-16 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">01 / Coverage</span>
          <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">WHAT WE TRACK</h2>
        </div>
        <p className="hidden md:block max-w-xs font-mono text-xs text-muted-foreground text-right leading-relaxed">
          Six categories of local intelligence, updated weekly.
        </p>
      </div>

      {/* Asymmetric grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px]"
      >
        {categories.map((category, index) => (
          <CategoryCard key={index} category={category} index={index} />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  index,
}: {
  category: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    examples: string[]
    span: string
  }
  index: number
}) {
  const Icon = category.icon

  return (
    <article
      className={cn(
        "group relative border border-border/40 p-5 flex flex-col justify-between transition-all duration-500 cursor-pointer overflow-hidden",
        category.span,
        "hover:border-accent/60"
      )}
    >
      {/* Background layer */}
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="font-[var(--font-bebas)] text-2xl md:text-3xl tracking-tight group-hover:text-accent transition-colors duration-300">
          {category.title}
        </h3>
      </div>

      {/* Description - reveals on hover */}
      <div className="relative z-10">
        <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          {category.description}
        </p>
        <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 delay-75">
          {category.examples.map((example, i) => (
            <span
              key={i}
              className="font-mono text-[9px] uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-1"
            >
              {example}
            </span>
          ))}
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-accent" />
        <div className="absolute top-0 right-0 w-[1px] h-full bg-accent" />
      </div>
    </article>
  )
}
