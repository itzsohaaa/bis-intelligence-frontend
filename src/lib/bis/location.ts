import type { LaboratoryRecord } from "./types";

/**
 * Structured verified location metadata with full provenance chain:
 * LAB RECORD -> SOURCE -> EXACT ADDRESS -> LOCATION ENRICHMENT -> MAP LINK
 */
export interface VerifiedLocation {
  address: string;
  address_source_url: string;
  address_source_title: string;
  address_verified_at: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  google_maps_url?: string;
}

/**
 * Authoritative registry of exact verified laboratory addresses from
 * official Bureau of Indian Standards (bis.gov.in) and National Test House (nth.gov.in) records.
 * Never invented or guessed from city/state.
 */
export const VERIFIED_LABORATORY_LOCATIONS: Record<string, VerifiedLocation> = {
  lab_bis_cl: {
    address: "Plot No. 20/9, Site IV, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh 201010",
    address_source_url: "https://www.bis.gov.in/index.php/laboratory-services/central-laboratory/",
    address_source_title: "Bureau of Indian Standards Central Laboratory Official Directory",
    address_verified_at: "2026-09-27T00:00:00Z",
    latitude: 28.6712,
    longitude: 77.3458,
  },
  lab_bis_wrl: {
    address: "Manakalaya, E9, MIDC, Behind Marol Telephone Exchange, Andheri (East), Mumbai, Maharashtra 400093",
    address_source_url: "https://www.bis.gov.in/index.php/laboratory-services/western-regional-laboratory/",
    address_source_title: "Bureau of Indian Standards Western Regional Laboratory Official Directory",
    address_verified_at: "2026-09-27T00:00:00Z",
    latitude: 19.1176,
    longitude: 72.8789,
  },
  lab_bis_srl: {
    address: "CIT Campus, IV Cross Road, Taramani, Chennai, Tamil Nadu 600113",
    address_source_url: "https://www.bis.gov.in/index.php/laboratory-services/southern-regional-laboratory/",
    address_source_title: "Bureau of Indian Standards Southern Regional Laboratory Official Directory",
    address_verified_at: "2026-09-27T00:00:00Z",
    latitude: 12.9863,
    longitude: 80.2427,
  },
  lab_bis_erl: {
    address: "1/14, C.I.T. Scheme VII M, VIP Road, Kankurgachi, Kolkata, West Bengal 700054",
    address_source_url: "https://www.bis.gov.in/index.php/laboratory-services/eastern-regional-laboratory/",
    address_source_title: "Bureau of Indian Standards Eastern Regional Laboratory Official Directory",
    address_verified_at: "2026-09-27T00:00:00Z",
    latitude: 22.5855,
    longitude: 88.3967,
  },
  lab_nth_wr: {
    address: "Plot No. F-10, MIDC Road, Marol Industrial Area, Andheri (East), Mumbai, Maharashtra 400093",
    address_source_url: "https://nth.gov.in/laboratories/western-region/",
    address_source_title: "National Test House (WR) Ministry of Consumer Affairs Official Directory",
    address_verified_at: "2026-09-27T00:00:00Z",
    latitude: 19.1189,
    longitude: 72.8795,
  },
};

/**
 * Builds an official Google Maps search or Place URL.
 * Follows Google Maps Universal Cross-Platform Search URL specifications:
 * - If Place ID is available: https://www.google.com/maps/search/?api=1&query=...&query_place_id=...
 * - Else with verified address: https://www.google.com/maps/search/?api=1&query=...
 * - If no exact address is verified: returns null (preventing speculative navigation).
 */
export function buildGoogleMapsUrl(lab: {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  google_place_id?: string | null;
  google_maps_url?: string | null;
}): string | null {
  if (lab.google_maps_url) {
    return lab.google_maps_url;
  }
  if (!lab.address || !lab.address.trim()) {
    return null;
  }
  const cleanName = lab.name.trim();
  const cleanAddress = lab.address.trim();
  const query = `${cleanName}, ${cleanAddress}`;

  if (lab.google_place_id && lab.google_place_id.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${encodeURIComponent(lab.google_place_id.trim())}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Enriches a laboratory record with verified exact street address and provenance.
 * Preserves truth: unknown labs or unverified facilities remain un-enriched without speculation.
 */
export function enrichLaboratoryLocation(lab: LaboratoryRecord): LaboratoryRecord {
  const verified = VERIFIED_LABORATORY_LOCATIONS[lab.lab_id];
  if (!verified) {
    return {
      ...lab,
      address: lab.address || null,
      address_source_url: lab.address_source_url || null,
      address_source_title: lab.address_source_title || null,
      address_verified_at: lab.address_verified_at || null,
      google_maps_url: lab.google_maps_url || (lab.address ? buildGoogleMapsUrl(lab) : null),
    };
  }

  const enriched: LaboratoryRecord = {
    ...lab,
    address: verified.address,
    address_source_url: verified.address_source_url,
    address_source_title: verified.address_source_title,
    address_verified_at: verified.address_verified_at,
    latitude: verified.latitude,
    longitude: verified.longitude,
    google_place_id: verified.google_place_id || null,
  };

  enriched.google_maps_url = buildGoogleMapsUrl(enriched);
  return enriched;
}
