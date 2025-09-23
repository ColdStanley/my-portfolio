const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function fetchPromptFromNotion(project: string, agent: string, loggerPrefix: string) {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not configured')
  }

  const url = `${BASE_URL}/api/prompt-manager-notion?project=${encodeURIComponent(project)}&agent=${encodeURIComponent(agent)}`
  console.log(`[${loggerPrefix}] 🔄 Fetching prompt: ${project}:${agent}`)
  console.log(`[${loggerPrefix}] 🔗 Request URL: ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    const failureBody = await response.text().catch(() => '<unavailable>')
    console.error(`[${loggerPrefix}] ❌ Prompt fetch failed: ${response.status} ${response.statusText}`)
    console.error(`[${loggerPrefix}] ❌ Response body: ${failureBody.slice(0, 500)}`)
    throw new Error(`Failed to fetch prompt for ${project}:${agent} - ${response.status}`)
  }

  const data = await response.json()
  console.log(`[${loggerPrefix}] ✅ Prompt fetched (version: ${data.version})`)
  return data.promptContent as string
}
