import { supabase, UserRole } from './supabase'

export async function signUp(email: string, password: string, role: UserRole) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  })
  return { data, error }
}

// Creates the account via the admin API (email pre-confirmed) then signs in
// immediately. This sidesteps Supabase's email confirmation requirement entirely —
// signInWithPassword rejects unconfirmed accounts even when called right after
// signUp, so the only reliable fix is creating with email_confirm: true server-side.
export async function signUpAndAutoLogin(email: string, password: string, role: UserRole) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  })

  const json = await res.json()
  if (!res.ok) {
    return { data: null, error: { message: json.error ?? "Registration failed" } as Error }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role ?? null
}
