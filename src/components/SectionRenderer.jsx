import HeroSection from './sections/HeroSection.jsx'
import RentSection from './sections/RentSection.jsx'
import CleaningSection from './sections/CleaningSection.jsx'
import IndustriesSection from './sections/IndustriesSection.jsx'
import SocialSection from './sections/SocialSection.jsx'
import ContactSection from './sections/ContactSection.jsx'
import CustomSection from './sections/CustomSection.jsx'
import AboutSection from './sections/AboutSection.jsx'
import TechnologySection from './sections/TechnologySection.jsx'
import EquipmentSection from './sections/EquipmentSection.jsx'
import GeographySection from './sections/GeographySection.jsx'
import FaqSection from './sections/FaqSection.jsx'

const REGISTRY = {
  hero: HeroSection,
  about: AboutSection,
  rent: RentSection,
  cleaning: CleaningSection,
  industries: IndustriesSection,
  technology: TechnologySection,
  equipment: EquipmentSection,
  geography: GeographySection,
  faq: FaqSection,
  social: SocialSection,
  contact: ContactSection,
  custom: CustomSection,
}

export default function SectionRenderer({ block }) {
  const Component = REGISTRY[block.type]
  if (!Component) {
    if (typeof window !== 'undefined') {
      console.warn(`[SectionRenderer] неизвестный тип блока: ${block.type}`)
    }
    return null
  }
  return <Component block={block} />
}

export const SECTION_TYPES = Object.keys(REGISTRY)
