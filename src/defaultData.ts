import { Halte } from './types';

export const DEFAULT_HALTES: Halte[] = [
  {
    id: 'venlo_station',
    code: 'NL:S:69000900',
    name: 'Venlo, Busstation (Centraal)',
    type: 'Hoofdstation & Busplatform',
    icon: 'train',
    city: 'Venlo',
  },
  {
    id: 'hospital_viecuri',
    code: 'NL:S:69001170',
    name: 'Venlo, Ziekenhuis VieCuri',
    type: 'Medisch Centrum & Polikliniek',
    icon: 'activity',
    city: 'Venlo',
  },
  {
    id: 'blerick_station',
    code: 'NL:S:69110590',
    name: 'Blerick, Station Kazernestraat',
    type: 'Trein- & Busstation',
    icon: 'train',
    city: 'Blerick',
  },
  {
    id: 'tegelen_station',
    code: 'NL:S:69150270',
    name: 'Tegelen, Station de Drink',
    type: 'Regio Busknooppunt',
    icon: 'map-pin',
    city: 'Tegelen',
  },
  {
    id: 'fontys_venlo',
    code: 'NL:S:69000500',
    name: 'Venlo, Fontys & Koninginnesingel',
    type: 'Campus & Onderwijs',
    icon: 'graduation-cap',
    city: 'Venlo',
  },
  {
    id: 'centrum_nolens',
    code: 'NL:S:69000660',
    name: 'Venlo, Mgr. Nolensplein (Centrum)',
    type: 'Binnenstad & Markt',
    icon: 'shopping-bag',
    city: 'Venlo',
  },
];
