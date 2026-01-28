"use client"

import { useRef, useEffect } from "react"
import { HighlightText } from "@/components/highlight-text"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      number: "01",
      titleParts: [
        { text: "WE ", highlight: false },
        { text: "GATHER", highlight: true },
      ],
      description:
        "Our systems pull from police blotters, court records, planning agendas, county registries, and local news — sources you don't have time to check.",
      align: "left",
    },
    {
      number: "02",
      titleParts: [
        { text: "WE ", highlight: false },
        { text: "SYNTHESIZE", highlight: true },
      ],
      description:
        "Raw data becomes intelligence. We connect the dots: that permit application relates to the rezoning vote; those arrests are part of a pattern.",
      align: "right",
    },
    {
      number: "03",
      titleParts: [
        { text: "YOU ", highlight: false },
        { text: "STAY INFORMED", highlight: true },
      ],
      description:
        "Every Sunday, your briefing arrives. No doomscrolling. No toxic comments. Just what happened, what it means, and what to watch.",
      align: "left",
    },
  ]

  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !stepsRef.current) return

    const ctx = gsap.context(() => {
      // Header slide in
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      })

      // Each step slides in from its aligned side
      const articles = stepsRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = steps[index].align === "right"
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-32 pl-6 md:pl-28 pr-6 md:pr-12">
      {/* Section header */}
      <div ref={headerRef} className="mb-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">02 / Process</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">HOW IT WORKS</h2>
      </div>

      {/* Staggered steps */}
      <div ref={stepsRef} className="space-y-24 md:space-y-32">
        {steps.map((step, index) => (
          <article
            key={index}
            className={`flex flex-col ${
              step.align === "right" ? "items-end text-right" : "items-start text-left"
            }`}
          >
            {/* Annotation label */}
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Step {step.number}
            </span>

            <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
              {step.titleParts.map((part, i) =>
                part.highlight ? (
                  <HighlightText key={i} parallaxSpeed={0.6}>
                    {part.text}
                  </HighlightText>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </h3>

            {/* Description */}
            <p className="mt-6 max-w-md font-mono text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Decorative line */}
            <div className={`mt-8 h-[1px] bg-border w-24 md:w-48 ${step.align === "right" ? "mr-0" : "ml-0"}`} />
          </article>
        ))}
      </div>
    </section>
  )
}
