import { createClient } from '@supabase/supabase-js'
import { NextResponse }  from 'next/server'

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
    const {
      userId,
      userPlanId,
      action,           // "complete" | "catch_up"
      dayNumber,        // required for "complete"
      kairosReflection, // optional — saved AI response for "complete"
      personalNotes,    // optional — user's own written notes (Option B → saved to journey)
      planTitle,        // optional — plan name, used for journey entry title
      dayTitle,         // optional — day title, used for journey entry title
      scriptureRefs,    // optional — scripture references for the journey entry
    } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!userPlanId) {
      return NextResponse.json({ error: 'User plan ID is required' }, { status: 400 })
    }
    if (!action || !['complete', 'catch_up'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "complete" or "catch_up"' }, { status: 400 })
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

    // Verify this user_plan belongs to this user
    const { data: userPlan, error: planError } = await admin
      .from('user_plans')
      .select('id, plan_id, current_day, status')
      .eq('id', userPlanId)
      .eq('user_id', userId)
      .maybeSingle()

    if (planError || !userPlan) {
      return NextResponse.json({ error: 'Plan enrollment not found' }, { status: 404 })
    }

    // Fetch total days in plan
    const { count: totalDays } = await admin
      .from('plan_days')
      .select('id', { count: 'exact', head: true })
      .eq('plan_id', userPlan.plan_id)

    // ── ACTION: COMPLETE ────────────────────────────────────
    if (action === 'complete') {
      if (!dayNumber || typeof dayNumber !== 'number') {
        return NextResponse.json({ error: 'dayNumber is required for complete action' }, { status: 400 })
      }

      // Upsert progress row — safe to call multiple times for same day
      const { error: progressError } = await admin
        .from('user_plan_progress')
        .upsert(
          {
            user_plan_id:      userPlanId,
            day_number:        dayNumber,
            completed_at:      new Date().toISOString(),
            kairos_reflection: kairosReflection || null,
          },
          { onConflict: 'user_plan_id,day_number' }
        )

      if (progressError) throw progressError

      // Advance current_day if completing the current day
      const isCurrentDay = dayNumber === userPlan.current_day
      const nextDay      = dayNumber + 1
      const isLastDay    = dayNumber >= totalDays

      let newCurrentDay = userPlan.current_day
      let newStatus     = userPlan.status

      if (isCurrentDay) {
        if (isLastDay) {
          newStatus = 'completed'
        } else {
          newCurrentDay = nextDay
        }
      }

      const { error: updateError } = await admin
        .from('user_plans')
        .update({ current_day: newCurrentDay, status: newStatus })
        .eq('id', userPlanId)

      if (updateError) throw updateError

      // ── Option B: Save personal notes to journey entries ──
      if (personalNotes && personalNotes.trim().length > 0) {
        const journeyTitle = dayTitle
          ? `Day ${dayNumber}: ${dayTitle}`
          : `Day ${dayNumber} — ${planTitle || 'Reading Plan'}`

        const { error: journeyError } = await admin
          .from('journey_entries')
          .insert({
            user_id:       userId,
            title:         journeyTitle,
            content:       personalNotes.trim(),
            entry_type:    'scripture',
            scripture_ref: scriptureRefs || null,
          })

        if (journeyError) {
          // Log but do not throw — day completion must always succeed
          console.error('[Plans Progress] Journey entry save failed:', journeyError.message)
        }
      }

      return NextResponse.json({
        success:          true,
        action:           'complete',
        dayNumber,
        newCurrentDay,
        status:           newStatus,
        planCompleted:    newStatus === 'completed',
        noteSavedToJourney: !!(personalNotes && personalNotes.trim().length > 0),
      })
    }

    // ── ACTION: CATCH UP ────────────────────────────────────
    if (action === 'catch_up') {
      // Find highest completed day number
      const { data: progress, error: progressError } = await admin
        .from('user_plan_progress')
        .select('day_number')
        .eq('user_plan_id', userPlanId)
        .order('day_number', { ascending: false })
        .limit(1)

      if (progressError) throw progressError

      if (!progress || progress.length === 0) {
        return NextResponse.json({
          success:       true,
          action:        'catch_up',
          newCurrentDay: 1,
          message:       'No completed days found — starting from day 1',
        })
      }

      const highestCompleted = progress[0].day_number
      const catchUpDay       = Math.min(highestCompleted + 1, totalDays)

      if (catchUpDay <= userPlan.current_day) {
        return NextResponse.json({
          success:       true,
          action:        'catch_up',
          newCurrentDay: userPlan.current_day,
          message:       'Already up to date — no catch up needed',
        })
      }

      const { error: updateError } = await admin
        .from('user_plans')
        .update({
          current_day:      catchUpDay,
          catch_up_used_at: new Date().toISOString(),
        })
        .eq('id', userPlanId)

      if (updateError) throw updateError

      return NextResponse.json({
        success:       true,
        action:        'catch_up',
        previousDay:   userPlan.current_day,
        newCurrentDay: catchUpDay,
        skippedDays:   catchUpDay - userPlan.current_day,
      })
    }

  } catch (err) {
    console.error('[Plans Progress]', err.message)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
