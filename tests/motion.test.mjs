import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/components/motion/section-reveals.tsx", import.meta.url), "utf8");
const dataUrl = (text) => `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
const reactUrl = dataUrl("export const effects = []; export function useEffect(effect) { effects.push(effect); }");
const navigationUrl = dataUrl('export function usePathname() { return "/fixture"; }');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });
const { SectionReveals } = await import(dataUrl(outputText.replaceAll('"react"', JSON.stringify(reactUrl)).replaceAll('"next/navigation"', JSON.stringify(navigationUrl))));
const { effects } = await import(reactUrl);

function setup(t, { reduced = false, observerSupported = true } = {}) {
  const previous = new Map(["window", "document", "Element", "IntersectionObserver"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  t.after(() => { for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
  const preferenceListeners = new Map();
  const documentListeners = new Map();
  const preference = { matches: reduced, addEventListener: (name, fn) => preferenceListeners.set(name, fn), removeEventListener: (name) => preferenceListeners.delete(name) };
  class Section { constructor(top) { this.top = top; this.dataset = {}; } getBoundingClientRect() { return { top: this.top }; } closest() { return this; } }
  const sections = [new Section(100), new Section(1000)];
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
    observe(section) { this.observed.add(section); }
    unobserve(section) { this.observed.delete(section); }
    disconnect() { this.observed.clear(); }
  }
  globalThis.Element = Section;
  globalThis.IntersectionObserver = Observer;
  globalThis.window = { matchMedia: () => preference, innerHeight: 800, ...(observerSupported ? { IntersectionObserver: Observer } : {}) };
  globalThis.document = { querySelectorAll: () => sections, addEventListener: (name, fn) => documentListeners.set(name, fn), removeEventListener: (name) => documentListeners.delete(name) };
  SectionReveals();
  const run = effects.pop();
  const cleanup = run();
  return { sections, preference, preferenceListeners, documentListeners, get observer() { return observers.at(-1); }, cleanup, run };
}

test("reveals only wait below the viewport and stop observing after entrance", (t) => {
  const fixture = setup(t);
  const [visible, below] = fixture.sections;
  assert.equal(visible.dataset.revealState, "visible");
  assert.equal(below.dataset.revealState, "waiting");
  fixture.observer.callback([{ target: below, isIntersecting: true }]);
  assert.equal(below.dataset.revealState, "visible");
  assert.equal(fixture.observer.observed.size, 0);
  fixture.cleanup();
});

test("reduced motion and missing observer leave content visible without enhancement", (t) => {
  const fixture = setup(t, { reduced: true });
  assert.equal(fixture.observer, undefined);
  assert.ok(fixture.sections.every((section) => section.dataset.revealState === undefined));
  fixture.preference.matches = false;
  delete window.IntersectionObserver;
  assert.equal(fixture.run(), undefined);
  assert.ok(fixture.sections.every((section) => section.dataset.revealState === undefined));
});

test("turning on reduced motion reveals pending content and disconnects observation", (t) => {
  const fixture = setup(t);
  fixture.preference.matches = true;
  fixture.preferenceListeners.get("change")();
  assert.ok(fixture.sections.every((section) => section.dataset.revealState === "complete"));
  assert.equal(fixture.observer.observed.size, 0);
  fixture.cleanup();
});

test("keyboard focus reveals a pending section immediately", (t) => {
  const fixture = setup(t);
  fixture.documentListeners.get("focusin")({ target: fixture.sections[1] });
  assert.equal(fixture.sections[1].dataset.revealState, "visible");
  assert.equal(fixture.observer.observed.size, 0);
  fixture.cleanup();
});

test("Strict Mode cleanup does not consume unseen reveals or leave content hidden", (t) => {
  const fixture = setup(t);
  fixture.cleanup();
  assert.equal(fixture.sections[1].dataset.revealState, undefined);
  assert.equal(fixture.documentListeners.size, 0);
  const cleanup = fixture.run();
  assert.equal(fixture.sections[1].dataset.revealState, "waiting");
  cleanup();
});
