export type DiaryStorageMode = "cloud" | "local";

export type LocalDiaryEntryRecord = {
  localId: string;
  storageMode: "local";
  title: string;
  date: string; // ISO date string
  contentCiphertext: string;
  contentIv: string;
  contentSalt: string;
  contentAlg: "AES-GCM";
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
