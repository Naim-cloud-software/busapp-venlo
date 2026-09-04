import { StopCall } from '../types';

export interface RouteTemplate {
  line: string;
  destinationMatch: string[];
  operator: string;
  type: 'stads' | 'streek' | 'express';
  stops: Array<{
    name: string;
    city: string;
    offsetMinutes: number;
    code?: string;
  }>;
}

export const OFFICIAL_VENLO_ROUTES: RouteTemplate[] = [
  {
    line: '1',
    destinationMatch: ['vosakker', 'blerick'],
    operator: 'Arriva Limburg',
    type: 'stads',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Venlo, Mgr. Nolensplein', city: 'Venlo', offsetMinutes: 2, code: 'NL:S:69000660' },
      { name: 'Venlo, Koninginnesingel', city: 'Venlo', offsetMinutes: 4, code: 'NL:S:69000500' },
      { name: 'Venlo, Eindhovenseweg', city: 'Venlo', offsetMinutes: 6 },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 9, code: 'NL:S:69110590' },
      { name: 'Blerick, Kloosterstraat', city: 'Blerick', offsetMinutes: 11 },
      { name: 'Blerick, Ruijsstraat', city: 'Blerick', offsetMinutes: 13 },
      { name: 'Blerick, Drie Decemberssingel', city: 'Blerick', offsetMinutes: 16 },
      { name: 'Blerick, Vosakker (Eindhalte)', city: 'Blerick', offsetMinutes: 19 },
    ],
  },
  {
    line: '2',
    destinationMatch: ['klingerberg', 'blerick'],
    operator: 'Arriva Limburg',
    type: 'stads',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Venlo, Goltziusstraat', city: 'Venlo', offsetMinutes: 3 },
      { name: 'Venlo, Maasbrug', city: 'Venlo', offsetMinutes: 5 },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 8, code: 'NL:S:69110590' },
      { name: 'Blerick, Lambertusplein', city: 'Blerick', offsetMinutes: 11 },
      { name: 'Blerick, Horsterweg', city: 'Blerick', offsetMinutes: 14 },
      { name: 'Blerick, Klingerbergsingel', city: 'Blerick', offsetMinutes: 17 },
      { name: 'Blerick, Klingerberg (Eindhalte)', city: 'Blerick', offsetMinutes: 20 },
    ],
  },
  {
    line: '3',
    destinationMatch: ['viecuri', 'zuid', 'kazerne'],
    operator: 'Arriva Limburg',
    type: 'stads',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Venlo, Keulsepoort', city: 'Venlo', offsetMinutes: 2 },
      { name: 'Venlo, Koninginnesingel', city: 'Venlo', offsetMinutes: 4, code: 'NL:S:69000500' },
      { name: 'Venlo, Walstraat', city: 'Venlo', offsetMinutes: 6, code: 'NL:S:69001150' },
      { name: 'Venlo, Tegelseweg', city: 'Venlo', offsetMinutes: 8, code: 'NL:S:69000990' },
      { name: 'Venlo, Ziekenhuis VieCuri (Hoofdingang)', city: 'Venlo', offsetMinutes: 11, code: 'NL:S:69001170' },
      { name: 'Venlo, Professor Gelissensingel', city: 'Venlo', offsetMinutes: 14 },
      { name: 'Venlo, Hagerhofweg', city: 'Venlo', offsetMinutes: 17 },
      { name: 'Venlo-Zuid, Kazerne Kwartier (Eindhalte)', city: 'Venlo', offsetMinutes: 21 },
    ],
  },
  {
    line: '66',
    destinationMatch: ['roermond', 'tegelen', 'reuver'],
    operator: 'Arriva Limburg',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Venlo, Koninginnesingel', city: 'Venlo', offsetMinutes: 3, code: 'NL:S:69000500' },
      { name: 'Venlo, Walstraat', city: 'Venlo', offsetMinutes: 5, code: 'NL:S:69001150' },
      { name: 'Venlo, Ziekenhuis VieCuri', city: 'Venlo', offsetMinutes: 8, code: 'NL:S:69001170' },
      { name: 'Tegelen, Station de Drink', city: 'Tegelen', offsetMinutes: 13, code: 'NL:S:69150270' },
      { name: 'Tegelen, Kerk / Centrum', city: 'Tegelen', offsetMinutes: 16 },
      { name: 'Tegelen, Keramiekcentrum', city: 'Tegelen', offsetMinutes: 19 },
      { name: 'Belfeld, Schoolstraat', city: 'Belfeld', offsetMinutes: 24 },
      { name: 'Belfeld, Centrum', city: 'Belfeld', offsetMinutes: 27 },
      { name: 'Reuver, Busstation', city: 'Reuver', offsetMinutes: 33 },
      { name: 'Swalmen, Station', city: 'Swalmen', offsetMinutes: 42 },
      { name: 'Roermond, Designer Outlet', city: 'Roermond', offsetMinutes: 52 },
      { name: 'Roermond, Station (Centraal)', city: 'Roermond', offsetMinutes: 56 },
    ],
  },
  {
    line: '70',
    destinationMatch: ['weert', 'baarlo', 'panningen', 'maasbree'],
    operator: 'Arriva Limburg',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 6, code: 'NL:S:69110590' },
      { name: 'Hout-Blerick, Groetweg', city: 'Hout-Blerick', offsetMinutes: 11, code: 'NL:S:69110730' },
      { name: 'Baarlo, Centrum', city: 'Baarlo', offsetMinutes: 17 },
      { name: 'Baarlo, De Berckt', city: 'Baarlo', offsetMinutes: 21 },
      { name: 'Maasbree, De Schout', city: 'Maasbree', offsetMinutes: 27 },
      { name: 'Helden, Mariaplein', city: 'Helden', offsetMinutes: 33 },
      { name: 'Panningen, Busstation', city: 'Panningen', offsetMinutes: 38 },
      { name: 'Meijel, Kerk', city: 'Meijel', offsetMinutes: 49 },
      { name: 'Nederweert, Centrum', city: 'Nederweert', offsetMinutes: 59 },
      { name: 'Weert, Station (Centraal)', city: 'Weert', offsetMinutes: 68 },
    ],
  },
  {
    line: '72',
    destinationMatch: ['roermond', 'kessel', 'baarlo'],
    operator: 'Arriva Limburg',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 6, code: 'NL:S:69110590' },
      { name: 'Hout-Blerick, Groetweg', city: 'Hout-Blerick', offsetMinutes: 11, code: 'NL:S:69110730' },
      { name: 'Baarlo, Centrum', city: 'Baarlo', offsetMinutes: 17 },
      { name: 'Kessel, Dorp', city: 'Kessel', offsetMinutes: 25 },
      { name: 'Neer, Centrum', city: 'Neer', offsetMinutes: 34 },
      { name: 'Haelen, Rijksweg', city: 'Haelen', offsetMinutes: 43 },
      { name: 'Horn, Centrum', city: 'Horn', offsetMinutes: 50 },
      { name: 'Roermond, Station (Centraal)', city: 'Roermond', offsetMinutes: 58 },
    ],
  },
  {
    line: '77',
    destinationMatch: ['roermond', 'viecuri'],
    operator: 'Arriva Limburg',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Venlo, Koninginnesingel', city: 'Venlo', offsetMinutes: 3, code: 'NL:S:69000500' },
      { name: 'Venlo, Walstraat', city: 'Venlo', offsetMinutes: 5, code: 'NL:S:69001150' },
      { name: 'Venlo, Ziekenhuis VieCuri', city: 'Venlo', offsetMinutes: 8, code: 'NL:S:69001170' },
      { name: 'Tegelen, Station de Drink', city: 'Tegelen', offsetMinutes: 13, code: 'NL:S:69150270' },
      { name: 'Tegelen, Kerk / Centrum', city: 'Tegelen', offsetMinutes: 17 },
      { name: 'Belfeld, Markt', city: 'Belfeld', offsetMinutes: 24 },
      { name: 'Reuver, Busstation', city: 'Reuver', offsetMinutes: 32 },
      { name: 'Swalmen, Station', city: 'Swalmen', offsetMinutes: 41 },
      { name: 'Roermond, Station (Centraal)', city: 'Roermond', offsetMinutes: 52 },
    ],
  },
  {
    line: '83',
    destinationMatch: ['nijmegen', 'gennep', 'arcen', 'velden'],
    operator: 'Arriva / Breng',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Venlo, Mgr. Nolensplein', city: 'Venlo', offsetMinutes: 2, code: 'NL:S:69000660' },
      { name: 'Venlo, Fontys & Koninginnesingel', city: 'Venlo', offsetMinutes: 5, code: 'NL:S:69000500' },
      { name: 'Venlo, Noorderpoort', city: 'Venlo', offsetMinutes: 8 },
      { name: 'Velden, Centrum', city: 'Velden', offsetMinutes: 13 },
      { name: 'Lomm, Kapel', city: 'Lomm', offsetMinutes: 19 },
      { name: 'Arcen, Kasteeltuinen', city: 'Arcen', offsetMinutes: 25 },
      { name: 'Arcen, Centrum / Veerweg', city: 'Arcen', offsetMinutes: 28 },
      { name: 'Wellerlooi, Rijksweg', city: 'Wellerlooi', offsetMinutes: 35 },
      { name: 'Bergen (L), Kerk', city: 'Bergen', offsetMinutes: 45 },
      { name: 'Gennep, Busstation', city: 'Gennep', offsetMinutes: 57 },
      { name: 'Mook, Molenhoek Station', city: 'Mook', offsetMinutes: 70 },
      { name: 'Nijmegen, Heyendaal (Campus)', city: 'Nijmegen', offsetMinutes: 82 },
      { name: 'Nijmegen, Centraal Station', city: 'Nijmegen', offsetMinutes: 89 },
    ],
  },
  {
    line: '86',
    destinationMatch: ['horst', 'sevenum'],
    operator: 'Arriva Limburg',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 6, code: 'NL:S:69110590' },
      { name: 'Blerick, Horsterweg', city: 'Blerick', offsetMinutes: 11 },
      { name: 'Sevenum, Steeg', city: 'Sevenum', offsetMinutes: 17 },
      { name: 'Sevenum, Centrum', city: 'Sevenum', offsetMinutes: 22 },
      { name: 'Horst, Station Horst-Sevenum (Eindhalte)', city: 'Horst', offsetMinutes: 29 },
    ],
  },
  {
    line: '87',
    destinationMatch: ['venray', 'horst', 'grubbenvorst'],
    operator: 'Arriva Limburg',
    type: 'streek',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 6, code: 'NL:S:69110590' },
      { name: 'Grubbenvorst, Centrum', city: 'Grubbenvorst', offsetMinutes: 14 },
      { name: 'Lottum, Markt', city: 'Lottum', offsetMinutes: 21 },
      { name: 'Horst, Station Horst-Sevenum', city: 'Horst', offsetMinutes: 30 },
      { name: 'Horst, Centrum', city: 'Horst', offsetMinutes: 36 },
      { name: 'Melderslo, Kerk', city: 'Melderslo', offsetMinutes: 45 },
      { name: 'Venray, Raayland College', city: 'Venray', offsetMinutes: 54 },
      { name: 'Venray, Station (Centraal)', city: 'Venray', offsetMinutes: 61 },
    ],
  },
  {
    line: '372',
    destinationMatch: ['panningen', 'maasbree'],
    operator: 'Arriva Limburg',
    type: 'express',
    stops: [
      { name: 'Venlo, Busstation (Centraal)', city: 'Venlo', offsetMinutes: 0, code: 'NL:S:69000900' },
      { name: 'Blerick, Station Kazernestraat', city: 'Blerick', offsetMinutes: 5, code: 'NL:S:69110590' },
      { name: 'Maasbree, Dorpstraat', city: 'Maasbree', offsetMinutes: 13 },
      { name: 'Panningen, Busstation (Eindhalte)', city: 'Panningen', offsetMinutes: 21 },
    ],
  },
];

/**
 * Calculates stop times and progress given a base departure time
 */
export function generateScheduleForLine(
  line: string,
  destination: string,
  baseTime: string,
  delayStr?: string,
  currentHalteName?: string
): StopCall[] {
  // Try finding exact template matching line and destination
  const cleanLine = line.replace(/\D/g, '') || line;
  const destLower = destination.toLowerCase();

  let template = OFFICIAL_VENLO_ROUTES.find(
    (t) => t.line === cleanLine && t.destinationMatch.some((d) => destLower.includes(d))
  );

  // Fallback by line number alone
  if (!template) {
    template = OFFICIAL_VENLO_ROUTES.find((t) => t.line === cleanLine);
  }

  // Parse departure time (HH:MM)
  let baseHour = 12;
  let baseMinute = 0;
  if (baseTime && baseTime.includes(':')) {
    const parts = baseTime.split(':').map((p) => parseInt(p, 10));
    if (!isNaN(parts[0])) baseHour = parts[0];
    if (!isNaN(parts[1])) baseMinute = parts[1];
  }

  const baseMinutesOfDay = baseHour * 60 + baseMinute;

  // Now comparison for wall clock
  const now = new Date();
  const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();

  if (template) {
    // If bus departs from an intermediate stop (e.g. current halte), adjust offset
    let startOffset = 0;
    if (currentHalteName) {
      const idx = template.stops.findIndex(
        (s) =>
          currentHalteName.toLowerCase().includes(s.name.toLowerCase().replace(/,.*/, '')) ||
          s.name.toLowerCase().includes(currentHalteName.toLowerCase().replace(/,.*/, ''))
      );
      if (idx > 0) {
        startOffset = template.stops[idx].offsetMinutes;
      }
    }

    return template.stops.map((stop, idx) => {
      const stopMinutes = baseMinutesOfDay + (stop.offsetMinutes - startOffset);
      const hh = String(Math.floor(stopMinutes / 60) % 24).padStart(2, '0');
      const mm = String(stopMinutes % 60).padStart(2, '0');
      const timeFormatted = `${hh}:${mm}`;

      const isCurrent = idx === 0 || (currentHalteName && stop.name.toLowerCase().includes(currentHalteName.toLowerCase().replace(/,.*/, '')));
      const isPassed = stopMinutes < currentMinutesOfDay - 1;

      return {
        code: stop.code,
        name: stop.name,
        time: timeFormatted,
        delay: delayStr,
        isPassed: !isCurrent && isPassed,
        isCurrent: Boolean(isCurrent),
      };
    });
  }

  // Generic fallback if line not in official catalog: create a clean 4-stop logical journey
  const fallbackStops = [
    { name: currentHalteName || 'Venlo, Busstation (Centraal)', mins: 0 },
    { name: 'Venlo, Mgr. Nolensplein (Centrum)', mins: 3 },
    { name: 'Blerick, Station Kazernestraat', mins: 8 },
    { name: destination ? `${destination} (Eindhalte)` : 'Regio Bestemming', mins: 16 },
  ];

  return fallbackStops.map((s, idx) => {
    const stopMins = baseMinutesOfDay + s.mins;
    const hh = String(Math.floor(stopMins / 60) % 24).padStart(2, '0');
    const mm = String(stopMins % 60).padStart(2, '0');
    return {
      name: s.name,
      time: `${hh}:${mm}`,
      delay: delayStr,
      isPassed: idx === 0 ? false : stopMins < currentMinutesOfDay,
      isCurrent: idx === 0,
    };
  });
}
