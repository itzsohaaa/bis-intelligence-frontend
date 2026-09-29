import "server-only";
import { VERIFIED_STANDARDS_CATALOG } from "@/lib/bis/standards-data";
import type { StandardCatalogRecord } from "@/lib/bis/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").toLowerCase().trim();
  const category = (url.searchParams.get("category") || "").toLowerCase().trim();
  const mandatoryOnly = url.searchParams.get("mandatory") === "true";

  let results: StandardCatalogRecord[] = VERIFIED_STANDARDS_CATALOG;

  if (category) {
    results = results.filter((s) => s.category.toLowerCase().includes(category));
  }

  if (mandatoryOnly) {
    results = results.filter((s) => s.is_mandatory);
  }

  if (q) {
    results = results.filter((s) => {
      const matchStd = s.standard_number.toLowerCase().includes(q);
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      const matchProducts = s.applicable_products.some((p) =>
        p.toLowerCase().includes(q),
      );
      const matchQco = (s.mandatory_qco_number || "").toLowerCase().includes(q);
      return matchStd || matchTitle || matchCat || matchProducts || matchQco;
    });
  }

  return Response.json(
    {
      total: results.length,
      standards: results,
    },
    {
      headers: { "Cache-Control": "public, max-age=120, s-maxage=600" },
    },
  );
}
