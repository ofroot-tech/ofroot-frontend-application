# First Three Clinics: Manual Pilot Playbook

## Objective

Recruit and manually onboard three clinics to test one narrow flow:

```text
clinic referral -> OfRoot Health signup -> activation -> doctor-ready report
```

The pilot should reveal repeated intake, appointment-preparation, and administrative friction before more software is built.

## Non-Goals

- No EHR integration.
- No staff knowledge assistant.
- No broad clinic portal build.
- No custom model training or hosting.
- No automated outreach sequence.
- No clinic access to patient health data.
- No collection of symptoms, patient identity, reports, or other health details in Technology.

## Clinic Fit

A pilot clinic should have:

- one accountable staff owner;
- a recurring appointment-preparation or referral problem;
- willingness to use one clinic-approved referral path;
- willingness to join a 30-minute workflow interview and a short review after initial use;
- agreement that the clinic receives aggregate operational signals only.

Deprioritize clinics that require an EHR integration, custom procurement program, patient-level dashboard, or clinical-data access before they can test the flow.

## Manual Recruitment Sequence

1. Identify 10 warm or directly reachable clinic candidates.
2. Contact each candidate personally; do not enroll them in an automated sequence.
3. Ask for a 20-minute fit conversation with the staff member who owns referrals or intake.
4. Select the first three clinics that meet the fit criteria and accept the data boundary.
5. Record the clinic owner, use case, referral path, start date, and next review date.

## Short Outreach Message

Subject: Three-clinic appointment-preparation pilot

> We are inviting three clinics to test a focused appointment-preparation referral path. The pilot is manual: we set up one clinic-approved link, observe aggregate referral-to-report progress, and interview staff about intake and preparation friction. The clinic does not receive patient health data through the pilot. Would a 20-minute fit conversation be useful?

Do not add urgency, automate follow-up, or imply clinical outcomes.

## Staff Interview Guide

Ask for concrete examples from the current workflow:

1. How does a patient receive preparation instructions today?
2. Where do referrals or preparation handoffs most often break?
3. What does staff repeat by phone, portal message, or paper?
4. What do patients commonly forget before the appointment?
5. What creates extra administrative work after a referral is made?
6. Which aggregate signal would help staff judge whether the handoff is working?
7. What would make this pilot unusable or unsafe for the clinic?
8. What problem occurred more than once in the last month?

Do not request patient names, symptoms, reports, appointment notes, or other health information.

## Manual Onboarding Checklist

- Confirm clinic and staff owner.
- Confirm one referral use case.
- Review the patient-data boundary.
- Approve the referral message and placement.
- Verify the public referral landing page.
- Test signup and activation without creating clinic access to Health data.
- Confirm which aggregate lifecycle signals are available.
- Schedule the first staff review.
- Record friction and support requests without patient details.

## Pilot Measures

Use counts and rates only when their definitions are stable:

- referral links issued;
- referral opens;
- signup starts;
- accounts created;
- first activation event;
- first doctor-ready report generated;
- elapsed time between stages;
- staff-reported friction themes;
- support requests per clinic.

The business outcome is a completed, useful preparation flow—not impressions alone.

## Build Decision Rule

Create a backlog item only when:

1. the problem is observed directly;
2. it repeats across at least two clinics or repeatedly within one clinic;
3. the smallest safe change is clear;
4. success can be observed without patient-data access.

One-off requests remain notes until more evidence appears.

## Pilot Tracker

| Spot | Clinic | Staff owner | Referral use case | Start date | First review | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  | Candidate |
| 2 |  |  |  |  |  | Candidate |
| 3 |  |  |  |  |  | Candidate |

Store only operational contact and pilot-state information here. Keep patient and health information out of this tracker.
