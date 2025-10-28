import { supabase } from './supabaseClient'

export async function ensureUserProfile(user) {
  if (!user) return

  // Cek apakah user sudah punya profile
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!existing) {
    // Generate kode unik sederhana
    const code = `RETRO-${Math.floor(1000 + Math.random() * 9000)}`
    const username = user.email?.split('@')[0] || `user${code}`

    await supabase.from('profiles').insert({
      id: user.id,
      username,
      unique_code: code
    })

    return { username, code }
  }

  return { username: existing.username, code: existing.unique_code }
}
