-- Migration: 0002_create_astronomical_catalog_tables.sql
-- Description: Creates canonical astronomical catalog, objects, measurements provenance, and spatial tiling tables.

-- 1. Catalog Registry
CREATE TABLE IF NOT EXISTS public.astronomical_catalogs (
  id text PRIMARY KEY,
  name text NOT NULL,
  provider text NOT NULL,
  version text NOT NULL,
  description text,
  homepage_url text NOT NULL,
  tap_endpoint text,
  license text NOT NULL,
  attribution text NOT NULL,
  bibcode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ingestion Batches (Staging, Validation & Atomic Publication)
CREATE TABLE IF NOT EXISTS public.catalog_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id text NOT NULL REFERENCES public.astronomical_catalogs(id),
  batch_number integer NOT NULL,
  status text NOT NULL DEFAULT 'staging' CHECK (status IN ('staging', 'validating', 'published', 'failed', 'superseded')),
  object_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- 3. Canonical Astronomical Objects
CREATE TABLE IF NOT EXISTS public.astronomical_objects (
  canonical_id text PRIMARY KEY,
  name text NOT NULL,
  alternate_names text[] NOT NULL DEFAULT '{}',
  object_type text NOT NULL CHECK (
    object_type IN (
      'star', 'exoplanet', 'galaxy', 'nebula', 'black_hole',
      'pulsar', 'neutron_star', 'quasar', 'solar_system_body',
      'cluster', 'supernova_remnant'
    )
  ),
  subtype text,
  parent_host_id text,
  primary_catalog_id text NOT NULL REFERENCES public.astronomical_catalogs(id),
  primary_source_id text NOT NULL,
  status text NOT NULL DEFAULT 'observational' CHECK (status IN ('observational', 'inferred', 'simulated')),
  confidence double precision NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  
  -- Astrometry & Coordinates (ICRS J2000 standard)
  ra_deg double precision NOT NULL CHECK (ra_deg >= 0.0 AND ra_deg < 360.0),
  dec_deg double precision NOT NULL CHECK (dec_deg >= -90.0 AND dec_deg <= 90.0),
  coordinate_frame text NOT NULL DEFAULT 'ICRS',
  reference_epoch text NOT NULL DEFAULT 'J2000.0',
  
  -- Distance & Kinematics
  distance_ly double precision NOT NULL CHECK (distance_ly >= 0.0),
  distance_uncertainty_ly double precision,
  distance_method text,
  parallax_mas double precision,
  parallax_error_mas double precision,
  proper_motion_ra_mas_yr double precision,
  proper_motion_dec_mas_yr double precision,
  radial_velocity_km_s double precision,
  redshift double precision,
  redshift_uncertainty double precision,
  
  -- Astrophysics & Physical Dimensions
  spectral_type text,
  morphological_class text,
  temperature_k double precision,
  luminosity_solar double precision,
  mass_solar double precision,
  radius_solar double precision,
  physical_properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  orbital_elements jsonb,
  data_quality_flags text[] NOT NULL DEFAULT '{}',
  
  -- Provenance & Attribution
  source_url text,
  catalog_version text NOT NULL,
  retrieval_timestamp timestamptz NOT NULL DEFAULT now(),
  license text NOT NULL,
  attribution text NOT NULL,
  bibcode text,
  
  -- Spatial Indexing & Partitioning
  spatial_tile_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_catalog_source UNIQUE (primary_catalog_id, primary_source_id)
);

-- 4. Multi-Catalog Measurements & Conflicting Provenance Tracking
CREATE TABLE IF NOT EXISTS public.catalog_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_id text NOT NULL REFERENCES public.astronomical_objects(canonical_id) ON DELETE CASCADE,
  catalog_id text NOT NULL REFERENCES public.astronomical_catalogs(id),
  parameter_name text NOT NULL,
  parameter_value jsonb NOT NULL,
  uncertainty jsonb,
  method text,
  bibcode text,
  citation text,
  retrieval_timestamp timestamptz NOT NULL DEFAULT now()
);

-- 5. Indexes for Fast Spatial, Distance, and Full-Text Search
CREATE INDEX IF NOT EXISTS idx_astro_coords ON public.astronomical_objects (ra_deg, dec_deg);
CREATE INDEX IF NOT EXISTS idx_astro_distance ON public.astronomical_objects (distance_ly);
CREATE INDEX IF NOT EXISTS idx_astro_tile ON public.astronomical_objects (spatial_tile_id);
CREATE INDEX IF NOT EXISTS idx_astro_type ON public.astronomical_objects (object_type);
CREATE INDEX IF NOT EXISTS idx_astro_parent ON public.astronomical_objects (parent_host_id);
CREATE INDEX IF NOT EXISTS idx_astro_measurements_canonical ON public.catalog_measurements (canonical_id);

-- GIN Full Text Search across primary name and alternate designations
CREATE INDEX IF NOT EXISTS idx_astro_fts ON public.astronomical_objects 
  USING gin (to_tsvector('english', name || ' ' || array_to_string(alternate_names, ' ')));

-- 6. Permissions and Row Level Security (Public Read-Only Access)
ALTER TABLE public.astronomical_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.astronomical_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read astronomical catalogs"
  ON public.astronomical_catalogs FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public read astronomical objects"
  ON public.astronomical_objects FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public read catalog measurements"
  ON public.catalog_measurements FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public read catalog batches"
  ON public.catalog_batches FOR SELECT TO anon, authenticated
  USING (status = 'published');

GRANT SELECT ON public.astronomical_catalogs TO anon, authenticated;
GRANT SELECT ON public.astronomical_objects TO anon, authenticated;
GRANT SELECT ON public.catalog_measurements TO anon, authenticated;
GRANT SELECT ON public.catalog_batches TO anon, authenticated;

GRANT ALL ON public.astronomical_catalogs TO service_role;
GRANT ALL ON public.astronomical_objects TO service_role;
GRANT ALL ON public.catalog_measurements TO service_role;
GRANT ALL ON public.catalog_batches TO service_role;
