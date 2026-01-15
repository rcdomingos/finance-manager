-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "limit" REAL NOT NULL,
    "dueDate" INTEGER NOT NULL DEFAULT 10,
    "closingDate" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CreditCard" ("brand", "createdAt", "id", "limit", "title", "updatedAt") SELECT "brand", "createdAt", "id", "limit", "title", "updatedAt" FROM "CreditCard";
DROP TABLE "CreditCard";
ALTER TABLE "new_CreditCard" RENAME TO "CreditCard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
