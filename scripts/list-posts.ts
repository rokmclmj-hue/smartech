import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, faqSchema: true, sourceFile: true },
    orderBy: { id: "asc" },
  });
  posts.forEach(p =>
    console.log(`id=${p.id} faq=${p.faqSchema ? "✅" : "❌"} source="${p.sourceFile}" | ${p.title.slice(0,30)}`)
  );
}
main().finally(() => prisma.$disconnect());
