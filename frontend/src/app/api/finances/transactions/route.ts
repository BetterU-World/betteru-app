import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { getSystemCalendarBySlug } from "@/lib/calendars/defaults";
import { encryptText, decryptText, makePreview } from "@/lib/encryption";
type TransactionType = "INCOME" | "EXPENSE";

// GET /api/finances/transactions - List transactions with optional filters
export async function GET(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const typeParam = searchParams.get("type") as "INCOME" | "EXPENSE" | "ALL" | null;

    // Default to current month if no date range provided
    const now = new Date();
    const from = fromParam
      ? new Date(fromParam)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = toParam
      ? new Date(toParam)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Build where clause
    const where: {
      userId: string;
      date: { gte: Date; lte: Date };
      type?: TransactionType;
    } = {
      userId,
      date: { gte: from, lte: to },
    };

    if (typeParam && typeParam !== "ALL") {
      where.type = typeParam as TransactionType;
    }

    // Fetch transactions
    const transactions = await prisma.financeTransaction.findMany({
      where,
      orderBy: { date: "desc" },
    });
    type FinanceTransactionRow = (typeof transactions)[number];
    // Decrypt details server-side and attach previews
    const safeTransactions = transactions.map((t: FinanceTransactionRow) => {
      let details: string | null = null;
      const enc = (t as any).encryptedDetails as string | null | undefined;
      if (enc) {
        try {
          details = decryptText(enc);
        } catch {
          details = null;
        }
      } else if (t.description) {
        details = t.description;
      }
      return {
        ...t,
        description: details ?? "",
        encryptedDetails: undefined as unknown as never,
        detailsPreview:
          (t as any).detailsPreview ?? (details ? makePreview(details) : ""),
      } as any;
    });

    // Calculate summary
    const totalIncome = safeTransactions
      .filter((t: FinanceTransactionRow) => t.type === "INCOME")
      .reduce((sum: number, t: FinanceTransactionRow) => sum + (t as any).amount, 0);

    const totalExpenses = safeTransactions
      .filter((t: FinanceTransactionRow) => t.type === "EXPENSE")
      .reduce((sum: number, t: FinanceTransactionRow) => sum + (t as any).amount, 0);

    const net = totalIncome - totalExpenses;

    return NextResponse.json({
      transactions: safeTransactions,
      summary: {
        totalIncome,
        totalExpenses,
        net,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/finances/transactions - Create a new transaction
export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, amount, date, category, description } = body;

    // Validate required fields
    if (!type || (type !== "INCOME" && type !== "EXPENSE")) {
      return NextResponse.json(
        { error: "Valid transaction type is required (INCOME or EXPENSE)" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid positive amount is required" },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Create the transaction and linked calendar event in a single transaction
    const financialCalendar = await getSystemCalendarBySlug(userId, "financial");
    const transactionDate = date ? new Date(date) : new Date();
    const eventTitle = `${type === "INCOME" ? "Income" : "Expense"}: ${category.trim()}`;

    // Encrypt sensitive text details
    const detailsPlain = description || "";
    let encryptedDetails: string | null = null;
    let detailsPreview: string | null = null;
    if (detailsPlain && detailsPlain.trim().length > 0) {
      try {
        encryptedDetails = encryptText(detailsPlain);
        detailsPreview = makePreview(detailsPlain);
      } catch (e) {
        return NextResponse.json(
          { error: "Encryption misconfigured" },
          { status: 500 }
        );
      }
    }

    const [transaction] = await prisma.$transaction([
      (prisma.financeTransaction.create as any)({
        data: {
          userId,
          type: type as TransactionType,
          amount,
          date: transactionDate,
          category: category.trim(),
          description: "",
          encryptedDetails,
          detailsPreview,
        },
      }),
    ]);

    await prisma.$transaction([
      prisma.calendarEvent.create({
        data: {
          userId,
          title: eventTitle,
          description: detailsPlain || "",
          date: transactionDate,
          allDay: true,
          startTime: null,
          endTime: null,
          userCalendarId: financialCalendar.id,
          financeTransactionId: transaction.id,
        } as any,
      }),
    ]);
    // Return decrypted description to client, hide ciphertext
    let returnDescription = "";
    if (encryptedDetails) {
      try {
        returnDescription = decryptText(encryptedDetails);
      } catch {
        returnDescription = "";
      }
    }
    const safeTransaction = {
      ...transaction,
      description: returnDescription,
      encryptedDetails: undefined as unknown as never,
      detailsPreview,
    } as any;

    return NextResponse.json({ transaction: safeTransaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

// PATCH /api/finances/transactions - Update an existing transaction
export async function PATCH(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, type, amount, date, category, description } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user
    const existingTransaction = await prisma.financeTransaction.findFirst({
      where: { id, userId },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      type?: TransactionType;
      amount?: number;
      date?: Date;
      category?: string;
      description?: string;
      encryptedDetails?: string | null;
      detailsPreview?: string | null;
    } = {};

    if (type && (type === "INCOME" || type === "EXPENSE")) {
      updateData.type = type as TransactionType;
    }
    if (amount && typeof amount === "number" && amount > 0) {
      updateData.amount = amount;
    }
    if (date) {
      updateData.date = new Date(date);
    }
    if (category && typeof category === "string" && category.trim().length > 0) {
      updateData.category = category.trim();
    }
    if (description !== undefined) {
      const plain = description || "";
      if (plain.trim().length > 0) {
        try {
          updateData.encryptedDetails = encryptText(plain);
          updateData.detailsPreview = makePreview(plain);
          updateData.description = "";
        } catch (e) {
          return NextResponse.json(
            { error: "Encryption misconfigured" },
            { status: 500 }
          );
        }
      } else {
        updateData.encryptedDetails = null;
        updateData.detailsPreview = null;
        updateData.description = "";
      }
    }

    // Update the transaction and keep linked calendar event in sync by relation
    const updatedTransaction = await prisma.financeTransaction.update({
      where: { id },
      data: updateData,
    });

    const financialCalendar = await getSystemCalendarBySlug(userId, "financial");
    const eventTitle = `${(updatedTransaction.type === "INCOME" ? "Income" : "Expense")}: ${updatedTransaction.category}`;

    await prisma.calendarEvent.updateMany({
      where: {
        userId,
        userCalendarId: financialCalendar.id,
        financeTransactionId: updatedTransaction.id,
      } as any,
      data: {
        title: eventTitle,
        description: description || "",
        date: updatedTransaction.date,
      },
    });
    // Return decrypted description and preview
    let dec: string = "";
    if ((updatedTransaction as any).encryptedDetails) {
      try {
        dec = decryptText((updatedTransaction as any).encryptedDetails);
      } catch {
        dec = "";
      }
    }
    const safeUpdated = {
      ...updatedTransaction,
      description: dec,
      encryptedDetails: undefined as unknown as never,
      detailsPreview:
        (updatedTransaction as any).detailsPreview ??
        (dec ? makePreview(dec) : ""),
    } as any;

    return NextResponse.json(safeUpdated);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/finances/transactions - Delete a transaction
export async function DELETE(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Verify transaction belongs to user
    const transaction = await prisma.financeTransaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Delete the transaction and its linked event via relation
    const deleted = await prisma.financeTransaction.delete({
      where: { id },
    });

    const financialCalendar = await getSystemCalendarBySlug(userId, "financial");
    await prisma.calendarEvent.deleteMany({
      where: {
        userId,
        userCalendarId: financialCalendar.id,
        financeTransactionId: deleted.id,
      } as any,
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
