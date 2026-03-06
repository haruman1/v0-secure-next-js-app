import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {

  await query(
    "UPDATE air_medical_evacuation SET status='reviewed' WHERE id=?",
    [params.id]
  )

  return NextResponse.json({
    success: true
  })

}