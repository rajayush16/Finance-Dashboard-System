import { db, pool } from "../../config/db";
import { eq } from "drizzle-orm";
import { users } from "../schema/users";
import { financialRecords } from "../schema/financial-records";
import { hashPassword } from "../../utils/password";

const seed = async (): Promise<void> => {
  const passwordHash = await hashPassword("Admin@123");

  await db
    .insert(users)
    .values([
      {
        name: "System Admin",
        email: "admin@finance.local",
        passwordHash,
        role: "admin",
        status: "active"
      },
      {
        name: "Data Analyst",
        email: "analyst@finance.local",
        passwordHash,
        role: "analyst",
        status: "active"
      },
      {
        name: "Dashboard Viewer",
        email: "viewer@finance.local",
        passwordHash,
        role: "viewer",
        status: "active"
      }
    ])
    .onConflictDoNothing();

  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@finance.local"))
    .limit(1);

  if (adminUser) {
    await db
      .insert(financialRecords)
      .values([
        {
          amount: "5000.00",
          type: "income",
          category: "Salary",
          date: "2026-01-31",
          notes: "Monthly salary",
          createdBy: adminUser.id
        },
        {
          amount: "850.50",
          type: "expense",
          category: "Rent",
          date: "2026-02-01",
          notes: "Apartment rent",
          createdBy: adminUser.id
        },
        {
          amount: "420.75",
          type: "expense",
          category: "Groceries",
          date: "2026-02-12",
          notes: "Weekly groceries",
          createdBy: adminUser.id
        },
        {
          amount: "5200.00",
          type: "income",
          category: "Salary",
          date: "2026-02-28",
          notes: "Monthly salary",
          createdBy: adminUser.id
        },
        {
          amount: "610.00",
          type: "expense",
          category: "Utilities",
          date: "2026-03-03",
          notes: "Electricity and internet",
          createdBy: adminUser.id
        }
      ])
      .onConflictDoNothing();
  }
};

seed()
  .then(async () => {
    console.log("Seed completed.");
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Seed failed.", error);
    await pool.end();
    process.exit(1);
  });
