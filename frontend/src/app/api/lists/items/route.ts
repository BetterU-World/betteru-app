import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * GET /api/lists/items?listId=xxx
 * Returns all items for a specific list
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return NextResponse.json(
        { error: "listId is required" },
        { status: 400 }
      );
    }

    // Verify list ownership
    const list = await prisma.list.findFirst({
      where: { id: listId, userId },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    const items = await prisma.listItem.findMany({
      where: { listId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching list items:", error);
    return NextResponse.json(
      { error: "Failed to fetch list items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists/items
 * Creates a new list item and optionally a calendar event if dueDate is provided
 * Body: { listId: string, content: string, dueDate?: string, order?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { listId, content, dueDate, order } = body;

    if (!listId || typeof listId !== "string") {
      return NextResponse.json(
        { error: "listId is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    // Verify list ownership
    const list = await prisma.list.findFirst({
      where: { id: listId, userId },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // If no order provided, add to end
    let itemOrder = order;
    if (itemOrder === undefined) {
      const maxOrderItem = await prisma.listItem.findFirst({
        where: { listId },
        orderBy: { order: "desc" },
      });
      itemOrder = maxOrderItem ? maxOrderItem.order + 1 : 0;
    }

    const newItem = await prisma.listItem.create({
      data: {
        userId,
        listId,
        content,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: itemOrder,
        done: false,
      },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating list item:", error);
    return NextResponse.json(
      { error: "Failed to create list item" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lists/items
 * Updates a list item and syncs calendar event if dueDate changes
 * Body: { id: string, content?: string, done?: boolean, dueDate?: string | null, order?: number }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, content, done, dueDate, order } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingItem = await prisma.listItem.findFirst({
      where: { id, userId },
      include: { list: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: {
      content?: string;
      done?: boolean;
      dueDate?: Date | null;
      order?: number;
    } = {};

    if (content !== undefined) updateData.content = content;
    if (done !== undefined) updateData.done = done;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (order !== undefined) updateData.order = order;

    const updatedItem = await prisma.listItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating list item:", error);
    return NextResponse.json(
      { error: "Failed to update list item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/items
 * Deletes a list item and its associated calendar event
 * Body: { id: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership and get item details
    const existingItem = await prisma.listItem.findFirst({
      where: { id, userId },
      include: { list: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item
    await prisma.listItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting list item:", error);
    return NextResponse.json(
      { error: "Failed to delete list item" },
      { status: 500 }
    );
  }
}
