export function formatFriendlyError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  const message = typeof error === "string" ? error : (error as any)?.message || String(error);

  const trimmed = message.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (Array.isArray(first.path)) {
          if (first.path[0] === "items" && typeof first.path[1] === "number") {
            const itemNum = first.path[1] + 1;
            const field = first.path[2];
            if (field === "unit") return `Item #${itemNum}: Unit of measurement is required (e.g. pc, box, set, unit, lot).`;
            if (field === "description") return `Item #${itemNum}: Description is required (at least 2 characters).`;
            if (field === "quantity") return `Item #${itemNum}: Quantity must be greater than 0.`;
            if (field === "estimatedUnitCost") return `Item #${itemNum}: Estimated unit cost must be greater than ₱0.00.`;
            return `Item #${itemNum}${field ? ` (${field})` : ""}: ${first.message || "Invalid value"}`;
          }
          if (first.path.length > 0) {
            return `${first.path.join(".")}: ${first.message || "Invalid value"}`;
          }
        }
        if (first.message) return first.message;
      } else if (parsed && typeof parsed === "object" && parsed.message) {
        return parsed.message;
      }
    } catch {
      // not JSON, fallback to raw message
    }
  }

  return message;
}
