export const LOCAL_SCENE_QA = import.meta.env?.VITE_ANDROMEDA_QA === "true";
export const localSceneQAAllowed = () =>
  LOCAL_SCENE_QA &&
  typeof location !== "undefined" &&
  ["127.0.0.1", "localhost"].includes(location.hostname);
export function resolveReferenceImageURL(
  url: string,
  options: { qaBuild: boolean; hostname: string; simulateFailure: boolean },
) {
  return options.qaBuild &&
    ["127.0.0.1", "localhost"].includes(options.hostname) &&
    options.simulateFailure
    ? "/__local-qa/missing-nebula-image"
    : url;
}
export function referenceImageURL(url: string) {
  if (!localSceneQAAllowed()) return url;
  return resolveReferenceImageURL(url, {
    qaBuild: LOCAL_SCENE_QA,
    hostname: location.hostname,
    simulateFailure: new URLSearchParams(location.search).get("qa-fail-assets") === "1",
  });
}
export function noteReferenceFallback(id: string) {
  if (localSceneQAAllowed())
    window.dispatchEvent(new CustomEvent("ovu-local-reference-fallback", { detail: id }));
}
