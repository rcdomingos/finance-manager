-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreditCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "issuer" TEXT NOT NULL DEFAULT 'Outros',
    "limit" REAL NOT NULL,
    "dueDate" INTEGER NOT NULL DEFAULT 10,
    "closingDate" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CreditCard" ("brand", "closingDate", "createdAt", "dueDate", "id", "isActive", "limit", "title", "updatedAt", "userId") SELECT "brand", "closingDate", "createdAt", "dueDate", "id", "isActive", "limit", "title", "updatedAt", "userId" FROM "CreditCard";
DROP TABLE "CreditCard";
ALTER TABLE "new_CreditCard" RENAME TO "CreditCard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
