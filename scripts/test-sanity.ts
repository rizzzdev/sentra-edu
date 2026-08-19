import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-08-20',
  useCdn: false
});

async function test() {
  console.log('🔗 Testing Sanity connection...');
  console.log(`   Project: ${process.env.PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.PUBLIC_SANITY_DATASET}\n`);

  const counts = await client.fetch(`{
    "users": count(*[_type == "user"]),
    "subjects": count(*[_type == "subject"]),
    "levels": count(*[_type == "educationLevel"]),
    "classes": count(*[_type == "classLevel"]),
    "packages": count(*[_type == "packagePlan"])
  }`);

  console.log('📊 Data di Sanity:');
  console.log(`   👤 Users:    ${counts.users}`);
  console.log(`   📖 Mapel:    ${counts.subjects}`);
  console.log(`   📚 Jenjang:  ${counts.levels}`);
  console.log(`   🏫 Kelas:    ${counts.classes}`);
  console.log(`   📦 Paket:    ${counts.packages}`);

  const users = await client.fetch<any[]>(`*[_type == "user"]{ fullName, email, role, isActive }`);
  if (users.length > 0) {
    console.log('\n👤 Users detail:');
    for (const u of users) {
      console.log(`   - ${u.fullName} (${u.email}) | role: ${u.role} | active: ${u.isActive}`);
    }
  }

  console.log('\n✅ Sanity connection OK!');
}

test().catch((err) => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
