import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const data = await request.json()

    // Get current user (if authenticated)
    const user = await payload.auth({ headers: request.headers })

    if (!user.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create the appointment
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        title: data.title,
        description: data.description,
        organizer: user.user.id,
        attendees: data.attendees || [],
        space: data.space,
        tenant: data.tenant || user.user.tenant,
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone || 'America/New_York',
        location: data.location,
        meetingLink: data.meetingLink,
        meetingType: data.meetingType || 'video_call',
        bookingSettings: {
          allowRescheduling: data.bookingSettings?.allowRescheduling ?? true,
          allowCancellation: data.bookingSettings?.allowCancellation ?? true,
          requireConfirmation: data.bookingSettings?.requireConfirmation ?? false,
          bufferTime: data.bookingSettings?.bufferTime || 15,
          maxAttendees: data.bookingSettings?.maxAttendees || 1,
        },
        status: data.status || 'scheduled',
        notes: data.notes,
        revenueTracking: {
          source: 'system_generated',
          commissionRate: data.commissionRate || 0,
          commissionAmount: data.expectedRevenue || 0
        },
        payment: data.payment ? {
          required: data.payment.required || false,
          amount: data.payment.amount,
          currency: data.payment.currency || 'usd',
          paymentStatus: data.payment.paymentStatus || 'pending'
        } : undefined,
      }
    })

    // Log the appointment creation in messages for tracking
    await payload.create({
      collection: 'messages',
      data: {
        content: `Appointment booked: ${appointment.title}`,
        messageType: 'system_alert',
        space: data.space || 1,
        author: user.user.id,
        channel: 'bookings',
        atProtocol: {
          type: 'co.kendev.spaces.message',
        },
        businessContext: {
          department: 'sales',
          workflow: 'quote',
          priority: 'normal',
          integrationSource: 'web_widget',
        },
        metadata: {
          appointment: {
            id: appointment.id,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            meetingType: appointment.meetingType,
            paymentRequired: appointment.payment?.required || false,
          }
        },
        timestamp: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        title: appointment.title,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        meetingType: appointment.meetingType,
        paymentRequired: appointment.payment?.required || false,
      }
    })

  } catch (error) {
    console.error('Appointment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const { searchParams } = new URL(request.url)

    // Get current user
    const user = await payload.auth({ headers: request.headers })
    if (!user.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Query parameters
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const query: any = {
      organizer: { equals: user.user.id }
    }

    if (startDate && endDate) {
      query.startTime = {
        greater_than_equal: startDate,
        less_than_equal: endDate
      }
    }

    if (status) {
      query.status = { equals: status }
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where: query,
      limit,
      sort: 'startTime',
    })

    return NextResponse.json({
      success: true,
      appointments: appointments.docs,
      total: appointments.totalDocs,
    })

  } catch (error) {
    console.error('Appointments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
