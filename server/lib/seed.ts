import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

const SAMPLE_LEADS = [
  {
    name: 'Marisol Vega',
    email: 'marisol.vega@example.com',
    phone: '602-555-0118',
    source: 'website-form',
    jobType: 'kitchen remodel',
    location: 'Phoenix, AZ',
    notes:
      'Looking to remodel a 200 sqft kitchen. Have a Pinterest board. Hoping to start within 60 days, budget around $40k.',
  },
  {
    name: 'Daniel Kim',
    email: 'dkim@gmail.com',
    phone: null,
    source: 'website-form',
    jobType: 'kitchen remodel',
    location: null,
    notes: 'just curious about pricing',
  },
  {
    name: 'Caller 0184',
    email: null,
    phone: '480-555-0184',
    source: 'missed-call',
    jobType: null,
    location: null,
    notes: 'Missed call, duration 38s',
  },
  {
    name: 'Sandra Bell',
    email: 'sandra.bell@example.com',
    phone: '928-555-0294',
    source: 'website-form',
    jobType: 'bathroom repair',
    location: 'Flagstaff, AZ',
    notes:
      'Master bathroom shower is leaking into the ceiling below. Need someone out this week if possible.',
  },
  {
    name: 'Procurement Team',
    email: 'no-reply@vendorpitch.example',
    phone: null,
    source: 'website-form',
    jobType: null,
    location: null,
    notes:
      'We help home services businesses scale revenue 10x with our SEO platform. Reply for a demo.',
  },
];

export function seedSampleLeads() {
  const insert = db.prepare(
    `INSERT INTO leads (id, name, email, phone, source, job_type, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const l of SAMPLE_LEADS) {
    insert.run(randomUUID(), l.name, l.email, l.phone, l.source, l.jobType, l.location, l.notes);
  }
}

export function resetAndSeed() {
  db.prepare('DELETE FROM outreach').run();
  db.prepare('DELETE FROM ai_calls').run();
  db.prepare('DELETE FROM leads').run();
  seedSampleLeads();
}

export function isLeadsEmpty(): boolean {
  const row = db.prepare('SELECT COUNT(*) as n FROM leads').get() as { n: number };
  return row.n === 0;
}
