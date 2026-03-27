import { createClient } from '@supabase/supabase-js'

import { requireRequestAppUser } from '@/lib/server/auth/requireRequestAppUser'
import {
  badRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '@/lib/server/http/responses'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─────────────────────────────────────────────────────────────
// POST /api/plans/progress
// Two actions via `action` field:
//   "complete"  — mark a day complete, advance current_day
//   "catch_up"  — move current_day to max(completed) + 1
// ─────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    // ✅ Server-enforced identity (REQUIRED)
    const { appUser, response } = await requireRequestAppUser()

    if (response) {
      return response
    }

    // Extra guard (defensive — should already be enforced)
    if (!appUser || appUser.is_anonymous) {
      return unauthorized('Authentication required')
    }

    const {
      userPlanId,
      action,
      dayNumber,
      kairosReflection,
      personalNotes,
      planTitle,
      dayTitle,
      scriptureRefs,
    } = await req.json()

    if (!userPlanId) {
      return badRequest('User plan ID is required')
    }

    if (!action || !['complete', 'catch_up'].includes(action)) {
      return badRequest('Action must be "complete" or "catch_up"')
    }

    // ✅ Ownership check uses appUser.id
    const { data: userPlan, error: planError } = await admin
      .from('user_plans')
      .select('id, plan_id, current_day, status, catch_up_used_at')
      .eq('id', userPlanId)
      .eq('user_id', appUser.id)
      .maybeSingle()

    if (planError || !userPlan) {
      return notFound('Plan enrollment not found')
    }

    const { count: totalDays, error: totalDaysError } = await admin
      .from('plan_days')
      .select('id', { count: 'exact', head: true })
      .eq('plan_id', userPlan.plan_id)

    if (totalDaysError) {
      throw totalDaysError
    }

    if (!totalDays || totalDays < 1) {
      return notFound('Plan days not found')
    }

    // ── ACTION: COMPLETE ────────────────────────────────────
    if (action === 'complete') {
      if (!Number.isInteger(dayNumber) || dayNumber < 1) {
        return badRequest(
          'dayNumber must be a positive integer for complete action'
        )
      }

      if (dayNumber > totalDays) {
        return badRequest('dayNumber exceeds plan length')
      }

      const { error: progressError } = await admin
        .from('user_plan_progress')
        .upsert(
          {
            user_plan_id: userPlan.id,
            day_number: dayNumber,
            completed_at: new Date().toISOString(),
            kairos_reflection: kairosReflection || null,
          },
          { onConflict: 'user_plan_id,day_number' }
        )

      if (progressError) {
        throw progressError
      }

      const isCurrentDay = dayNumber === userPlan.current_day
      const nextDay = dayNumber + 1
      const isLastDay = dayNumber >= totalDays

      let newCurrentDay = userPlan.current_day
      let newStatus = userPlan.status

      if (isCurrentDay) {
        if (isLastDay) {
          newStatus = 'completed'
        } else {
          newCurrentDay = nextDay
        }
      }

      const { error: updateError } = await admin
        .from('user_plans')
        .update({
          current_day: newCurrentDay,
          status: newStatus,
        })
        .eq('id', userPlan.id)

      if (updateError) {
        throw updateError
      }

      // ✅ Journey write uses appUser.id
      if (personalNotes && personalNotes.trim().length > 0) {
        const journeyTitle = dayTitle
          ? `Day ${dayNumber}: ${dayTitle}`
          : `Day ${dayNumber} — ${planTitle || 'Reading Plan'}`

        const { error: journeyError } = await admin
          .from('journey_entries')
          .insert({
            user_id: appUser.id,
            title: journeyTitle,
            content: personalNotes.trim(),
            entry_type: 'scripture',
            scripture_ref: scriptureRefs || null,
          })

        if (journeyError) {
          console.error(
            '[Plans Progress] Journey entry save failed:',
            journeyError.message
          )
        }
      }

      return ok({
        success: true,
        action: 'complete',
        dayNumber,
        newCurrentDay,
        status: newStatus,
        planCompleted: newStatus === 'completed',
        noteSavedToJourney:
          !!(personalNotes && personalNotes.trim().length > 0),
      })
    }

    // ── ACTION: CATCH UP ────────────────────────────────────
    if (action === 'catch_up') {
      const { data: progress, error: progressError } = await admin
        .from('user_plan_progress')
        .select('day_number')
        .eq('user_plan_id', userPlan.id)
        .order('day_number', { ascending: false })
        .limit(1)

      if (progressError) {
        throw progressError
      }

      if (!progress || progress.length === 0) {
        return ok({
          success: true,
          action: 'catch_up',
          newCurrentDay: 1,
          message: 'No completed days found — starting from day 1',
        })
      }

      const highestCompleted = progress[0].day_number
      const catchUpDay = Math.min(highestCompleted + 1, totalDays)

      if (catchUpDay <= userPlan.current_day) {
        return ok({
          success: true,
          action: 'catch_up',
          newCurrentDay: userPlan.current_day,
          message: 'Already up to date — no catch up needed',
        })
      }

      const { error: updateError } = await admin
        .from('user_plans')
        .update({
          current_day: catchUpDay,
          catch_up_used_at: new Date().toISOString(),
        })
        .eq('id', userPlan.id)

      if (updateError) {
        throw updateError
      }

      return ok({
        success: true,
        action: 'catch_up',
        previousDay: userPlan.current_day,
        newCurrentDay: catchUpDay,
        skippedDays: catchUpDay - userPlan.current_day,
      })
    }

    return badRequest('Unsupported action')
  } catch (err) {
    console.error('[Plans Progress]', err.message)
    return serverError('Failed to update progress')
  }
}