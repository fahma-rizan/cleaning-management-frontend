import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User as UserIcon, ExternalLink, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  serviceLinks?: { id: number; name: string; price: string; category: string }[];
  categoryLink?: { label: string; category: string };
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────
const SERVICE_DATA = {
  home: {
    category: 'home',
    label: 'Home/Office Cleaning',
    services: [
      {
        id: 1, name: 'House Deep Cleaning', price: 'From LKR 25/sqft',
        details: 'Normal Deep Cleaning: LKR 25/sqft | Move In/Out: LKR 30/sqft | After Construction: LKR 35/sqft',
        features: ['Complete Home Sanitization', 'Hard-to-reach Areas', 'Appliance Cleaning'],
      },
      {
        id: 6, name: 'General Cleaning', price: 'LKR 20/sqft',
        details: 'Regular cleaning at LKR 20 per sqft. Includes dusting, mopping, and organizing.',
        features: ['Dusting & Wiping', 'Floor Cleaning', 'Kitchen Cleaning'],
      },
      {
        id: 5, name: 'Commercial Cleaning', price: 'From LKR 25/sqft',
        details: 'Normal: LKR 25/sqft | Move In/Out: LKR 30/sqft | After Construction: LKR 35/sqft',
        features: ['Desk Cleaning', 'Floor Mopping', 'Restroom Sanitizing'],
      },
      {
        id: 7, name: 'Floor Cleaning', price: 'LKR 30/sqft',
        details: 'Specialized floor cleaning at LKR 30 per sqft for all flooring types.',
        features: ['Tile Cleaning', 'Hardwood Care', 'Marble Polishing'],
      },
      {
        id: 8, name: 'Floor - Cut & Polish', price: 'LKR 35/sqft',
        details: 'Professional cutting and polishing at LKR 35 per sqft for marble and granite.',
        features: ['Diamond Cutting', 'High-Speed Polishing', 'Crystallization'],
      },
    ],
  },
  laundry: {
    category: 'laundry',
    label: 'Laundry',
    services: [
      {
        id: 9, name: 'Dry Cleaning', price: 'From LKR 175/piece',
        details: 'Shirt: LKR 400 | T-Shirt: LKR 350 | Trouser: LKR 450 | Saree: LKR 900 | Blazer: LKR 700 | Two Piece Suit: LKR 850 | Three Piece Suit: LKR 1,250 | Bridal Dress: LKR 3,500',
        features: ['Free Pickup & Delivery', 'Delicate Fabric Care', 'Stain Removal'],
      },
      {
        id: 10, name: 'Washing & Pressing', price: 'From LKR 170/piece',
        details: 'Shirt Fold: LKR 270 / Hang: LKR 370 | T-Shirt Fold: LKR 220 / Hang: LKR 320 | Trouser Fold: LKR 320 / Hang: LKR 420 | Dress (Long) Fold: LKR 420 / Hang: LKR 520',
        features: ['Free Pickup & Delivery', 'Fold or Hang Options', 'Professional Ironing'],
      },
      {
        id: 11, name: 'Pressing Only', price: 'From LKR 125/piece',
        details: 'Shirt Fold: LKR 175 / Hang: LKR 275 | T-Shirt Fold: LKR 125 / Hang: LKR 225 | Trouser Fold: LKR 225 / Hang: LKR 325 | Saree: LKR 600 | Blazer: LKR 500',
        features: ['Free Pickup & Delivery', 'Fold or Hang Options', 'Crease Removal'],
      },
    ],
  },
  shampoo: {
    category: 'shampoo',
    label: 'Shampoo & Vacuum Cleaning',
    services: [
      {
        id: 3, name: 'Sofa Cleaning', price: 'From LKR 2,900',
        details: '2 Seater: LKR 2,900 | 3 Seater: LKR 3,900 | 4 Seater: LKR 4,900 | 5 Seater: LKR 5,900',
        features: ['Shampoo Cleaning', 'Stain Removal', 'Odor Elimination'],
      },
      {
        id: 13, name: 'Mattress Cleaning', price: 'From LKR 5,500',
        details: 'King Size Full: LKR 11,500 / Top Only: LKR 8,500 | Queen Size Full: LKR 10,500 / Top Only: LKR 7,500 | Double Full: LKR 10,000 / Top Only: LKR 7,000 | Single Full: LKR 8,000 / Top Only: LKR 5,500',
        features: ['Steam Sanitization', 'Dust Mite Removal', 'Allergen Elimination'],
      },
      {
        id: 14, name: 'Carpet Cleaning', price: 'LKR 35/sqft',
        details: 'Office Carpet Cleaning at LKR 35 per sqft.',
        features: ['Shampoo Vacuum', 'Stain Treatment', 'Deodorizing'],
      },
    ],
  },
  curtain: {
    category: 'curtain',
    label: 'Curtain Cleaning',
    services: [
      {
        id: 4, name: 'Curtain Cleaning', price: 'From LKR 2,500/curtain',
        details: 'Dry Cleaning & Pressing: LKR 2,500/curtain | Laundry & Pressing: LKR 3,500/curtain | Premium Service: LKR 4,500/curtain | Removal: LKR 100/curtain | Installation: LKR 100/curtain | Delivery: LKR 500',
        features: ['Dry Cleaning & Pressing', 'Laundry & Pressing', 'Premium Service'],
      },
    ],
  },
};

const getResponseFromText = (msg: string): { text: string; options?: string[]; serviceLinks?: any[]; categoryLink?: any } => {
  const m = msg.toLowerCase()
    // Handle common misspellings
    .replace(/laundy|laundrey|laundary|laundey/g, 'laundry')
    .replace(/curtian|curtin|curtian|cuurtan/g, 'curtain')
    .replace(/sofaa|sopha|sofa a|soffa/g, 'sofa')
    .replace(/matress|matres|mattres|matrass/g, 'mattress')
    .replace(/carpat|carpit|caarpet/g, 'carpet')
    .replace(/pressng|prssing|presing/g, 'pressing')
    .replace(/cleanng|cleaing|cleening/g, 'cleaning')
    .replace(/washin|wshing|wahsing/g, 'washing')
    .replace(/drycleaning|dry-cleaning/g, 'dry cleaning');

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (m.match(/^(hi|hello|hey|good morning|good afternoon|good evening|hii|helo|howdy|greetings)/)) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return {
      text: `${greeting}! 👋 Welcome to Cloud Laundry Services! I'm here to help you find the perfect cleaning service. What would you like cleaned today?`,
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning', '❓ Not sure'],
    };
  }

  // ── FAQ: Duration ─────────────────────────────────────────────────────────
  if (m.includes('how long') || m.includes('duration') || m.includes('time take') || m.includes('takes how') || m.includes('long does')) {
    return {
      text: '⏱️ Here are the estimated durations for each service:\n\n🏠 Home/Office Cleaning:\n• House Deep Cleaning — 4-6 hours\n• General Cleaning — 2-3 hours\n• Commercial Cleaning — 3-4 hours\n• Floor Cleaning — 2-3 hours\n• Floor Cut & Polish — 4-5 hours\n\n👕 Laundry:\n• Dry Cleaning — 48-72 hours\n• Washing & Pressing — 24-48 hours\n• Pressing Only — 12-24 hours\n\n🛋️ Shampoo & Vacuum:\n• Sofa Cleaning — 2-3 hours\n• Mattress Cleaning — 2-3 hours\n• Carpet Cleaning — 2-4 hours\n\n🪟 Curtain Cleaning — 1-2 days',
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning'],
    };
  }

  // ── FAQ: Discounts/Offers ─────────────────────────────────────────────────
  if (m.includes('discount') || m.includes('offer') || m.includes('promo') || m.includes('coupon') || m.includes('deal') || m.includes('code') || m.includes('cheap') || m.includes('save')) {
    return {
      text: '🎉 We have amazing offers available!\n\n💚 WELCOME20 — 20% off your first booking!\n(Minimum order: LKR 1,000)\n\n🔵 LAUNDRY500 — LKR 500 off laundry services!\n(Minimum order: LKR 2,000)\n\n🟠 CLEAN15 — 15% off home cleaning services!\n(Minimum order: LKR 3,000)\n\nJust enter the promo code when booking!',
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning'],
    };
  }

  // ── FAQ: How to book ──────────────────────────────────────────────────────
  if (m.includes('how to book') || m.includes('how do i book') || m.includes('how can i book') || m.includes('booking process') || m.includes('make a booking') || m.includes('place order') || m.includes('order') || m.includes('appointment') || m.includes('schedule') || m.includes('reserve')) {
    return {
      text: '📅 Booking is easy! Here\'s how:\n\n1️⃣ Browse our services and find what you need\n2️⃣ Click the "Book Now" button\n3️⃣ Login or create an account\n4️⃣ Fill in your details (date, time, address)\n5️⃣ Enter a promo code if you have one\n6️⃣ Confirm your booking\n\nYou\'ll receive a booking reference number instantly! 🎉\n\nWould you like to browse our services?',
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning'],
    };
  }

  // ── FAQ: Areas covered ────────────────────────────────────────────────────
  if (m.includes('area') || m.includes('location') || m.includes('cover') || m.includes('where') || m.includes('city') || m.includes('colombo') || m.includes('region') || m.includes('district') || m.includes('available') || m.includes('serve')) {
    return {
      text: '📍 We currently serve the following areas in Sri Lanka:\n\n• Colombo & suburbs\n• Gampaha\n• Kalutara\n• Kandy\n• Galle\n• Matara\n\n🚚 Free Pickup & Delivery is available for all Laundry services within these areas!\n\nNot sure if we cover your area? Contact us for more information.',
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning'],
    };
  }

  // ── FAQ: Payment ──────────────────────────────────────────────────────────
  if (m.includes('pay') || m.includes('payment') || m.includes('cash') || m.includes('card') || m.includes('online') || m.includes('transfer') || m.includes('bank')) {
    return {
      text: '💳 We accept the following payment methods:\n\n💵 Cash on delivery\n💳 Credit/Debit Card\n📱 Online Payment\n\nPayment is collected after the service is completed to your satisfaction! 😊',
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning'],
    };
  }

  // ── Price queries ─────────────────────────────────────────────────────────
  if (m.includes('price') || m.includes('cost') || m.includes('how much') || m.includes('rate') || m.includes('charge') || m.includes('fee') || m.includes('expensive') || m.includes('affordable')) {
    return {
      text: '💰 Here\'s a quick price overview:\n\n🏠 Home Cleaning: From LKR 20/sqft\n👕 Dry Cleaning: From LKR 175/piece\n🛋️ Sofa Cleaning: From LKR 2,900\n🪟 Curtain Cleaning: From LKR 2,500/curtain\n\nWhich service would you like detailed pricing for?',
      options: ['🏠 Home/Office Cleaning prices', '👕 Laundry prices', '🛋️ Shampoo & Vacuum prices', '🪟 Curtain Cleaning prices'],
    };
  }

  // ── Home/Office keywords ──────────────────────────────────────────────────
  if (
    m.includes('home') || m.includes('house') || m.includes('apartment') ||
    m.includes('villa') || m.includes('office') || m.includes('commercial') ||
    m.includes('floor') || m.includes('deep clean') || m.includes('general clean') ||
    m.includes('polish') || m.includes('tile') || m.includes('marble') ||
    m.includes('dust') || m.includes('mop') || m.includes('sweep') ||
    m.includes('move in') || m.includes('move out') || m.includes('construction')
  ) {
    return {
      text: '🏠 We offer 5 types of Home/Office Cleaning services! Which one interests you?',
      options: ['House Deep Cleaning', 'General Cleaning', 'Commercial Cleaning', 'Floor Cleaning', 'Floor Cut & Polish', '👉 View all Home/Office services'],
    };
  }

  // ── Laundry keywords ──────────────────────────────────────────────────────
  if (
    m.includes('laundry') || m.includes('clothes') || m.includes('shirt') ||
    m.includes('trouser') || m.includes('dress') || m.includes('saree') ||
    m.includes('suit') || m.includes('iron') || m.includes('press') ||
    m.includes('wash') || m.includes('dry clean') || m.includes('garment') ||
    m.includes('fabric') || m.includes('silk') || m.includes('wedding') ||
    m.includes('bridal') || m.includes('lehenga') || m.includes('blouse') ||
    m.includes('kurta') || m.includes('thobe') || m.includes('blazer') ||
    m.includes('jacket') || m.includes('sweater') || m.includes('shawl') ||
    m.includes('dhoti') || m.includes('sarong') || m.includes('skirt') ||
    m.includes('fold') || m.includes('hang') || m.includes('pickup') ||
    m.includes('delivery') || m.includes('collect')
  ) {
    return {
      text: '👕 We offer 3 types of Laundry services! What do you need?',
      options: ['Dry Cleaning', 'Washing & Pressing', 'Pressing Only', '👉 View all Laundry services'],
    };
  }

  // ── Sofa keywords + smart suggestion ─────────────────────────────────────
  if (m.includes('sofa') || m.includes('couch') || m.includes('upholster') || m.includes('settee') || m.includes('loveseat')) {
    return {
      text: `🛋️ **Sofa Cleaning**\n\n• 2 Seater — LKR 2,900\n• 3 Seater — LKR 3,900\n• 4 Seater — LKR 4,900\n• 5 Seater — LKR 5,900\n\nIncludes: Shampoo cleaning, stain removal, odor elimination.\n\n💡 You might also be interested in:`,
      options: ['Mattress Cleaning', 'Carpet Cleaning', '👉 View all Shampoo & Vacuum services'],
      serviceLinks: [{ id: 3, name: 'Sofa Cleaning', price: 'From LKR 2,900', category: 'shampoo' }],
    };
  }

  // ── Mattress keywords + smart suggestion ──────────────────────────────────
  if (m.includes('mattress') || m.includes('bed') || m.includes('sleeping') || m.includes('pillow') || m.includes('bedsheet') || m.includes('king size') || m.includes('queen size') || m.includes('single bed') || m.includes('double bed')) {
    return {
      text: `🛏️ **Mattress Cleaning with Steam**\n\nKing Size: Full LKR 11,500 / Top Only LKR 8,500\nQueen Size: Full LKR 10,500 / Top Only LKR 7,500\nDouble: Full LKR 10,000 / Top Only LKR 7,000\nSingle: Full LKR 8,000 / Top Only LKR 5,500\n\n💡 You might also be interested in:`,
      options: ['Sofa Cleaning', 'Carpet Cleaning', '👉 View all Shampoo & Vacuum services'],
      serviceLinks: [{ id: 13, name: 'Mattress Cleaning', price: 'From LKR 5,500', category: 'shampoo' }],
    };
  }

  // ── Carpet keywords + smart suggestion ───────────────────────────────────
  if (m.includes('carpet') || m.includes('rug') || m.includes('mat') || m.includes('floor mat')) {
    return {
      text: `🧹 **Carpet Cleaning**\n\nPrice: LKR 35/sqft\n\nOffice carpet cleaning with professional shampoo vacuum.\n\n💡 You might also be interested in:`,
      options: ['Sofa Cleaning', 'Mattress Cleaning', '👉 View all Shampoo & Vacuum services'],
      serviceLinks: [{ id: 14, name: 'Carpet Cleaning', price: 'LKR 35/sqft', category: 'shampoo' }],
    };
  }

  // ── Shampoo/Vacuum keywords ───────────────────────────────────────────────
  if (m.includes('shampoo') || m.includes('vacuum') || m.includes('steam') || m.includes('furniture') || m.includes('stain')) {
    return {
      text: '🛋️ We offer 3 Shampoo & Vacuum Cleaning services! Which one do you need?',
      options: ['Sofa Cleaning', 'Mattress Cleaning', 'Carpet Cleaning', '👉 View all Shampoo & Vacuum services'],
    };
  }

  // ── Curtain keywords ──────────────────────────────────────────────────────
  if (m.includes('curtain') || m.includes('drape') || m.includes('blind') || m.includes('window') || m.includes('drapery') || m.includes('valance')) {
    return {
      text: `🪟 **Curtain Cleaning**\n\n• Dry Cleaning & Pressing — LKR 2,500/curtain\n• Laundry & Pressing — LKR 3,500/curtain\n• Premium Service — LKR 4,500/curtain\n\nAdd-ons:\n• Removal — LKR 100/curtain\n• Installation — LKR 100/curtain\n• Delivery — LKR 500`,
      serviceLinks: [{ id: 4, name: 'Curtain Cleaning', price: 'From LKR 2,500/curtain', category: 'curtain' }],
      categoryLink: { label: '🪟 View Curtain Cleaning', category: 'curtain' },
    };
  }

  // ── Dry cleaning smart suggestion ────────────────────────────────────────
  if (m.includes('dry clean') || m.includes('delicate') || m.includes('silk') || m.includes('wool')) {
    return {
      text: '👔 **Dry Cleaning** is perfect for delicate fabrics!\n\nFrom LKR 175/piece with Free Pickup & Delivery.\n\n💡 You might also be interested in:',
      options: ['Washing & Pressing', 'Pressing Only', '👉 View all Laundry services'],
      serviceLinks: [{ id: 9, name: 'Dry Cleaning', price: 'From LKR 175/piece', category: 'laundry' }],
    };
  }

  // ── Thank you ─────────────────────────────────────────────────────────────
  if (m.includes('thank') || m.includes('thanks') || m.includes('thx') || m.includes('appreciate') || m.includes('helpful')) {
    return {
      text: "You're welcome! 😊 Is there anything else I can help you with?",
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning'],
    };
  }

  // ── Bye ───────────────────────────────────────────────────────────────────
  if (m.includes('bye') || m.includes('goodbye') || m.includes('see you') || m.includes('later') || m.includes('quit') || m.includes('exit')) {
    return {
      text: 'Goodbye! 👋 Thank you for visiting Cloud Laundry Services. Have a great day! 😊',
      options: ['🔄 Start Over'],
    };
  }

  // ── Default ───────────────────────────────────────────────────────────────
  return {
    text: "I'm not sure I understood that. Here's what I can help you with:",
    options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning', '❓ Not sure'],
  };
};

export default function ChatbotFinder() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! 👋 Welcome to Cloud Laundry Services! I'm here to help you find the perfect cleaning service. What would you like cleaned today?",
      options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning', '❓ Not sure'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (sender: 'bot' | 'user', text: string, options?: string[], serviceLinks?: any[], categoryLink?: any) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, options, serviceLinks, categoryLink }]);
  };

  const handleOptionClick = (option: string) => {
    addMessage('user', option);

    setTimeout(() => {
      // ── Navigate to category ──────────────────────────────────────────────
      if (option === '👉 View all Home/Office services') {
        navigate('/services?category=home');
        addMessage('bot', '🏠 Taking you to Home/Office Cleaning services! You can browse and book from there.', ['🔄 Start Over']);
        return;
      }
      if (option === '👕 View Laundry services' || option === '👉 View all Laundry services') {
        navigate('/services?category=laundry');
        addMessage('bot', '👕 Taking you to Laundry services! You can browse and book from there.', ['🔄 Start Over']);
        return;
      }
      if (option === '👉 View all Shampoo & Vacuum services') {
        navigate('/services?category=shampoo');
        addMessage('bot', '🛋️ Taking you to Shampoo & Vacuum services! You can browse and book from there.', ['🔄 Start Over']);
        return;
      }
      if (option === '🪟 View Curtain Cleaning' || option === '🪟 View Curtain Cleaning service') {
        navigate('/services?category=curtain');
        addMessage('bot', '🪟 Taking you to Curtain Cleaning service! You can browse and book from there.', ['🔄 Start Over']);
        return;
      }

      // ── Main categories ───────────────────────────────────────────────────
      if (option === '🏠 Home/Office Cleaning' || option === '🏠 Home/Office Cleaning prices') {
        addMessage('bot',
          '🏠 We offer 5 Home/Office Cleaning services:\n\n• House Deep Cleaning — LKR 25-35/sqft\n• General Cleaning — LKR 20/sqft\n• Commercial Cleaning — LKR 25-35/sqft\n• Floor Cleaning — LKR 30/sqft\n• Floor Cut & Polish — LKR 35/sqft\n\nWhich one interests you?',
          ['House Deep Cleaning', 'General Cleaning', 'Commercial Cleaning', 'Floor Cleaning', 'Floor Cut & Polish', '👉 View all Home/Office services']
        );
        return;
      }

      if (option === '👕 Laundry' || option === '👕 Laundry prices') {
        addMessage('bot',
          '👕 We offer 3 Laundry services:\n\n• Dry Cleaning — From LKR 175/piece\n• Washing & Pressing — From LKR 170/piece\n• Pressing Only — From LKR 125/piece\n\nAll include Free Pickup & Delivery!\n\nWhich one do you need?',
          ['Dry Cleaning', 'Washing & Pressing', 'Pressing Only', '👉 View all Laundry services']
        );
        return;
      }

      if (option === '🛋️ Shampoo & Vacuum' || option === '🛋️ Shampoo & Vacuum prices') {
        addMessage('bot',
          '🛋️ We offer 3 Shampoo & Vacuum services:\n\n• Sofa Cleaning — From LKR 2,900\n• Mattress Cleaning — From LKR 5,500\n• Carpet Cleaning — LKR 35/sqft\n\nWhich one do you need?',
          ['Sofa Cleaning', 'Mattress Cleaning', 'Carpet Cleaning', '👉 View all Shampoo & Vacuum services']
        );
        return;
      }

      if (option === '🪟 Curtain Cleaning' || option === '🪟 Curtain Cleaning prices') {
        addMessage('bot',
          '🪟 We offer expert Curtain Cleaning with 3 service types:\n\n• Dry Cleaning & Pressing — LKR 2,500/curtain\n• Laundry & Pressing — LKR 3,500/curtain\n• Premium Service — LKR 4,500/curtain\n\nAdd-ons available:\n• Removal — LKR 100/curtain\n• Installation — LKR 100/curtain\n• Delivery — LKR 500',
          ['👉 View all Home/Office services'],
          [{ id: 4, name: 'Curtain Cleaning', price: 'From LKR 2,500/curtain', category: 'curtain' }],
          { label: '🪟 View Curtain Cleaning', category: 'curtain' }
        );
        return;
      }

      // ── Home subcategories ────────────────────────────────────────────────
      if (option === 'House Deep Cleaning') {
        addMessage('bot',
          '🏠 **House Deep Cleaning**\n\nPricing by type:\n• Normal Deep Cleaning — LKR 25/sqft\n• Move In / Move Out — LKR 30/sqft\n• After Construction — LKR 35/sqft\n\nIncludes: Complete sanitization, hard-to-reach areas, appliance cleaning.',
          ['👉 View all Home/Office services', '🔄 Start Over'],
          [{ id: 1, name: 'House Deep Cleaning', price: 'From LKR 25/sqft', category: 'home' }]
        );
        return;
      }

      if (option === 'General Cleaning') {
        addMessage('bot',
          '🧹 **General Cleaning**\n\nPrice: LKR 20/sqft\n\nIncludes: Dusting & wiping, floor cleaning, kitchen cleaning, bathroom sanitizing.',
          ['👉 View all Home/Office services', '🔄 Start Over'],
          [{ id: 6, name: 'General Cleaning', price: 'LKR 20/sqft', category: 'home' }]
        );
        return;
      }

      if (option === 'Commercial Cleaning') {
        addMessage('bot',
          '🏢 **Commercial Cleaning**\n\nPricing by type:\n• Normal — LKR 25/sqft\n• Move In / Move Out — LKR 30/sqft\n• After Construction — LKR 35/sqft\n\nIncludes: Desk cleaning, floor mopping, restroom sanitizing.',
          ['👉 View all Home/Office services', '🔄 Start Over'],
          [{ id: 5, name: 'Commercial Cleaning', price: 'From LKR 25/sqft', category: 'home' }]
        );
        return;
      }

      if (option === 'Floor Cleaning') {
        addMessage('bot',
          '✨ **Floor Cleaning**\n\nPrice: LKR 30/sqft\n\nIncludes: Tile cleaning, hardwood care, marble polishing, grout cleaning.',
          ['👉 View all Home/Office services', '🔄 Start Over'],
          [{ id: 7, name: 'Floor Cleaning', price: 'LKR 30/sqft', category: 'home' }]
        );
        return;
      }

      if (option === 'Floor Cut & Polish') {
        addMessage('bot',
          '💎 **Floor Cut & Polish**\n\nPrice: LKR 35/sqft\n\nIncludes: Diamond cutting, high-speed polishing, crystallization, sealing.',
          ['👉 View all Home/Office services', '🔄 Start Over'],
          [{ id: 8, name: 'Floor - Cut & Polish', price: 'LKR 35/sqft', category: 'home' }]
        );
        return;
      }

      // ── Laundry subcategories ─────────────────────────────────────────────
      if (option === 'Dry Cleaning') {
        addMessage('bot',
          '👔 **Dry Cleaning**\n\nRegular Clothing:\n• Shirt — LKR 400\n• T-Shirt — LKR 350\n• Trouser — LKR 450\n• Shorts — LKR 400\n\nFormal Wear:\n• Blazer — LKR 700\n• Two Piece Suit — LKR 850\n• Three Piece Suit — LKR 1,250\n\nWomen\'s Wear:\n• Blouse — LKR 300\n• Saree — LKR 900\n• Special Work Saree — LKR 1,250\n\nSpecial Occasion:\n• Bridal Dress/Lehenga — LKR 3,500\n\nFree Pickup & Delivery included!',
          ['👉 View all Laundry services', '🔄 Start Over'],
          [{ id: 9, name: 'Dry Cleaning', price: 'From LKR 175/piece', category: 'laundry' }]
        );
        return;
      }

      if (option === 'Washing & Pressing') {
        addMessage('bot',
          '👕 **Washing & Pressing**\n\nFold / Hang options available:\n• Shirt — LKR 270 / LKR 370\n• T-Shirt — LKR 220 / LKR 320\n• Trouser — LKR 320 / LKR 420\n• Dress (Long) — LKR 420 / LKR 520\n• Salwar Full Set — LKR 420 / LKR 520\n\nHome Textiles:\n• Pillowcases — LKR 170\n• Bedsheets — LKR 350\n• Bathrobe — LKR 650\n\nFree Pickup & Delivery included!',
          ['👉 View all Laundry services', '🔄 Start Over'],
          [{ id: 10, name: 'Washing & Pressing', price: 'From LKR 170/piece', category: 'laundry' }]
        );
        return;
      }

      if (option === 'Pressing Only') {
        addMessage('bot',
          '🔥 **Pressing Only**\n\nFold / Hang options available:\n• Shirt — LKR 175 / LKR 275\n• T-Shirt — LKR 125 / LKR 225\n• Trouser — LKR 225 / LKR 325\n\nSpecial Wear:\n• Saree — LKR 600\n• Special Work Saree — LKR 850\n• Blazer — LKR 500\n\nHome Textiles:\n• Bed Sheet — LKR 225\n• Pillowcases — LKR 125\n\nFree Pickup & Delivery included!',
          ['👉 View all Laundry services', '🔄 Start Over'],
          [{ id: 11, name: 'Pressing Only', price: 'From LKR 125/piece', category: 'laundry' }]
        );
        return;
      }

      // ── Shampoo subcategories ─────────────────────────────────────────────
      if (option === 'Sofa Cleaning') {
        addMessage('bot',
          '🛋️ **Sofa Cleaning**\n\nPricing by seats:\n• 2 Seater — LKR 2,900\n• 3 Seater — LKR 3,900\n• 4 Seater — LKR 4,900\n• 5 Seater — LKR 5,900\n\nIncludes: Shampoo cleaning, stain removal, odor elimination.',
          ['👉 View all Shampoo & Vacuum services', '🔄 Start Over'],
          [{ id: 3, name: 'Sofa Cleaning', price: 'From LKR 2,900', category: 'shampoo' }]
        );
        return;
      }

      if (option === 'Mattress Cleaning') {
        addMessage('bot',
          '🛏️ **Mattress Cleaning with Steam**\n\nKing Size: Full LKR 11,500 / Top Only LKR 8,500\nQueen Size: Full LKR 10,500 / Top Only LKR 7,500\nDouble: Full LKR 10,000 / Top Only LKR 7,000\nSingle: Full LKR 8,000 / Top Only LKR 5,500\n\nIncludes: Steam sanitization, dust mite removal, allergen elimination.',
          ['👉 View all Shampoo & Vacuum services', '🔄 Start Over'],
          [{ id: 13, name: 'Mattress Cleaning', price: 'From LKR 5,500', category: 'shampoo' }]
        );
        return;
      }

      if (option === 'Carpet Cleaning') {
        addMessage('bot',
          '🧹 **Carpet Cleaning**\n\nPrice: LKR 35/sqft\n\nOffice carpet cleaning with professional shampoo vacuum.\nIncludes: Stain treatment, deodorizing, fast drying.',
          ['👉 View all Shampoo & Vacuum services', '🔄 Start Over'],
          [{ id: 14, name: 'Carpet Cleaning', price: 'LKR 35/sqft', category: 'shampoo' }]
        );
        return;
      }

      // ── Not sure ──────────────────────────────────────────────────────────
      if (option === '❓ Not sure') {
        addMessage('bot',
          "No problem! Here's a quick overview of all our services:\n\n🏠 Home/Office Cleaning — From LKR 20/sqft\n👕 Laundry — From LKR 125/piece\n🛋️ Shampoo & Vacuum — From LKR 2,900\n🪟 Curtain Cleaning — From LKR 2,500/curtain\n\nWhich category interests you most?",
          ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning']
        );
        return;
      }

      // ── Start Over ────────────────────────────────────────────────────────
      if (option === '🔄 Start Over') {
        setMessages([{
          id: Date.now().toString(),
          sender: 'bot',
          text: "Hello! 👋 What would you like cleaned today?",
          options: ['🏠 Home/Office Cleaning', '👕 Laundry', '🛋️ Shampoo & Vacuum', '🪟 Curtain Cleaning', '❓ Not sure'],
        }]);
        return;
      }

      // ── Price options ─────────────────────────────────────────────────────
      if (option === '🏠 Home/Office Cleaning prices') {
        handleOptionClick('🏠 Home/Office Cleaning');
        return;
      }
      if (option === '👕 Laundry prices') {
        handleOptionClick('👕 Laundry');
        return;
      }
      if (option === '🛋️ Shampoo & Vacuum prices') {
        handleOptionClick('🛋️ Shampoo & Vacuum');
        return;
      }
      if (option === '🪟 Curtain Cleaning prices') {
        handleOptionClick('🪟 Curtain Cleaning');
        return;
      }

    }, 400);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const text = inputText;
    addMessage('user', text);
    setInputText('');
    setTimeout(() => {
      const response = getResponseFromText(text);
      addMessage('bot', response.text, response.options, response.serviceLinks, response.categoryLink);
    }, 400);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-purple-700 transition-all z-50 flex items-center justify-center"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cloud Laundry Assistant</h3>
                <p className="text-sm text-purple-100">🟢 Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'bot' ? 'bg-purple-100' : 'bg-gray-200'}`}>
                  {message.sender === 'bot'
                    ? <Bot className="w-5 h-5 text-purple-600" />
                    : <UserIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div className={`flex-1 ${message.sender === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`inline-block p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-line ${message.sender === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-purple-600 text-white'}`}>
                    {message.text}
                  </div>

                  {/* Options */}
                  {message.options && (
                    <div className="mt-2 space-y-1">
                      {message.options.map((option, idx) => (
                        <button key={idx} onClick={() => handleOptionClick(option)}
                          className="block w-full text-left px-3 py-2 bg-white border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors text-sm">
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Service links */}
                  {message.serviceLinks && (
                    <div className="mt-2 space-y-2">
                      {message.serviceLinks.map((service) => (
                        <Link key={service.id} to={`/services/${service.id}`}
                          className="block px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-800 font-medium text-sm">{service.name}</p>
                              <p className="text-purple-600 text-xs">{service.price}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Category navigation link */}
                  {message.categoryLink && (
                    <button
                      onClick={() => {
                        navigate(`/services?category=${message.categoryLink!.category}`);
                        addMessage('bot', `Taking you to ${message.categoryLink!.label}! 😊`, ['🔄 Start Over']);
                      }}
                      className="mt-2 w-full text-left px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      {message.categoryLink.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about any service..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
              />
              <button onClick={handleSendMessage}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">Ask me anything about our services!</p>
          </div>
        </div>
      )}
    </>
  );
}