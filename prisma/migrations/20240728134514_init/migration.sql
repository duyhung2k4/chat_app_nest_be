-- CreateTable
CREATE TABLE "group_chats" (
    "id" SERIAL NOT NULL,
    "create_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "group_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_group_chats" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "group_chat_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profile_group_chats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_chats" ADD CONSTRAINT "group_chats_create_id_fkey" FOREIGN KEY ("create_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_group_chats" ADD CONSTRAINT "profile_group_chats_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_group_chats" ADD CONSTRAINT "profile_group_chats_group_chat_id_fkey" FOREIGN KEY ("group_chat_id") REFERENCES "group_chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
