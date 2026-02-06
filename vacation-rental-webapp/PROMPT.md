# Prompt — Webapp Casa Vacanza (Modern Stack)

## Obiettivo

Realizzare una webapp moderna, responsive e performante per la gestione e prenotazione di una **casa vacanza**. L'applicazione deve offrire un'esperienza utente premium, paragonabile a piattaforme come Airbnb, con un design minimalista, animazioni fluide e funzionalità complete sia per l'ospite che per il proprietario.

---

## Tech Stack

| Layer | Tecnologia |
|---|---|
| **Framework** | Next.js 14+ (App Router, Server Components, Server Actions) |
| **Linguaggio** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4 + shadcn/ui + Framer Motion |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Drizzle ORM |
| **Auth** | Supabase Auth (Google, Email Magic Link) |
| **Pagamenti** | Stripe (Checkout Sessions + Webhooks) |
| **Storage immagini** | Supabase Storage + CDN (con ottimizzazione via next/image) |
| **Mappe** | Mapbox GL JS |
| **Calendario** | react-day-picker + logica disponibilità custom |
| **Email transazionali** | Resend (con React Email per i template) |
| **Validazione** | Zod (shared schemas client/server) |
| **State management** | Zustand (solo dove necessario, preferire Server State) |
| **Testing** | Vitest + Playwright |
| **Deploy** | Vercel |
| **Analytics** | Vercel Analytics + PostHog |
| **i18n** | next-intl (IT / EN / DE / FR) |

---

## Struttura Pagine

### Pubbliche (Guest)

1. **Homepage (`/`)**
   - Hero a tutto schermo con video/immagine della proprietà + parallax scroll
   - Sezione "Highlights" con icone animate (piscina, WiFi, vista mare, parcheggio, ecc.)
   - Galleria fotografica immersiva (lightbox con swipe gesture, lazy loading, blur placeholder)
   - Sezione recensioni con rating medio e carosello testimonianze
   - Mappa interattiva con punti di interesse nelle vicinanze
   - Widget "Verifica Disponibilità" sempre visibile (sticky su mobile)
   - FAQ con accordion animato
   - Footer con contatti, social e link rapidi

2. **Pagina Dettaglio / Prenota (`/prenota`)**
   - Calendario interattivo con:
     - Notti minime/massime configurabili
     - Prezzi dinamici per stagione (bassa, media, alta, festivi)
     - Blocco date già prenotate (grigio + tooltip)
     - Sconti per soggiorni lunghi (7+ notti, 30+ notti)
   - Riepilogo prenotazione in tempo reale:
     - Prezzo per notte × notti
     - Tassa di soggiorno
     - Costo pulizia finale
     - Eventuali sconti applicati
     - **Totale**
   - Form ospite: nome, email, telefono, numero ospiti, note speciali
   - Checkout Stripe integrato (redirect o embedded)
   - Conferma prenotazione con animazione di successo

3. **Pagina Esperienza (`/esperienza`)**
   - Virtual tour 360° (embed Matterport o simile)
   - Guida del quartiere / zona con tips del proprietario
   - Attività consigliate (spiagge, ristoranti, escursioni) con link e distanze

4. **Pagina Contatti (`/contatti`)**
   - Form di contatto con validazione
   - WhatsApp direct link
   - Mappa con indicazioni stradali

5. **Pagina Recensioni (`/recensioni`)**
   - Tutte le recensioni con filtri (rating, data, lingua)
   - Rating aggregato per categoria (pulizia, posizione, comfort, rapporto qualità/prezzo)

### Protette (Proprietario — Dashboard)

6. **Dashboard (`/dashboard`)**
   - Overview: prenotazioni attive, entrate mese corrente, tasso di occupazione
   - Grafici (Recharts): revenue mensile, occupazione %, provenienza ospiti
   - Notifiche recenti

7. **Gestione Prenotazioni (`/dashboard/prenotazioni`)**
   - Tabella prenotazioni con filtri e ricerca
   - Dettaglio singola prenotazione (dati ospite, pagamento, stato)
   - Azioni: conferma manuale, cancella, rimborso parziale, invia messaggio
   - Export CSV/PDF

8. **Gestione Calendario (`/dashboard/calendario`)**
   - Vista calendario mensile drag & drop
   - Blocco/sblocco date manuali
   - Impostazione prezzi per periodo (con bulk edit)
   - Sincronizzazione iCal (import/export per Airbnb, Booking.com)

9. **Gestione Contenuti (`/dashboard/contenuti`)**
   - Editor descrizioni (Rich Text con Tiptap)
   - Upload/riordino foto (drag & drop con crop e compressione automatica)
   - Gestione servizi/amenità

10. **Impostazioni (`/dashboard/impostazioni`)**
    - Profilo proprietario
    - Configurazione Stripe
    - Template email personalizzabili
    - Regole prenotazione (anticipo minimo, politica cancellazione, check-in/check-out)

---

## Funzionalità Chiave

### Prenotazione & Pagamenti
- Calcolo prezzo dinamico (stagionalità, durata, sconti)
- Checkout Stripe con 3D Secure
- Conferma automatica via email (con PDF riepilogo allegato)
- Promemoria check-in (3 giorni prima) via email
- Gestione cancellazioni con politiche configurabili (flessibile / moderata / rigida)
- Webhook Stripe per aggiornamento stato in tempo reale

### Calendario & Disponibilità
- Sincronizzazione bidirezionale iCal (Airbnb, Booking.com, Google Calendar)
- Blocco automatico date dopo prenotazione confermata
- Prezzi differenziati per: giorno della settimana, stagione, eventi speciali
- Soggiorno minimo variabile per periodo

### Comunicazione
- Email transazionali automatiche:
  - Conferma prenotazione
  - Promemoria check-in (con istruzioni arrivo, codice porta, WiFi)
  - Richiesta recensione post-soggiorno
  - Conferma cancellazione/rimborso
- Integrazione WhatsApp Business (link diretto con messaggio precompilato)

### SEO & Performance
- Metadata dinamici per ogni pagina
- Schema.org markup (LodgingBusiness, Product, Review)
- Sitemap.xml automatica
- Open Graph e Twitter Cards
- Core Web Vitals ottimizzati (target: tutti verdi)
- ISR (Incremental Static Regeneration) per pagine pubbliche
- Image optimization con `next/image` e formati WebP/AVIF

### Accessibilità (a11y)
- WCAG 2.1 AA compliance
- Navigazione da tastiera completa
- Screen reader friendly (ARIA labels)
- Contrasto colori verificato
- Focus indicators visibili
- Riduzione animazioni (prefers-reduced-motion)

---

## Design System

### Palette Colori (esempio tema mediterraneo)

```css
--color-primary: #1B4965;      /* Blu profondo — header, CTA */
--color-secondary: #CAE9FF;    /* Azzurro chiaro — sfondi, hover */
--color-accent: #F4A261;       /* Arancione dorato — bottoni, badge */
--color-success: #2A9D8F;      /* Verde acqua — conferme */
--color-danger: #E76F51;       /* Corallo — errori, cancellazioni */
--color-background: #FAFAF9;   /* Bianco caldo */
--color-surface: #FFFFFF;      /* Card, modali */
--color-text: #1A1A1A;         /* Testo primario */
--color-text-muted: #6B7280;   /* Testo secondario */
```

### Tipografia
- **Heading:** `Cal Sans` o `Plus Jakarta Sans` (bold, modern)
- **Body:** `Inter` (leggibilità, variabile font)
- **Monospace:** `JetBrains Mono` (per codici prenotazione, prezzi)

### Componenti UI
- Card con glassmorphism leggero (backdrop-blur)
- Bottoni con micro-animazioni al hover/press
- Skeleton loading per ogni sezione
- Toast notifications (sonner)
- Dialog/Sheet per azioni rapide
- Animazioni di entrata con Framer Motion (stagger children)

### Responsive Breakpoints
- Mobile first
- `sm: 640px` | `md: 768px` | `lg: 1024px` | `xl: 1280px` | `2xl: 1536px`

---

## Schema Database (Drizzle ORM)

```typescript
// Tabelle principali

properties
  id: uuid (PK)
  name: varchar(255)
  description: text
  short_description: varchar(500)
  address: text
  latitude: decimal
  longitude: decimal
  max_guests: integer
  bedrooms: integer
  bathrooms: integer
  amenities: jsonb
  check_in_time: time
  check_out_time: time
  created_at: timestamp
  updated_at: timestamp

property_images
  id: uuid (PK)
  property_id: uuid (FK → properties)
  url: text
  alt_text: varchar(255)
  order: integer
  is_cover: boolean

seasons
  id: uuid (PK)
  property_id: uuid (FK → properties)
  name: varchar(100)      // "Alta Stagione", "Bassa Stagione"
  start_date: date
  end_date: date
  price_per_night: decimal(10,2)
  min_nights: integer
  created_at: timestamp

bookings
  id: uuid (PK)
  property_id: uuid (FK → properties)
  guest_name: varchar(255)
  guest_email: varchar(255)
  guest_phone: varchar(50)
  num_guests: integer
  check_in: date
  check_out: date
  num_nights: integer
  price_per_night: decimal(10,2)
  cleaning_fee: decimal(10,2)
  tourist_tax: decimal(10,2)
  discount: decimal(10,2)
  total_price: decimal(10,2)
  currency: varchar(3) default 'EUR'
  status: enum('pending', 'confirmed', 'cancelled', 'completed')
  stripe_session_id: varchar(255)
  stripe_payment_intent: varchar(255)
  notes: text
  created_at: timestamp
  updated_at: timestamp

blocked_dates
  id: uuid (PK)
  property_id: uuid (FK → properties)
  date: date
  reason: varchar(255)    // "Manutenzione", "Uso personale", "Airbnb"

reviews
  id: uuid (PK)
  booking_id: uuid (FK → bookings)
  property_id: uuid (FK → properties)
  guest_name: varchar(255)
  rating: integer (1-5)
  cleanliness: integer (1-5)
  location: integer (1-5)
  comfort: integer (1-5)
  value: integer (1-5)
  comment: text
  language: varchar(5)
  is_published: boolean default true
  created_at: timestamp

users (proprietari)
  id: uuid (PK)
  email: varchar(255) unique
  full_name: varchar(255)
  role: enum('owner', 'admin')
  created_at: timestamp
```

---

## Struttura Progetto

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Homepage
│   │   ├── prenota/page.tsx            # Prenotazione
│   │   ├── esperienza/page.tsx         # Virtual tour & guida
│   │   ├── recensioni/page.tsx         # Recensioni
│   │   └── contatti/page.tsx           # Contatti
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx                # Overview
│   │       ├── prenotazioni/page.tsx   # Gestione prenotazioni
│   │       ├── calendario/page.tsx     # Calendario
│   │       ├── contenuti/page.tsx      # CMS
│   │       └── impostazioni/page.tsx   # Settings
│   ├── api/
│   │   ├── webhooks/stripe/route.ts
│   │   ├── bookings/route.ts
│   │   ├── availability/route.ts
│   │   └── ical/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── booking/
│   │   ├── calendar.tsx
│   │   ├── price-summary.tsx
│   │   └── guest-form.tsx
│   ├── gallery/
│   │   ├── photo-grid.tsx
│   │   └── lightbox.tsx
│   ├── map/
│   │   └── interactive-map.tsx
│   ├── reviews/
│   │   ├── review-card.tsx
│   │   └── rating-stars.tsx
│   └── layout/
│       ├── header.tsx
│       ├── footer.tsx
│       └── mobile-nav.tsx
├── lib/
│   ├── db/
│   │   ├── schema.ts                   # Drizzle schema
│   │   └── queries.ts                  # Query helpers
│   ├── stripe.ts
│   ├── supabase.ts
│   ├── email.ts
│   ├── ical.ts
│   ├── pricing.ts                      # Logica calcolo prezzi
│   └── validators.ts                   # Zod schemas
├── hooks/
│   ├── use-availability.ts
│   ├── use-booking.ts
│   └── use-media-query.ts
├── stores/
│   └── booking-store.ts                # Zustand
├── types/
│   └── index.ts
└── messages/
    ├── it.json
    ├── en.json
    ├── de.json
    └── fr.json
```

---

## Istruzioni per lo Sviluppo

1. **Inizia con** `npx create-next-app@latest --typescript --tailwind --app --src-dir`
2. **Installa shadcn/ui** con `npx shadcn@latest init` e aggiungi i componenti necessari
3. **Configura Supabase** (progetto + tabelle + RLS policies)
4. **Implementa le pagine pubbliche** (homepage → prenota → contatti)
5. **Integra Stripe** (checkout + webhooks)
6. **Costruisci la dashboard** proprietario
7. **Aggiungi i18n** con next-intl
8. **Testa tutto** con Vitest (unit) e Playwright (e2e)
9. **Deploy su Vercel** con variabili d'ambiente configurate

---

## Variabili d'Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEFAULT_LOCALE=it
```
