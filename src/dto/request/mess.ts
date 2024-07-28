export type CreateBoxChatReq = {
    profileId_1: number
    profileId_2: number
}

export type CreateGroupChatReq = {
    createId: number
}

export type AddMemberGroupChatReq = {
    groupChatId: number
    profileId: number
}