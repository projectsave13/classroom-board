import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, chatRoomsTable, chatMessagesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/chat/rooms", async (req, res): Promise<void> => {
  const { nickname } = req.body;
  if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
    res.status(400).json({ error: "nickname is required" });
    return;
  }
  const trimmed = nickname.trim();
  const existing = await db
    .select()
    .from(chatRoomsTable)
    .where(eq(chatRoomsTable.nickname, trimmed));
  if (existing.length > 0) {
    res.status(409).json({ error: '이미 사용 중인 별명입니다. 다른 별명을 선택해 주세요.' });
    return;
  }
  const [room] = await db
    .insert(chatRoomsTable)
    .values({ nickname: trimmed })
    .returning();
  res.status(201).json(room);
});

router.get("/chat/rooms/all", async (req, res): Promise<void> => {
  const rooms = await db
    .select()
    .from(chatRoomsTable)
    .orderBy(chatRoomsTable.createdAt);
  res.json(rooms);
});

router.get("/chat/rooms/:roomId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const roomId = parseInt(raw, 10);
  if (isNaN(roomId)) {
    res.status(400).json({ error: "invalid roomId" });
    return;
  }
  const [room] = await db
    .select()
    .from(chatRoomsTable)
    .where(eq(chatRoomsTable.id, roomId));
  if (!room) {
    res.status(404).json({ error: "room not found" });
    return;
  }
  res.json(room);
});

router.get("/chat/rooms/:roomId/messages", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const roomId = parseInt(raw, 10);
  if (isNaN(roomId)) {
    res.status(400).json({ error: "invalid roomId" });
    return;
  }
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.roomId, roomId))
    .orderBy(chatMessagesTable.createdAt);
  res.json(messages);
});

router.post("/chat/rooms/:roomId/messages", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const roomId = parseInt(raw, 10);
  if (isNaN(roomId)) {
    res.status(400).json({ error: "invalid roomId" });
    return;
  }
  const { sender, text } = req.body;
  if (!sender || typeof sender !== "string") {
    res.status(400).json({ error: "sender is required" });
    return;
  }
  if (text == null || typeof text !== "string") {
    res.status(400).json({ error: "text is required" });
    return;
  }
  const [message] = await db
    .insert(chatMessagesTable)
    .values({ roomId, sender, text })
    .returning();
  res.status(201).json(message);
});

router.delete("/chat/rooms/:roomId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const roomId = parseInt(raw, 10);
  if (isNaN(roomId)) {
    res.status(400).json({ error: "invalid roomId" });
    return;
  }
  await db.delete(chatMessagesTable).where(eq(chatMessagesTable.roomId, roomId));
  await db.delete(chatRoomsTable).where(eq(chatRoomsTable.id, roomId));
  res.sendStatus(204);
});

export default router;
