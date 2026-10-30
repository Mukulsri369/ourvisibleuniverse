-- Canonical public curriculum copied from the original reviewed PostgreSQL migration.
-- Contains no customer data. Existing definitions are retained on duplicate IDs.
INSERT INTO academy_courses (id, title, slug, description, total_stages, total_modules)
VALUES (
  'cosmic_journey',
  'Cosmic Journey: 24-Module Observable Universe Curriculum',
  'cosmic-journey',
  'From our home planet to the edge of the observable universe: comprehensive astronomy curriculum across 6 celestial stages.',
  6,
  24
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO academy_course_versions (course_id, version, status, passing_exam_threshold)
VALUES ('cosmic_journey', '1.0.0', 'active', 80.0)
ON DUPLICATE KEY UPDATE course_id=course_id;

-- Seed all 24 Modules
INSERT INTO academy_modules (id, course_id, stage_id, number, slug, title, subtitle, description, estimated_minutes)
VALUES
  ('01', 'cosmic_journey', 1, 1, 'our-place-in-the-universe', 'Our Place in the Universe', 'Cosmic Address & Scales', 'Explore Earth, the Solar System, the Milky Way, Local Group, and Laniakea Supercluster.', 25),
  ('02', 'cosmic_journey', 1, 2, 'the-night-sky-and-constellations', 'The Night Sky & Constellations', 'Virtual Planetarium & Celestial Sphere', 'Learn how the night sky moves, find constellations, and locate Polaris in our interactive 3D planetarium.', 30),
  ('03', 'cosmic_journey', 1, 3, 'cosmic-distances-and-scale', 'Cosmic Distances & Scale', 'Powers of Ten & Astronomical Units', 'Journey from the human scale to the edge of the observable universe through interactive powers-of-ten zoom.', 25),
  ('04', 'cosmic_journey', 1, 4, 'light-time-and-cosmic-observation', 'Light, Time & Observation', 'Speed of Light & Lookback Time', 'Discover how light acts as a cosmic time machine, carrying photons billions of years across space to our eyes.', 30),
  ('05', 'cosmic_journey', 2, 5, 'earth-moon-and-seasons', 'Earth, Moon & Seasons', 'Axial Tilt & Orbital Rhythms', 'Investigate axial tilt, seasonal solstices, lunar orbit geometry, and why solar and lunar eclipses happen.', 25),
  ('06', 'cosmic_journey', 2, 6, 'the-solar-system-worlds', 'The Solar System Worlds', 'Terrestrial Planets to the Kuiper Belt', 'Navigate planetary worlds, rocky inner worlds, gas giants, icy moons, and dwarf planets.', 35),
  ('07', 'cosmic_journey', 2, 7, 'the-sun-our-living-star', 'The Sun: Our Living Star', 'Thermonuclear Core to Space Weather', 'Explore the solar core, radiative zone, sunspots, coronal mass ejections, and the solar wind.', 25),
  ('08', 'cosmic_journey', 2, 8, 'gravity-and-orbital-mechanics', 'Gravity & Orbital Mechanics', 'Keplerian Orbits & Escape Velocity', 'Experiment with gravity, Keplerian orbital velocities, Hohmann transfers, and gravitational slingshots.', 30),
  ('09', 'cosmic_journey', 3, 9, 'stars-and-how-they-work', 'Stars & How They Work', 'Nuclear Fusion, Spectra & HR Diagram', 'Decode stellar spectra, blackbody radiation, surface temperatures, and the Hertzsprung-Russell diagram.', 30),
  ('10', 'cosmic_journey', 3, 10, 'stellar-evolution-and-death', 'Stellar Evolution & Death', 'Protostars to Supernovae', 'Follow stellar lifecycles from nebular collapse through main sequence fusion to white dwarfs and supernovae.', 35),
  ('11', 'cosmic_journey', 3, 11, 'nebulae-and-star-nurseries', 'Nebulae & Star Nurseries', 'Interstellar Gas & Star Formation', 'Inspect emission, reflection, and planetary nebulae along with young open clusters and ancient globular clusters.', 25),
  ('12', 'cosmic_journey', 3, 12, 'exoplanets-and-alien-worlds', 'Exoplanets & Alien Worlds', 'Transit Photometry & Habitable Zones', 'Discover exoplanets using the transit and radial velocity methods, examining atmospheric biosignatures.', 30),
  ('13', 'cosmic_journey', 4, 13, 'galaxies-and-the-milky-way', 'Galaxies & the Milky Way', 'Spiral Arms, Bulges & Galactic Morphology', 'Examine spiral, barred, elliptical, and irregular galaxies using real observational catalogs and 3D models.', 35),
  ('14', 'cosmic_journey', 4, 14, 'black-holes-and-extreme-objects', 'Black Holes & Extreme Physics', 'Event Horizons, Pulsars & Gravitational Waves', 'Explore Schwarzschild radii, gravitational lensing, magnetars, and gravitational wave chirps from colliding black holes.', 35),
  ('15', 'cosmic_journey', 4, 15, 'the-cosmic-web-large-scale-structure', 'The Cosmic Web', 'Filaments, Superclusters & Voids', 'Explore large-scale filaments, Sloan Great Wall, Bootes void, and galaxy clusters spanning hundreds of millions of light-years.', 30),
  ('16', 'cosmic_journey', 4, 16, 'dark-matter-and-dark-energy', 'Dark Matter & Dark Energy', 'Rotational Curves & Accelerating Expansion', 'Analyze galaxy rotation curves, gravitational lensing by dark matter halos, and accelerated cosmic expansion.', 30),
  ('17', 'cosmic_journey', 5, 17, 'the-big-bang-and-cosmic-dawn', 'The Big Bang & Early Cosmos', 'Cosmic Inflation, Nucleosynthesis & CMB', 'Travel back 13.8 billion years to the Big Bang, primordial nucleosynthesis, and the Cosmic Microwave Background.', 35),
  ('18', 'cosmic_journey', 5, 18, 'the-expanding-universe-and-redshift', 'The Expanding Universe & Redshift', 'Hubble-Lemaître Law & Metric Expansion', 'Understand cosmological redshift wave-stretching, Hubble parameters, and the cosmological horizon.', 30),
  ('19', 'cosmic_journey', 5, 19, 'history-of-human-cosmology', 'History of Cosmology', 'Ancient Epicycles to General Relativity', 'Discover how human understanding transformed from geocentric spheres to Copernican heliocentrism and Einsteinian spacetime.', 25),
  ('20', 'cosmic_journey', 5, 20, 'the-future-of-the-universe', 'The Future of the Universe', 'Big Freeze, Heat Death & Long Cosmological Timelines', 'Project trillions of years into the cosmic future across the Stelliferous, Degenerate, Black Hole, and Dark Eras.', 30),
  ('21', 'cosmic_journey', 6, 21, 'telescopes-and-observatories', 'Telescopes & Observation', 'Optical, Radio & Space Observatories', 'Compare ground-based optical telescopes, radio arrays, and space observatories like Hubble, JWST, and Chandra.', 30),
  ('22', 'cosmic_journey', 6, 22, 'space-missions-and-exploration', 'Space Missions & Robotics', 'Voyagers, Rovers & Deep Space Probes', 'Study interplanetary trajectories, robotic rovers on Mars, and Voyager probes crossing the heliopause into interstellar space.', 30),
  ('23', 'cosmic_journey', 6, 23, 'astrobiology-and-search-for-life', 'Astrobiology & Life in Space', 'Extremophiles, Habitable Zones & SETI', 'Investigate extremophiles on Earth, subsurface oceans on Europa and Enceladus, and atmospheric biosignatures.', 30),
  ('24', 'cosmic_journey', 6, 24, 'the-cosmic-laboratory-capstone', 'The Cosmic Laboratory', 'Unified Capstone Physics & Astrometry', 'Synthesize all 23 prior astronomical domains in a hands-on astrophysics laboratory simulation.', 40)
ON DUPLICATE KEY UPDATE id=id;

-- Seed Module Versions for all 24
INSERT INTO academy_module_versions (module_id, version, completion_rule_version, minimum_quiz_score_pct)
SELECT id, '1.0.0', '1.0.0', 80.0 FROM academy_modules
ON DUPLICATE KEY UPDATE module_id=module_id;

-- Seed Lessons
INSERT INTO academy_lessons (id, module_id, order_index, title, visualization_type, objectives)
SELECT
  CONCAT(id, '-core'),
  id,
  1,
  title,
  'cosmic-scale',
  JSON_ARRAY('Master key physical principles', 'Conduct hands-on experiment', 'Complete verified knowledge assessment')
FROM academy_modules
ON DUPLICATE KEY UPDATE id=VALUES(id);

-- A lesson belongs to exactly its declared module, including direct database writes.
ALTER TABLE academy_lessons ADD UNIQUE KEY academy_lesson_module (id,module_id);
ALTER TABLE academy_lesson_progress ADD CONSTRAINT academy_progress_lesson_module
  FOREIGN KEY (lesson_id,module_id) REFERENCES academy_lessons(id,module_id) ON DELETE CASCADE;
ALTER TABLE academy_lesson_progress ADD CONSTRAINT academy_reading_time_nonnegative
  CHECK (time_spent_seconds >= 0);
