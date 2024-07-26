-- CreateTable
CREATE TABLE "box_chats" (
    "id" SERIAL NOT NULL,
    "profile_id1" INTEGER NOT NULL,
    "profile_id2" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "box_chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "box_chats_profile_id1_profile_id2_key" ON "box_chats"("profile_id1", "profile_id2");
