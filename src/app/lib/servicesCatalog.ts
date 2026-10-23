import { Home, Sofa, Shirt, Wind, type LucideIcon } from "lucide-react";

// Single source of truth for the service catalog — shared by Services.tsx
// (the listing page) and ServiceDetails.tsx (the "View Details" page), so
// the two can never drift out of sync the way they previously did.
//
// reviewKey is deliberately NOT the display name. It must exactly match
// the lowercase string Booking.tsx's serviceMapping writes into
// booking.serviceName (and from there, Review.serviceName) — e.g. id '3'
// books as 'sofa cleaning', not the catalog's display name 'Sofa Cleaning'.
// Reviews are looked up by reviewKey, not by name, so the two casings
// don't need to match for reviews to show up correctly.
export interface ServiceCatalogEntry {
  id: number;
  name: string;
  reviewKey: string;
  category: string;
  icon: LucideIcon;
  description: string;
  price: string;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  features: string[];
}

export const SERVICES: ServiceCatalogEntry[] = [
  {
    id: 1,
    name: "House Deep Cleaning",
    reviewKey: "house deep cleaning",
    category: "home",
    icon: Home,
    description: "Comprehensive deep cleaning service for thorough home sanitization",
    price: "From LKR 8,000",
    duration: "4-6 hours",
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Complete Home Sanitization", "Hard-to-reach Areas", "Appliance Cleaning", "Window Cleaning"],
  },
  {
    id: 6,
    name: "General Cleaning",
    reviewKey: "general cleaning",
    category: "home",
    icon: Home,
    description: "Regular cleaning services including dusting, mopping, and organizing",
    price: "From LKR 2,500",
    duration: "2-3 hours",
    rating: 4.8,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Dusting & Wiping", "Floor Cleaning", "Kitchen Cleaning", "Bathroom Sanitizing"],
  },
  {
    id: 5,
    name: "Commercial Cleaning",
    reviewKey: "commercial cleaning",
    category: "home",
    icon: Home,
    description: "Professional cleaning services for offices and commercial workspaces",
    price: "From LKR 5,000",
    duration: "3-4 hours",
    rating: 4.8,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Desk Cleaning", "Floor Mopping", "Restroom Sanitizing", "Trash Removal"],
  },
  {
    id: 7,
    name: "Floor Cleaning",
    reviewKey: "floor cleaning",
    category: "home",
    icon: Home,
    description: "Specialized floor cleaning for all types of flooring",
    price: "From LKR 3,000",
    duration: "2-3 hours",
    rating: 4.7,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Tile Cleaning", "Hardwood Care", "Marble Polishing", "Grout Cleaning"],
  },
  {
    id: 8,
    name: "Floor - Cut and Polish",
    reviewKey: "floor cut and polish",
    category: "home",
    icon: Home,
    description: "Professional floor cutting and polishing services for marble and granite",
    price: "From LKR 6,500",
    duration: "4-5 hours",
    rating: 4.9,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDY5NjI4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Diamond Cutting", "High-Speed Polishing", "Crystallization", "Sealing"],
  },
  {
    id: 3,
    name: "Sofa Cleaning",
    reviewKey: "sofa cleaning",
    category: "shampoo",
    icon: Sofa,
    description: "Deep shampoo vacuum cleaning for sofas and upholstered furniture",
    price: "From LKR 3,500",
    duration: "1-2 hours",
    rating: 4.7,
    reviews: 178,
    image: "https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmclMjBpbnRlcmlvciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Shampoo Cleaning", "Stain Removal", "Odor Elimination", "Fabric Protection"],
  },
  {
    id: 13,
    name: "Mattress Cleaning with Steam",
    reviewKey: "mattress cleaning",
    category: "shampoo",
    icon: Sofa,
    description: "Professional steam cleaning for mattresses with deep sanitization",
    price: "From LKR 4,000",
    duration: "1-2 hours",
    rating: 4.8,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmclMjBpbnRlcmlvciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Steam Sanitization", "Dust Mite Removal", "Allergen Elimination", "Deep Cleaning"],
  },
  {
    id: 14,
    name: "Carpet Cleaning",
    reviewKey: "carpet cleaning",
    category: "shampoo",
    icon: Sofa,
    description: "Professional shampoo vacuum cleaning for carpets and rugs",
    price: "From LKR 2,800",
    duration: "2-3 hours",
    rating: 4.6,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1759722665623-c4c1075c0a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2ZhJTIwY2xlYW5pbmclMjBpbnRlcmlvciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Shampoo Vacuum", "Stain Treatment", "Deodorizing", "Fast Drying"],
  },
  {
    id: 9,
    name: "Dry Cleaning",
    reviewKey: "dry cleaning",
    category: "laundry",
    icon: Shirt,
    description: "Professional dry cleaning for delicate fabrics and garments",
    price: "From RS. 175/piece",
    duration: "48-72 hours",
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1673085518459-c60e0615c099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZyZXNoJTIwY2xvdGhlc3xlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Free Pickup & Delivery", "Delicate Fabric Care", "Stain Removal", "Professional Finishing"],
  },
  {
    id: 10,
    name: "Washing and Pressing",
    reviewKey: "washing pressing",
    category: "laundry",
    icon: Shirt,
    description: "Complete wash, dry, fold or hang services with professional ironing",
    price: "From RS. 170/piece",
    duration: "24-48 hours",
    rating: 4.9,
    reviews: 456,
    image: "https://images.unsplash.com/photo-1673085518459-c60e0615c099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZyZXNoJTIwY2xvdGhlc3xlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Free Pickup & Delivery", "Fold or Hang Options", "Professional Ironing", "Stain Removal"],
  },
  {
    id: 11,
    name: "Pressing Only",
    reviewKey: "pressing only",
    category: "laundry",
    icon: Shirt,
    description: "Professional ironing and pressing services for your clean garments",
    price: "From RS. 125/piece",
    duration: "12-24 hours",
    rating: 4.8,
    reviews: 278,
    image: "https://images.unsplash.com/photo-1673085518459-c60e0615c099?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGZyZXNoJTIwY2xvdGhlc3xlbnwxfHx8fDE3NzA3MzYxODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    features: ["Free Pickup & Delivery", "Fold or Hang Options", "Crease Removal", "Quick Turnaround"],
  },
  {
    id: 4,
    name: "Curtain Cleaning",
    reviewKey: "curtain cleaning",
    category: "curtains",
    icon: Wind,
    description: "Expert curtain cleaning with 3 specialized methods and convenient add-on services",
    price: "From LKR 2,500",
    duration: "2-3 days",
    rating: 4.8,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1660226817472-2c73d49c6dd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXJ0YWluJTIwY2xlYW5pbmclMjB3aW5kb3clMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzcwNzM2MTg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    features: [
      "Dry Cleaning & Pressing",
      "Laundry & Pressing",
      "Curtain Premium Service",
      "Optional Removal & Installation",
      "Pickup & Delivery available",
    ],
  },
];