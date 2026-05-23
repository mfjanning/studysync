import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const { name } = getQuery(event)

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Fehlender Name' })
  }

  const client = await serverSupabaseClient(event)

  const { data, error } = await (client.from('profile') as any)
    .select('name')
    .ilike('name', name.trim())
    .limit(1)

  if (error) {
    console.error('Check-Name Error:', error)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { vergeben: data && data.length > 0 }
})