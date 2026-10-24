import { BookOpen, Globe2, HeartPulse, MapPin, Users } from 'lucide-react';
import { FaCity, FaHeartbeat, FaLightbulb, FaPeopleArrows } from 'react-icons/fa';
import { SiPython, SiReact, SiSupabase } from 'react-icons/si';
import { GradientCard } from './ui/gradient-card';

const cards = [
  {
    badgeText: 'Project Vision',
    badgeColor: '#0d9488',
    title: 'Bridging Care',
    description: 'SwasthSetu simplifies hospital discovery based on your insurance/scheme and location. We bring scattered information into one unified platform.',
    gradient: 'teal',
    icon: <HeartPulse className="h-32 w-32" strokeWidth={1} />,
  },
  {
    badgeText: 'Built With',
    badgeColor: '#0d9488',
    title: 'Modern Technology',
    description: 'React (Frontend), Python Flask (Backend), Supabase (Database), Leaflet (Maps), and Groq (AI).',
    gradient: 'blue',
    icon: <span className="flex gap-3"><SiReact className="h-16 w-16" /><SiPython className="h-16 w-16" /><SiSupabase className="h-16 w-16" /></span>,
  },
  {
    badgeText: 'Academic Mapping',
    badgeColor: '#0d9488',
    title: 'Engineering Concepts',
    description: 'DBMS: Relational Data. AOA: Search Filtering. CN: Client-Server API. SEPM: SDLC. Data Eng: Data Structuring. AI: Information Assistance.',
    gradient: 'slate',
    icon: <BookOpen className="h-32 w-32" strokeWidth={1} />,
  },
  {
    badgeText: 'SDG Alignment',
    badgeColor: '#0d9488',
    title: 'Impact on Society',
    description: 'Primary: SDG 3 (Good Health). Supporting: SDG 9 (Innovation), SDG 10 (Reduced Inequality), and SDG 11 (Sustainable Cities).',
    gradient: 'emerald',
    icon: <span className="flex items-center gap-3"><Globe2 className="h-16 w-16" strokeWidth={1} /><FaHeartbeat className="h-8 w-8" /><FaLightbulb className="h-8 w-8" /><FaPeopleArrows className="h-8 w-8" /><FaCity className="h-8 w-8" /></span>,
  },
  {
    badgeText: 'Core Features',
    badgeColor: '#0d9488',
    title: 'What We Offer',
    description: "Interactive Map Search, Verified Network & Empanelment Status, 'Before You Visit' Checklists, and Kiwi AI Assistant for guidance.",
    gradient: 'teal',
    icon: <MapPin className="h-32 w-32" strokeWidth={1} />,
  },
  {
    badgeText: 'Who is it for?',
    badgeColor: '#0d9488',
    title: 'Empowering Patients',
    description: 'Designed for families, individuals, and patients in unfamiliar locations looking for quick, reliable, and transparent hospital information.',
    gradient: 'blue',
    icon: <Users className="h-32 w-32" strokeWidth={1} />,
  },
];

export default function AboutSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <GradientCard key={card.title} imageUrl="" {...card} />
      ))}
    </div>
  );
}
