/*
  Warnings:

  - A unique constraint covering the columns `[profile_id,group_chat_id]` on the table `profile_group_chats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profile_group_chats_profile_id_group_chat_id_key" ON "profile_group_chats"("profile_id", "group_chat_id");
