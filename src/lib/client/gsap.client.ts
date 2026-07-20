export async function loadGsap() {
  const module = await import("gsap");
  return module.gsap;
}
