export interface Artwork {
  id: number;
  title: string;
  description: string;
  author: string;
  price: string;
  likes: number;
  downloads: number;
  views: string;
  resolution: string;
  tags: string[];
  preview: string;
  format: string;
  category: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ARTWORKS: Artwork[] = [
  {
    id: 1,
    title: 'Cyberpunk Cityscape',
    description:
      'Detailed 1-bit cityscape with neon signs and flying cars. Perfect for retro gaming displays and sci-fi projects.',
    author: 'pixel_prophet',
    price: '$3.99',
    likes: 342,
    downloads: 89,
    views: '1.2k',
    resolution: '128x64',
    tags: ['cyberpunk', 'cityscape', 'detailed', 'gaming'],
    preview: `████████████████████████████████
██  ██    ██  ████    ██  ████
██  ██    ██  ████    ██  ████
████████████████████████████████`,
    format: 'SSD1306',
    category: 'Landscapes',
    featured: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    title: 'Minimalist Weather Icons',
    description:
      'Clean 1-bit weather icon set. Sun, rain, clouds, snow - all optimized for tiny displays and IoT projects.',
    author: 'mono_designer',
    price: '$1.99',
    likes: 156,
    downloads: 234,
    views: '850',
    resolution: '32x32',
    tags: ['icons', 'weather', 'minimal', 'iot'],
    preview: `    ████████    
  ██        ██  
██            ██
██     ██     ██
██            ██
  ██        ██  
    ████████    `,
    format: 'Universal',
    category: 'Icons',
    featured: true,
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: 3,
    title: 'Retro Space Invaders',
    description:
      'Classic arcade sprites in perfect 1-bit format. Includes ships, aliens, and explosions for retro gaming projects.',
    author: 'arcade_master',
    price: '$2.49',
    likes: 445,
    downloads: 167,
    views: '2.1k',
    resolution: '128x32',
    tags: ['gaming', 'sprites', 'arcade', 'retro'],
    preview: `  ██    ██    ██    ██  
    ████████████████    
  ██████████████████  
██████████████████████`,
    format: 'SH1106',
    category: 'Gaming',
    featured: true,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
  },
  {
    id: 4,
    title: 'Dithered Portrait Pack',
    description:
      'Professional portrait dithering techniques. 12 different faces with various expressions and emotions.',
    author: 'dither_artist',
    price: '$4.99',
    likes: 278,
    downloads: 45,
    views: '890',
    resolution: '132x64',
    tags: ['portraits', 'dithering', 'faces', 'professional'],
    preview: `  ████████████████  
██  ██      ██  ██
██    ██████    ██
██              ██
██    ██████    ██
██  ██      ██  ██
  ████████████████  `,
    format: 'SH1107',
    category: 'Portraits',
    featured: true,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    id: 5,
    title: 'Geometric Patterns',
    description:
      'Abstract 1-bit geometric designs. Perfect for backgrounds, decorative elements, and modern UI designs.',
    author: 'pattern_lab',
    price: '$1.49',
    likes: 89,
    downloads: 312,
    views: '650',
    resolution: '128x64',
    tags: ['abstract', 'patterns', 'geometric', 'backgrounds'],
    preview: `██  ██  ██  ██  ██  ██
  ██  ██  ██  ██  ██  
██  ██  ██  ██  ██  ██
  ██  ██  ██  ██  ██  
██  ██  ██  ██  ██  ██`,
    format: 'SSD1306',
    category: 'Patterns',
    featured: true,
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z',
  },
  {
    id: 6,
    title: 'Pixel Art Animals',
    description:
      'Cute 1-bit animal collection. Cats, dogs, birds, and more in perfect monochrome style for character displays.',
    author: 'creature_pixels',
    price: '$2.99',
    likes: 523,
    downloads: 198,
    views: '1.8k',
    resolution: '64x64',
    tags: ['animals', 'cute', 'characters', 'pets'],
    preview: `    ████████    
  ██        ██  
██  ██    ██  ██
██            ██
██  ████████  ██
  ██        ██  
    ████████    `,
    format: 'Universal',
    category: 'Characters',
    featured: true,
    createdAt: '2024-01-10T13:20:00Z',
    updatedAt: '2024-01-10T13:20:00Z',
  },
  {
    id: 7,
    title: 'System Status Icons',
    description:
      'Essential system status icons for embedded projects. Battery, WiFi, Bluetooth, and connectivity indicators.',
    author: 'system_designer',
    price: '$2.49',
    likes: 201,
    downloads: 156,
    views: '720',
    resolution: '16x16',
    tags: ['system', 'status', 'icons', 'embedded'],
    preview: `    ████    
  ██    ██  
██        ██
██   ██   ██
██        ██
  ██    ██  
    ████    `,
    format: 'Universal',
    category: 'Icons',
    featured: false,
    createdAt: '2024-01-09T08:45:00Z',
    updatedAt: '2024-01-09T08:45:00Z',
  },
  {
    id: 8,
    title: 'Retro UI Elements',
    description:
      'Complete retro UI kit with buttons, borders, and decorative elements. Perfect for vintage-style interfaces.',
    author: 'retro_ui_master',
    price: '$3.49',
    likes: 167,
    downloads: 89,
    views: '540',
    resolution: '128x64',
    tags: ['ui', 'retro', 'buttons', 'interface'],
    preview: `████████████████████
██                ██
██  ████    ████  ██
██  ████    ████  ██
██                ██
████████████████████`,
    format: 'SSD1306',
    category: 'UI Elements',
    featured: false,
    createdAt: '2024-01-08T15:10:00Z',
    updatedAt: '2024-01-08T15:10:00Z',
  },
  {
    id: 9,
    title: 'Sci-Fi Symbols',
    description:
      'Futuristic symbols and glyphs for sci-fi projects. Includes alien text, tech symbols, and space elements.',
    author: 'future_glyphs',
    price: '$2.99',
    likes: 134,
    downloads: 67,
    views: '430',
    resolution: '32x32',
    tags: ['sci-fi', 'symbols', 'futuristic', 'space'],
    preview: `  ██████████  
██          ██
██  ██  ██  ██
██    ██    ██
██  ██  ██  ██
██          ██
  ██████████  `,
    format: 'Universal',
    category: 'Symbols',
    featured: false,
    createdAt: '2024-01-07T12:30:00Z',
    updatedAt: '2024-01-07T12:30:00Z',
  },
  {
    id: 10,
    title: 'Pixel Font Collection',
    description:
      'Bitmap fonts optimized for tiny displays. Includes numbers, letters, and special characters in multiple sizes.',
    author: 'font_forge',
    price: '$4.49',
    likes: 298,
    downloads: 145,
    views: '980',
    resolution: 'Various',
    tags: ['fonts', 'typography', 'text', 'bitmap'],
    preview: `██████  ██████  ██████
██  ██  ██  ██  ██    
██████  ██████  ██    
██  ██  ██  ██  ██    
██  ██  ██████  ██████`,
    format: 'Universal',
    category: 'Typography',
    featured: false,
    createdAt: '2024-01-06T10:15:00Z',
    updatedAt: '2024-01-06T10:15:00Z',
  },
  {
    id: 11,
    title: 'Nature Scenes',
    description:
      'Serene 1-bit nature landscapes. Trees, mountains, and outdoor scenes perfect for ambient displays.',
    author: 'nature_artist',
    price: '$3.99',
    likes: 189,
    downloads: 78,
    views: '620',
    resolution: '128x64',
    tags: ['nature', 'landscapes', 'trees', 'outdoor'],
    preview: `        ████        
      ██    ██      
    ██        ██    
  ██            ██  
██                ██
████████████████████`,
    format: 'SSD1306',
    category: 'Landscapes',
    featured: false,
    createdAt: '2024-01-05T14:25:00Z',
    updatedAt: '2024-01-05T14:25:00Z',
  },
  {
    id: 12,
    title: 'Loading Animations',
    description:
      'Smooth loading animations and progress indicators. Frame-by-frame sequences for dynamic displays.',
    author: 'motion_master',
    price: '$5.99',
    likes: 356,
    downloads: 123,
    views: '1.1k',
    resolution: '64x64',
    tags: ['animations', 'loading', 'progress', 'dynamic'],
    preview: `      ████      
    ██    ██    
  ██        ██  
██            ██
  ██        ██  
    ██    ██    
      ████      `,
    format: 'Universal',
    category: 'Animations',
    featured: true,
    createdAt: '2024-01-04T09:40:00Z',
    updatedAt: '2024-01-04T09:40:00Z',
  },
];
