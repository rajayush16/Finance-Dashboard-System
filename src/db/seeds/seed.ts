import { db, pool } from "../../config/db";
import { users } from "../schema/users";
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
