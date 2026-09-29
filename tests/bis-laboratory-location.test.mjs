import { test, expect } from "bun:test";
import {
  VERIFIED_LABORATORY_LOCATIONS,
  buildGoogleMapsUrl,
  enrichLaboratoryLocation,
} from "../src/lib/bis/location";

test("1. Known lab with exact verified address has full provenance and maps link", () => {
  const lab = {
    lab_id: "lab_bis_cl",
    name: "BIS Central Laboratory (CL)",
    city: "Sahibabad",
    state: "Uttar Pradesh",
    accreditation_number: "NABL-TC-5001",
    scope_of_testing: ["Electrical Appliances", "Meters"],
  };

  const enriched = enrichLaboratoryLocation(lab);
  expect(enriched.address).toBe(
    "Plot No. 20/9, Site IV, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh 201010",
  );
  expect(enriched.address_source_url).toContain("bis.gov.in");
  expect(enriched.address_source_title).toBeDefined();
  expect(enriched.address_verified_at).toBeDefined();
  expect(enriched.google_maps_url).toBeDefined();
  expect(enriched.google_maps_url).toContain("https://www.google.com/maps/search/?api=1&query=");
});

test("2. Known lab where only city/state exists leaves address unverified without fabrication", () => {
  const lab = {
    lab_id: "lab_mock_generic",
    name: "Generic Demonstration Testing Center",
    city: "Jaipur",
    state: "Rajasthan",
    accreditation_number: "NABL-TC-9999",
    scope_of_testing: ["General Testing"],
  };

  const enriched = enrichLaboratoryLocation(lab);
  expect(enriched.address).toBeNull();
  expect(enriched.google_maps_url).toBeNull();
  expect(enriched.address_source_url).toBeNull();
});

test("3. Lab with exact address but no Google Place ID generates standard Google Maps search URL", () => {
  const lab = {
    name: "Test Facility Alpha",
    address: "123 Industrial Area, Phase 1, New Delhi 110020",
    city: "New Delhi",
    state: "Delhi",
  };

  const url = buildGoogleMapsUrl(lab);
  expect(url).not.toBeNull();
  expect(url).toContain("https://www.google.com/maps/search/?api=1&query=");
  expect(url).not.toContain("query_place_id");
  expect(url).toContain(encodeURIComponent("Test Facility Alpha, 123 Industrial Area, Phase 1, New Delhi 110020"));
});

test("4. Lab with Google Place ID includes place ID parameter in maps URL", () => {
  const lab = {
    name: "Test Facility Beta",
    address: "Sector 62, Noida, Uttar Pradesh 201309",
    google_place_id: "ChIJ_38382910kdjs",
  };

  const url = buildGoogleMapsUrl(lab);
  expect(url).not.toBeNull();
  expect(url).toContain("&query_place_id=ChIJ_38382910kdjs");
});

test("5. Unknown lab safely passes through without throwing errors", () => {
  const unknownLab = {
    lab_id: "unknown_id_xyz",
    name: "Unregistered Private Testing Lab",
    city: "Pune",
    state: "Maharashtra",
    accreditation_number: "None",
    scope_of_testing: [],
  };

  expect(() => enrichLaboratoryLocation(unknownLab)).not.toThrow();
  const enriched = enrichLaboratoryLocation(unknownLab);
  expect(enriched.address).toBeNull();
  expect(enriched.google_maps_url).toBeNull();
});

test("6. Google Maps link generation properly URL-encodes special characters and spaces", () => {
  const lab = {
    name: "National Test House (WR) & Calibration",
    address: "Plot No. F-10, MIDC Road, Marol / Andheri (East), Mumbai 400093",
  };

  const url = buildGoogleMapsUrl(lab);
  expect(url).not.toBeNull();
  expect(url).not.toContain(" ");
  expect(url).toContain("%26"); // '&'
  expect(url).toContain("%2F"); // '/'
});

test("7. Link opens the expected Google Maps domain", () => {
  const lab = {
    lab_id: "lab_bis_wrl",
    name: "BIS Western Regional Laboratory",
    city: "Mumbai",
    state: "Maharashtra",
    accreditation_number: "NABL-TC-5002",
    scope_of_testing: ["Plastics"],
  };

  const enriched = enrichLaboratoryLocation(lab);
  const parsed = new URL(enriched.google_maps_url);
  expect(parsed.protocol).toBe("https:");
  expect(parsed.hostname).toBe("www.google.com");
  expect(parsed.pathname).toBe("/maps/search/");
  expect(parsed.searchParams.get("api")).toBe("1");
  expect(parsed.searchParams.get("query")).toContain("BIS Western Regional Laboratory");
});

test("8. No secrets or API credentials leak into location records or URLs", () => {
  for (const [id, loc] of Object.entries(VERIFIED_LABORATORY_LOCATIONS)) {
    const raw = JSON.stringify(loc);
    expect(raw).not.toContain("key=");
    expect(raw).not.toContain("AIzaSy");
    expect(raw).not.toContain("TZ58");
    expect(raw).not.toContain("secret");
  }
});

test("9. No fabricated address displayed when address cannot be verified", () => {
  const unverified = {
    lab_id: "unverified_lab",
    name: "Some Laboratory",
    city: "Kolkata",
    state: "West Bengal",
    accreditation_number: "NABL-000",
    scope_of_testing: [],
  };

  const enriched = enrichLaboratoryLocation(unverified);
  expect(enriched.address).toBeNull();
  expect(enriched.google_maps_url).toBeNull();
});
