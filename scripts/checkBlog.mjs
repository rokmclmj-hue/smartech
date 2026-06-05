import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const posts = await p.blogPost.findMany({
  orderBy: { createdAt: "desc" }, take: 10,
  select: { id: true, title: true, status: true, sourceFile: true, createdAt: true }
});
console.log("DB 블로그 글 총수:", posts.length);
posts.forEach(post => {
  console.log(`[${post.id}] ${post.status} | ${post.sourceFile || "(직접작성)"} | ${post.title?.substring(0,50)}`);
});
await p.$disconnect();
