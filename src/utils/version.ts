/**
 * Parse version string to number for comparison
 * Examples: "6.0" -> 6.0, "6.1" -> 6.1, "7.0" -> 7.0
 */
function parseVersionNumber(version: string): number {
  if (!version) return 0
  
  // Remove any non-numeric characters except dots
  const cleaned = version.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  
  // Convert to number: major.minor -> major + minor/10
  const major = parseInt(parts[0] || '0', 10)
  const minor = parseInt(parts[1] || '0', 10)
  
  return major + minor / 10
}

/**
 * Compare two versions for sorting
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareVersions(a: any, b: any): number {
  const versionA = a.version || a.versionNumber || ''
  const versionB = b.version || b.versionNumber || ''
  
  const numA = parseVersionNumber(versionA)
  const numB = parseVersionNumber(versionB)
  
  return numA - numB // Ascending order (6.0, 6.1, 6.2, ..., 7.0)
}

