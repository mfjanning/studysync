/**
 * returns the avatar of the user that is currently logged in
 */
import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const user = (await client.auth.getUser()).data.user

  if (!user) {
    throw createError({ statusCode: 401 })
  }

  const { data, error } = await client
    .from('profile')
    .select('avatar')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  // @ts-ignore
  return { avatar: data?.avatar ?? 'affe'}
})