import { createClient } from '@supabase/supabase-js'
import { NextResponse }  from 'next/server'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─────────────────────────────────────────────────────────────
// GET /api/plans/[id]
// Returns plan metadata + all days + user's progress (if userId provided)
// Query params: ?userId=xxx (optional)
// ─────────────────────────────────────────────────────────────
export async function GET(req, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // Fetch plan
    const { data: plan, error: planError } = await admin
      .from('reading_plans')
      .select('id, title, description, duration_days, category, cover_image_url, is_curated, created_at')
      .eq('id', id)
      .maybeSingle()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Fetch all days ordered
    const { data: days, error: daysError } = await admin
      .from('plan_days')
      .select('id, day_number, title, devotional_text, scripture_refs, reflection_prompt, prayer_prompt')
      .eq('plan_id', id)
      .order('day_number', { ascending: true })

    if (daysError) throw daysError

    // If userId provided, fetch enrollment + completed days
    let enrollment = null
    let completedDays = []

    if (userId) {
      const { data: user, error: userError } = await admin
        .from('users')
        .select('id, is_anonymous')
        .eq('id', userId)
        .maybeSingle()

      if (!userError && user && !user.is_anonymous) {
        const { data: userPlan } = await admin
          .from('user_plans')
          .select('id, current_day, status, started_at, catch_up_used_at, is_private')
          .eq('user_id', userId)
          .eq('plan_id', id)
          .maybeSingle()

        if (userPlan) {
          enrollment = userPlan

          const { data: progress } = await admin
            .from('user_plan_progress')
            .select('day_number, completed_at, kairos_reflection')
            .eq('user_plan_id', userPlan.id)

          completedDays = progress || []
        }
      }
    }

    // Merge completion state onto each day
    const enrichedDays = days.map(day => {
      const progress = completedDays.find(p => p.day_number === day.day_number) || null
      return { ...day, completed: !!progress, completedAt: progress?.completed_at || null }
    })

    return NextResponse.json({
      success: true,
      plan,
      days: enrichedDays,
      enrollment,
    })

  } catch (err) {
    console.error('[Plans/[id] GET]', err.message)
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
  }
}