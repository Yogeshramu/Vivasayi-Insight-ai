import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        let resolvedUserId = session?.user?.id

        if (!resolvedUserId) {
            return NextResponse.json({
                success: true,
                history: []
            })
        }

        const history = await prisma.chatSession.findMany({
            where: { userId: resolvedUserId },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return NextResponse.json({
            success: true,
            history
        })

    } catch (error) {
        console.error('Chat history fetch error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch history'
        }, { status: 500 })
    }
}
