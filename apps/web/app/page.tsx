import React from "react";
import { HeroHeader } from "@/components/Header";
import Features from "@/components/Features";
import TestimonialSection from "@/components/Testimonials";
import CTASection from "@/components/CTA";
import FooterSection from "@/components/Footer";
import HeroComponent from "@/components/Hero";

export default function HeroSection() {
	return (
		<>
			<HeroHeader />
			<HeroComponent />
			<Features />
			<TestimonialSection />
			<CTASection />
			<FooterSection />
		</>
	);
}
