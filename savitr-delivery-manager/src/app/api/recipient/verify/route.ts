import { NextResponse } from "next/server";
import db from "@/lib/db";
import Delivery from "@/models/Delivery";
import RecipientUser from "@/models/RecipientUser";

export async function POST(req: Request) {
  try {
    const { phone, trackingId } = await req.json();

    if (!phone || !trackingId) {
      return NextResponse.json(
        { error: "Phone number and tracking ID are required" },
        { status: 400 }
      );
    }

    // First, verify that the phone number matches the delivery
    const delivery = await Delivery.findOne({
      trackingId,
      phone,
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Phone number does not match the delivery" },
        { status: 400 }
      );
    }

    // Check if a user account exists for this phone number
    const user = await RecipientUser.findOne({
      phone,
    });

    return NextResponse.json({
      exists: !!user,
      verified: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify phone number" },
      { status: 500 }
    );
  }
} 