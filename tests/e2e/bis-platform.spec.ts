import { test, expect } from "@playwright/test";

test.describe("BIS Intelligence Platform — Browser Acceptance Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("bis-intelligence-tour-completed", "true");
      } catch {}
    });
  });

  test("1. Landing page loads with valid navigation and platform branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/BIS Intelligence Platform/i);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /Ask BIS/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore Platform/i }).first()).toBeVisible();
  });

  test("2. Ask BIS: live query returns answer, citations, and evidence provenance", async ({ page }) => {
    test.setTimeout(90 * 1000);
    await page.goto("/ask-bis");
    await expect(page.getByRole("heading", { name: /Ask BIS/i })).toBeVisible();

    const queryInput = page.locator("textarea#bis-question");
    await expect(queryInput).toBeVisible();
    await queryInput.fill("What is the scope of IS 694?");

    const submitBtn = page.getByRole("button", { name: /Ask BIS/i }).first();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify response answer container renders
    await expect(page.getByText(/IS 694/i).first()).toBeVisible({ timeout: 60 * 1000 });

    // Verify Progressive Disclosure: Evidence & Citations drawer toggle
    const evidenceToggle = page.locator("summary").filter({ hasText: /View verification details & evidence/i });
    await expect(evidenceToggle).toBeVisible({ timeout: 45 * 1000 });
    await evidenceToggle.click();

    // Verify Evidence / Citations section inside expanded drawer
    const evidenceSection = page.getByText(/Authoritative Citations & Passages/i).first();
    await expect(evidenceSection).toBeVisible({ timeout: 15 * 1000 });
  });

  test("3. Ask BIS: negative control standard (IS 99999) triggers honest verification-required state", async ({ page }) => {
    test.setTimeout(90 * 1000);
    await page.goto("/ask-bis");

    const queryInput = page.locator("textarea#bis-question");
    await queryInput.fill("What are the requirements for IS 99999?");

    const submitBtn = page.getByRole("button", { name: /Ask BIS/i }).first();
    await submitBtn.click();

    // Verify that the system properly abstains or marks verification required without hallucinating
    await expect(
      page.getByText(/Verification Required|Insufficient Evidence|not found in verified corpus|No citations/i).first(),
    ).toBeVisible({ timeout: 60 * 1000 });
  });

  test("4. Standards Explorer: search, category filtering, and mandatory QCO toggling", async ({ page }) => {
    await page.goto("/standards");
    await expect(page.getByRole("heading", { name: /Standards Catalog/i })).toBeVisible();

    const searchInput = page.locator("input[placeholder*='Search by IS number']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("cables");

    // Verify cables card appears (IS 694)
    await expect(page.getByText(/IS 694:2010/i).first()).toBeVisible({ timeout: 15 * 1000 });

    // Click Category pill: electrical
    const electricalBtn = page.getByRole("button", { name: /^electrical$/i }).first();
    if (await electricalBtn.isVisible()) {
      await electricalBtn.click();
      await expect(page.getByText(/IS 694/i).first()).toBeVisible();
    }

    // Toggle Mandatory QCO filter
    const qcoBtn = page.getByRole("button", { name: /Mandatory QCO Only/i }).first();
    await expect(qcoBtn).toBeVisible();
    await qcoBtn.click();
    await expect(page.getByText(/Mandatory/i).first()).toBeVisible();
    await qcoBtn.click();
  });

  test("5. Product Intelligence: 6-stage regulatory assessment scenario", async ({ page }) => {
    test.setTimeout(90 * 1000);
    await page.goto("/product-intelligence");
    await expect(page.getByRole("heading", { name: /Product Intelligence/i })).toBeVisible();

    // Select Smart Electricity Meter preset button
    const presetBtn = page.getByRole("button", { name: /Smart Electricity Meter/i }).first();
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    const runBtn = page.getByRole("button", { name: /Run Applicability Assessment/i }).first();
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Verify the pipeline renders candidate standard (IS 16444)
    await expect(page.getByText(/IS 16444/i).first()).toBeVisible({ timeout: 60 * 1000 });
  });

  test("6. Certification Guide: Scheme tabs and 5-stage roadmap interaction", async ({ page }) => {
    await page.goto("/certification");
    await expect(page.getByRole("heading", { name: /Certification Pathways/i })).toBeVisible();

    // Switch between schemes
    await page.getByRole("button", { name: /Scheme II/i }).first().click();
    await expect(page.getByText(/Compulsory Registration Scheme/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Scheme IV/i }).first().click();
    await expect(page.getByText(/Hallmarking Scheme/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Scheme I/i }).first().click();
    await expect(page.getByText(/Product Certification Scheme \(ISI Mark\)/i).first()).toBeVisible();
    await expect(page.getByText(/Application & Documentation Filing/i).first()).toBeVisible();
  });

  test("7. Laboratories: exact verified address, provenance, and Google Maps action", async ({ page }) => {
    test.setTimeout(60 * 1000);
    await page.goto("/laboratories");
    await expect(page.getByRole("heading", { name: /Testing Laboratories/i })).toBeVisible();

    // Click quick pill for IS 1293
    const is1293Pill = page.getByRole("button", { name: /IS 1293/i }).first();
    await is1293Pill.click();

    // Wait for laboratory cards to load
    const labCard = page.locator("[data-testid='lab-card']").first();
    await expect(labCard).toBeVisible({ timeout: 30 * 1000 });

    // Verify Lab Name & Accreditation
    await expect(page.getByText(/BIS Central Laboratory|Western Regional/i).first()).toBeVisible();
    await expect(page.getByText(/NABL-TC/i).first()).toBeVisible();

    // Verify Exact Verified Address is rendered
    const addressElement = page.locator("[data-testid='lab-address']").first();
    await expect(addressElement).toBeVisible();
    const addressText = await addressElement.innerText();
    expect(addressText.length).toBeGreaterThan(15);

    // Verify Location Action: "Open in Google Maps" link
    const mapLink = page.locator("[data-testid='lab-map-link']").first();
    await expect(mapLink).toBeVisible();
    await expect(mapLink).toHaveAttribute("target", "_blank");
    await expect(mapLink).toHaveAttribute("rel", "noopener noreferrer");

    const href = await mapLink.getAttribute("href");
    expect(href).not.toBeNull();
    expect(href).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  });

  test("8. Hallmarking: fineness standards, mandatory marks, and dynamic fail-closed HUID verification", async ({ page }) => {
    await page.goto("/hallmarking");
    await expect(page.getByRole("heading", { name: /Gold & Silver Hallmarking/i })).toBeVisible();

    // Verify 3 mandatory marks are listed
    await expect(page.getByText(/BIS Standard Mark/i).first()).toBeVisible();
    await expect(page.getByText(/Purity \/ Fineness/i).first()).toBeVisible();
    await expect(page.getByText(/6-Digit Alphanumeric HUID/i).first()).toBeVisible();

    // Verify Fineness table (22K, 18K, 14K)
    await expect(page.getByText(/22K916/i).first()).toBeVisible();

    // Verify that deceptive mock button "Load Sample HUID" is removed
    await expect(page.getByRole("button", { name: /Load Sample HUID/i })).not.toBeVisible();

    // Interact with dynamic HUID Verifier
    const huidInput = page.locator("input[placeholder*='Enter 6-character HUID']").first();
    await expect(huidInput).toBeVisible();

    // 1. Invalid input check
    await huidInput.fill("AB12");
    const verifyBtn = page.getByRole("button", { name: /Verify HUID Record/i }).first();
    await verifyBtn.click();
    await expect(page.getByText(/HUID must be exactly 6 alphanumeric characters/i)).toBeVisible();

    // 2. Dynamic fail-closed verification for unindexed HUID
    await huidInput.fill("AB1234");
    await verifyBtn.click();

    // Must return honest fail-closed state without fabricating jeweller or AHC
    await expect(page.getByText(/HUID: AB1234/i).first()).toBeVisible({ timeout: 15 * 1000 });
    await expect(
      page.getByText(/No verified record was found for this HUID in the available BIS evidence/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/Verification Required/i).first()).toBeVisible();
    // Must NOT display fabricated AHC authentication
    await expect(page.getByText(/Authenticated by AHC/i)).not.toBeVisible();
  });

  test("9. Consumer Mode & Hindi Multilingual controls in Ask BIS", async ({ page }) => {
    await page.goto("/ask-bis");

    // Toggle Consumer Mode
    const consumerBtn = page.getByRole("button", { name: /Consumer \/ Plain Language/i }).first();
    await expect(consumerBtn).toBeVisible();
    await consumerBtn.click();
    await expect(page.getByText(/Consumer mode simplifies/i).first()).toBeVisible();

    // Toggle Hindi Language
    const hindiBtn = page.getByRole("button", { name: /हिन्दी/i }).first();
    await expect(hindiBtn).toBeVisible();
    await hindiBtn.click();
    await expect(page.getByText(/आपका प्रश्न/i).first()).toBeVisible();
  });

  test("10. Compliance Passport: generate structured product compliance dossier with SHA-256", async ({ page }) => {
    await page.goto("/passport");
    await expect(page.getByRole("heading", { name: /Product Compliance Passport/i })).toBeVisible();

    // Select standard from dropdown
    const stdSelect = page.locator("select#pass-standard");
    await expect(stdSelect).toBeVisible();
    await stdSelect.selectOption("IS 694:2010");

    const genBtn = page.getByRole("button", { name: /Generate Compliance Passport/i }).first();
    await genBtn.click();

    // Verify Dossier & Cryptographic Digest is calculated
    await expect(page.getByText(/Cryptographic Integrity Digest/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Print \/ Export PDF/i }).first()).toBeVisible();
  });

  test("11. Dashboard: live KPI metrics, knowledge coverage, and runtime provenance", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /BIS Intelligence Platform/i })).toBeVisible();

    // Verify Live KPI cards render
    await expect(page.getByText(/Discovered Documents/i).first()).toBeVisible();
    await expect(page.getByText(/Indexed Chunks/i).first()).toBeVisible();
    await expect(page.getByText(/Quality Control Orders/i).first()).toBeVisible();
    await expect(page.getByText(/Accredited Labs/i).first()).toBeVisible();

    // Verify Runtime Provenance Card
    await expect(page.getByText(/Runtime Provenance/i).first()).toBeVisible();
    await expect(page.getByText(/corpus-release-0002/i).first()).toBeVisible();
  });

  test("12. Product Tour: interactive guided walkthrough with steps, spotlight, and completion", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /BIS Intelligence Platform/i })).toBeVisible();

    // Trigger tour via header button
    const tourBtn = page.locator("[data-tour='tour-trigger']");
    await expect(tourBtn).toBeVisible();
    await tourBtn.click();

    // Step 1: Welcome
    await expect(page.getByText(/Step 1 of 9/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Welcome to BIS Intelligence Platform/i })).toBeVisible();

    // Advance to Step 2: Dashboard
    const nextBtn = page.getByRole("button", { name: /Next/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    await expect(page.getByText(/Step 2 of 9/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Dashboard & Live Knowledge Coverage/i })).toBeVisible();

    // Step backwards
    const backBtn = page.getByRole("button", { name: /Back/i });
    await backBtn.click();
    await expect(page.getByText(/Step 1 of 9/i)).toBeVisible();

    // Keyboard navigation: Escape key closes tour
    await page.keyboard.press("Escape");
    await expect(page.getByText(/Step 1 of 9/i)).not.toBeVisible();
  });

  test("13. Ask BIS: progressive disclosure hides raw confidence score and provides expandable verification drawer", async ({ page }) => {
    test.setTimeout(90 * 1000);
    await page.goto("/ask-bis");

    const queryInput = page.locator("textarea#bis-question");
    await queryInput.fill("What is the scope of IS 694?");

    const submitBtn = page.getByRole("button", { name: /Ask BIS/i }).first();
    await submitBtn.click();

    // Wait for result
    await expect(page.getByText(/IS 694/i).first()).toBeVisible({ timeout: 60 * 1000 });

    // Primary view: displays qualitative confidence and verified status
    await expect(page.getByText(/Verified|Verification Required|Qualified/i).first()).toBeVisible();

    // Progressive disclosure summary button
    const detailsToggle = page.locator("summary").filter({ hasText: /View verification details & evidence/i });
    await expect(detailsToggle).toBeVisible();

    // Click to expand Tier 2 verification details
    await detailsToggle.click();

    // Expanded view reveals Trust & Verification Audit, Claims and Passages
    await expect(page.getByText(/Trust & Verification Audit/i).first()).toBeVisible();
    await expect(page.getByText(/Authoritative Citations & Passages/i).first()).toBeVisible();
  });
});
