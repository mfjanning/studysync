/**
 * updates the avatar of the user that is currently logged in
 */
import { serverSupabaseClient } from '#supabase/server'
import { readBody } from 'h3'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const user = (await client.auth.getUser()).data.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht autorisiert'
    })
  }

  const body = await readBody(event)

  if (!body?.avatar) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kein Avatar Ã¼bergeben'
    })
  }

  const avatarName = body.avatar

  const { data, error } = await client
    .from('profile')
    .update({ avatar: avatarName })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('DB ERROR:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Avatar konnte nicht gespeichert werden'
    })
  }

  return { success: true, profile: data }
})