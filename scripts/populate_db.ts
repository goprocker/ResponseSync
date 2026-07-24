import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ipusfdckrmhsuxgcxtfo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing in .env file!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateAll() {
  console.log('🚀 Populating all Supabase tables (hospitals & simulations)...');

  // Populate Hospitals
  const hospitals = [
    {
      id: 'hosp-01',
      name: 'Gleneagles Global Health City (Velachery)',
      total_beds: 450,
      available_icu_beds: 18,
      trauma_center_active: true,
      status: 'operational',
      coordinates: [12.9750, 80.2240]
    },
    {
      id: 'hosp-02',
      name: 'Guindy Super Specialty Hospital',
      total_beds: 300,
      available_icu_beds: 8,
      trauma_center_active: true,
      status: 'strained',
      coordinates: [13.0095, 80.2150]
    }
  ];

  const { error: hErr } = await supabase.from('hospitals').upsert(hospitals);
  if (hErr) console.warn('Hospitals upsert:', hErr.message);
  else console.log('✅ Hospitals populated successfully!');

  // Populate Simulations
  const simulations = [
    {
      id: 'sim-2015-12-01',
      title: 'December 2015 Chennai Cloudburst & Chembarambakkam Release',
      rainfall_mm_hr: 95,
      dam_discharge_m3s: 1800,
      canal_blockage_pct: 80,
      affected_zones_count: 4,
      predicted_submerged_area_km2: 5.2,
      estimated_affected_people: 72000,
      effectiveness_score: 91,
      outcome: 'Rescued 4,200 stranded residents with 91% effectiveness score',
      lessons_learned: 'Pre-positioning rescue boats prior to T+30 minutes reduces medical transport delay by 42%.'
    },
    {
      id: 'sim-2023-12-04',
      title: 'December 2023 Cyclone Michaung Overflow',
      rainfall_mm_hr: 80,
      dam_discharge_m3s: 1200,
      canal_blockage_pct: 65,
      affected_zones_count: 3,
      predicted_submerged_area_km2: 3.8,
      estimated_affected_people: 48000,
      effectiveness_score: 88,
      outcome: 'Dewatering pumps deployed at 100ft road canal sluice reduced standing water duration by 14h',
      lessons_learned: 'Automated road barricading at subways prevents vehicular entrapment.'
    }
  ];

  const { error: sErr } = await supabase.from('simulations').upsert(simulations);
  if (sErr) console.warn('Simulations upsert:', sErr.message);
  else console.log('✅ Simulations populated successfully!');
}

populateAll();
