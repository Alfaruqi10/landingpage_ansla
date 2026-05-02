export function isQrisEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_QRIS === "true";
}
