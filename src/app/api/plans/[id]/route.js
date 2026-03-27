import { createClient } from '@supabase/supabase-js'

import { getRequestAppUser } from '@/lib/server/auth/getRequestAppUser'
import {
  notFound,
  ok,
  serverError,
} from '@/lib/server/http/responses'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─────────────────────────────────────────────────────────────
// GET /api/plans/[id]
// Returns plan metadata + all days publicly.
// If a real authenticated user exists, also returns that user's enrollment/progress.
// ─────────────────────────────────────────────────────────────
export async function GET(req, { params }) {
  try {
    const { id } = params

    // ✅ Server-derived identity (safe, optional)
    const { appUser } = await getRequestAppUser()

    const { data: plan, error: planError } = await admin
      .from('reading_plans')
      .select(
        'id, title, description, duration_days, category, cover_image_url, is_curated, created_at'
      )
      .eq('id', id)
      .maybeSingle()

    if (planError || !plan) {
      return notFound('Plan not found')
    }

    const { data: days, error: daysError } = await admin
      .from('plan_days')
      .select(
        'id, day_number, title, devotional_text, scripture_refs, reflection_prompt, prayer_prompt'
      )
      .eq('plan_id', id)
      .order('day_number', { ascending: true })

    if (daysError) {
      throw daysError
    }

    let enrollment = null
    let completedDays = []

    // ✅ Only attach user-specific data if a real (non-anonymous) app user exists
    if (appUser && !appUser.is_anonymous) {
      const { data: userPlan, error: userPlanError } = await admin
        .from('user_plans')
        .select(
          'id, current_day, status, started_at, catch_up_used_at, is_private'
        )
        .eq('user_id', appUser.id)
        .eq('plan_id', id)
        .maybeSingle()

      if (userPlanError) {
        throw userPlanError
      }

      if (userPlan) {
        enrollment = userPlan

        const { data: progress, error: progressError } = await admin
          .from('user_plan_progress')
          .select('day_number, completed_at, kairos_reflection')
          .eq('user_plan_id', userPlan.id)

        if (progressError) {
          throw progressError
        }

        completedDays = progress || []
      }
    }

    const progressByDay = new Map(
      completedDays.map((progress) => [progress.day_number, progress])
    )

    const enrichedDays = (days || []).map((day) => {
      const progress = progressByDay.get(day.day_number) || null

      return {
        ...day,
        completed: !!progress,
        completedAt: progress?.completed_at || null,
      }
    })

    return ok({
      success: true,
      plan,
      days: enrichedDays,
      enrollment,
    })
  } catch (err) {
    console.error('[Plans/[id] GET]', err.message)
    return serverError('Failed to fetch plan')
  }
}