import { createClient } from '@supabase/supabase-js'

import { getRequestAppUser }     from '@/lib/server/auth/getRequestAppUser'
import { requireRequestAppUser } from '@/lib/server/auth/requireRequestAppUser'
import { ok, badRequest, serverError } from '@/lib/server/http/responses'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─────────────────────────────────────────────────────────────
// GET /api/plans
// Returns all curated plans + user enrollments if authenticated.
// slug is required by the frontend situation chip system.
// ─────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const { appUser } = await getRequestAppUser()

    const { data: plans, error: plansError } = await admin
      .from('reading_plans')
      .select(
        'id, slug, title, description, duration_days, category, cover_image_url, is_curated, created_by, created_at'
      )
      .order('is_curated', { ascending: false })
      .order('created_at', { ascending: true })

    if (plansError) throw plansError

    let userPlans = []

    if (appUser && !appUser.is_anonymous) {
      const { data, error: enrollError } = await admin
        .from('user_plans')
        .select('id, plan_id, current_day, status, started_at, catch_up_used_at')
        .eq('user_id', appUser.id)

      if (!enrollError) userPlans = data || []
    }

    const enriched = plans.map((plan) => ({
      ...plan,
      enrollment: userPlans.find((up) => up.plan_id === plan.id) || null,
    }))

    return ok({ success: true, plans: enriched })
  } catch (err) {
    console.error('[Plans GET]', err.message)
    return serverError('Failed to fetch plans')
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/plans — enroll authenticated user in a plan
// Body: { planId, isPrivate? }
// ─────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { appUser, response } = await requireRequestAppUser()
    if (response) return response

    const body      = await req.json()
    const planId    = typeof body.planId === 'string' ? body.planId.trim() : null
    const isPrivate = Boolean(body.isPrivate)

    if (!planId)              return badRequest('Plan ID is required')
    if (appUser.is_anonymous) return badRequest('Authentication required')

    const { data: plan, error: planError } = await admin
      .from('reading_plans')
      .select('id, title')
      .eq('id', planId)
      .maybeSingle()

    if (planError || !plan) return badRequest('Plan not found')

    const { data, error } = await admin
      .from('user_plans')
      .upsert(
        {
          user_id:     appUser.id,
          plan_id:     planId,
          is_private:  isPrivate,
          current_day: 1,
          status:      'active',
        },
        { onConflict: 'user_id,plan_id', ignoreDuplicates: true }
      )
      .select('id, plan_id, current_day, status, started_at')
      .single()

    if (error) throw error

    return ok({ success: true, enrollment: data })
  } catch (err) {
    console.error('[Plans POST]', err.message)
    return serverError('Failed to enroll in plan')
  }
}