"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MapPin, Users, FileText, Bell } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { icon: Users, value: "310K", label: "Residents covered" },
  { icon: FileText, value: "24", label: "Data sources" },
  { icon: Bell, value: "Weekly", label: "Briefing cadence" },
]

const municipalities = [
  "Crystal Lake",
  "McHenry",
  "Woodstock",
  "Algonquin",
  "Huntley",
  "Lake in the Hills",
  "Cary",
  "Marengo",
  "Harvard",
  "Johnsburg",
]

export function CoverageSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cursorRef.current) return

    const section = sectionRef.current
    const cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.5,
        ease: "power3.out",
      })
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    section.addEventListener("mousemove", handleMouseMove)
    section.addEventListener("mouseenter", handleMouseEnter)
    section.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      section.removeEventListener("mousemove", handleMouseMove)
      section.removeEventListener("mouseenter", handleMouseEnter)
      section.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
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
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      )

      // Content fade up
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="coverage" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className={cn(
          "pointer-events-none absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50",
          "w-12 h-12 rounded-full border-2 border-accent bg-accent/20",
          "transition-opacity duration-300 flex items-center justify-center",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        <MapPin className="w-4 h-4 text-accent" />
      </div>

      {/* Section header */}
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">03 / Coverage Area</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">MCHENRY COUNTY</h2>
        <p className="mt-4 font-mono text-sm text-muted-foreground max-w-lg">
          We're starting with McHenry County, Illinois — 310,000 residents across 24 municipalities. 
          More counties coming soon.
        </p>
      </div>

      <div ref={contentRef} className="grid md:grid-cols-2 gap-12 md:gap-24">
        {/* Stats */}
        <div className="space-y-8">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
            By the numbers
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <Icon className="w-5 h-5 text-accent mx-auto mb-3" />
                  <div className="font-[var(--font-bebas)] text-3xl md:text-4xl tracking-tight">{stat.value}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Expansion note */}
          <div className="border border-border/40 p-6 mt-8">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
              Expansion Roadmap
            </h4>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Lake County, IL is next. Want Ranger in your county? Join the waitlist and let us know where you live.
            </p>
          </div>
        </div>

        {/* Municipalities list */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
            Municipalities
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {municipalities.map((city, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 py-2 border-b border-border/20 hover:border-accent/40 transition-colors cursor-pointer"
              >
                <span className="font-mono text-[10px] text-muted-foreground/40 group-hover:text-accent transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                  {city}
                </span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-6">
            + unincorporated McHenry County
          </p>
        </div>
      </div>
    </section>
  )
}
