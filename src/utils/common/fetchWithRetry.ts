/**
 * Fetch wrapper with retry logic and exponential backoff
 * 
 * @param url - URL to fetch
 * @param opts - Fetch options (RequestInit)
 * @param retries - Number of retry attempts (default: 3)
 * @param backoff - Initial backoff delay in ms (default: 300)
 * @param timeout - Request timeout in ms (default: 10000)
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  opts: RequestInit = {},
  retries = 3,
  backoff = 300,
  timeout = 10000
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        ...opts,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response
    } catch (err) {
      // If this is the last retry, throw the error
      if (i === retries) {
        throw err
      }
      
      // Calculate exponential backoff: backoff * (2 ^ attempt)
      const delay = backoff * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error('Unreachable: fetchWithRetry exhausted all retries')
}

