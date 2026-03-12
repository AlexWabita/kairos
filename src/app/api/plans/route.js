import { createClient } from '@supabase/supabase-js'
import { NextResponse }  from 'next/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─────────────────────────────────────────────────────────────
// GET /api/plans
// Returns all curated plans + user's enrolled plans (if userId provided)
// Query params: ?userId=xxx (optional)
// ─────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // Always fetch all curated plans
    const { data: plans, error: plansError } = await admin
      .from('reading_plans')
      .select('id, title, description, duration_days, category, cover_image_url, is_curated, created_by, created_at')
      .order('is_curated', { ascending: false })
      .order('created_at', { ascending: true })

    if (plansError) throw plansError

    // If userId provided, also fetch user's enrollments
    let userPlans = []
    if (userId) {
      const { data: user, error: userError } = await admin
        .from('users')
        .select('id, is_anonymous')
        .eq('id', userId)
        .maybeSingle()

      if (!userError && user && !user.is_anonymous) {
        const { data, error: enrollError } = await admin
          .from('user_plans')
          .select('id, plan_id, current_day, status, started_at, catch_up_used_at')
          .eq('user_id', userId)

        if (!enrollError) userPlans = data || []
      }
    }

    // Merge enrollment state onto each plan
    const enriched = plans.map(plan => {
      const enrollment = userPlans.find(up => up.plan_id === plan.id) || null
      return { ...plan, enrollment }
    })

    return NextResponse.json({ success: true, plans: enriched })

  } catch (err) {
    console.error('[Plans GET]', err.message)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/plans
// Enroll user in a plan
// Body: { userId, planId, isPrivate? }
// ─────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { userId, planId, isPrivate = false } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // Verify user
    const { data: user, error: userError } = await admin
      .from('users')
      .select('id, is_anonymous')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user || user.is_anonymous) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify plan exists
    const { data: plan, error: planError } = await admin
      .from('reading_plans')
      .select('id, title')
      .eq('id', planId)
      .maybeSingle()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Upsert enrollment — if already enrolled, return existing
    const { data, error } = await admin
      .from('user_plans')
      .upsert(
        {
          user_id:     userId,
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

    return NextResponse.json({ success: true, enrollment: data })

  } catch (err) {
    console.error('[Plans POST]', err.message)
    return NextResponse.json({ error: 'Failed to enroll in plan' }, { status: 500 })
  }
}