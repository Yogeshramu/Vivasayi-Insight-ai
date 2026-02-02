import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({
                success: true,
                history: []
            })
        }

        const history = await prisma.cropAnalysis.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        return NextResponse.json({
            success: true,
            history
        })

    } catch (error) {
        console.error('Crop history fetch error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch history'
        }, { status: 500 })
    }
}
