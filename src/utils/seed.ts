import "dotenv/config";
import mongoose from "mongoose";
import { env } from "@/config/env";
import User from "@/models/User";
import Ward from "@/models/Ward";
import Issue from "@/models/Issue";
import Institution from "@/models/Institution";
import Project from "@/models/Project";
import Activity from "@/models/Activity";
import SiteSetting from "@/models/SiteSetting";
import { hashPassword } from "@/utils/auth";
import { generateReferenceNumber } from "@/utils/referenceNumber";

const ISSUE_CATEGORIES = [
  "roads",
  "waterlogging",
  "water",
  "streetlight",
  "waste",
  "education",
  "health",
  "playground",
  "environment",
  "social",
];

const run = async () => {
  await mongoose.connect(env.mongodbUri);
  console.log("[seed] Connected to database.");

  // 1. Super admin account
  const existingAdmin = await User.findOne({ email: env.seedSuperAdminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Super Admin",
      email: env.seedSuperAdminEmail,
      passwordHash: await hashPassword(env.seedSuperAdminPassword),
      role: "SUPER_ADMIN",
    });
    console.log(`[seed] Created super admin: ${env.seedSuperAdminEmail}`);
  } else {
    console.log("[seed] Super admin already exists, skipping.");
  }

  // 2. Site settings — real values from the org profile PDF; anything
  // unavailable (phone) is left blank for the admin to fill in later.
  await SiteSetting.findOneAndUpdate(
    {},
    {
      orgName: "আমাদের কাঞ্চনা",
      tagline: "আমাদের গ্রাম, আমাদেরই দায়িত্ব।",
      vision:
        "কাঞ্চনার জনগণের অংশগ্রহণের মাধ্যমে একটি সুন্দর, নিরাপদ, মাদকমুক্ত, মানবিক ও সচেতন ও সমৃদ্ধ কাঞ্চনা গড়ে তোলা।",
      mission:
        "সামাজিক ঐক্য, স্বেচ্ছাসেবা, তরুণ নেতৃত্ব ও জনসম্পৃক্ততার মাধ্যমে কাঞ্চনার মানুষের কল্যাণে কার্যকর উদ্যোগ গ্রহণ করা।",
      facebookUrl: "https://facebook.com/amader.kanchana",
      email: "amaderkanchana@gmail.com",
      phone: "",
      address: "কাঞ্চনা, সাতকানিয়া, চট্টগ্রাম",
    },
    { upsert: true },
  );
  console.log("[seed] Site settings upserted.");

  if (!env.seedDemoData) {
    console.log("[seed] SEED_DEMO_DATA=false, skipping demo content.");
    await mongoose.disconnect();
    return;
  }

  // 3. 9 wards — numbers only; names are real-world data not yet available.
  for (let n = 1; n <= 9; n++) {
    await Ward.findOneAndUpdate({ number: n }, { number: n, isDemoData: false }, { upsert: true });
  }
  console.log("[seed] Wards 1–9 ensured.");

  // 4. Demo issues (clearly labeled)
  await Issue.deleteMany({ isDemoData: true });
  const demoIssueTitles = [
    "রাস্তায় বড় গর্ত সৃষ্টি হয়েছে",
    "এলাকায় জলাবদ্ধতা দেখা দিয়েছে",
    "স্ট্রিট লাইট নষ্ট, রাতে অন্ধকার",
    "খেলার মাঠে বর্জ্য ফেলা হচ্ছে",
    "সুপেয় পানির সংকট",
    "বাজারে পয়ঃনিষ্কাশন ব্যবস্থা নেই",
    "বিদ্যালয়ের সীমানা প্রাচীর ভাঙা",
    "সামাজিক অনুষ্ঠানে মাদক সেবনের অভিযোগ",
    "খালের উপর অবৈধ দখল",
    "গ্রামীণ সড়কে গাছ পড়ে যান চলাচল বন্ধ",
  ];
  for (let i = 0; i < demoIssueTitles.length; i++) {
    const referenceNumber = await generateReferenceNumber();
    await Issue.create({
      referenceNumber,
      title: `[Demo] ${demoIssueTitles[i]}`,
      category: ISSUE_CATEGORIES[i % ISSUE_CATEGORIES.length],
      ward: `Ward ${(i % 9) + 1}`,
      area: `ডেমো এলাকা ${i + 1}`,
      description: "এটি একটি ডেমো/নমুনা তথ্য, উন্নয়নের উদ্দেশ্যে তৈরি। বাস্তব তথ্য নয়।",
      status: ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "IN_PROGRESS", "RESOLVED"][i % 5],
      isPublic: true,
      isDemoData: true,
      updates: [{ status: "SUBMITTED", note: "Demo report submitted." }],
    });
  }
  console.log(`[seed] Created ${demoIssueTitles.length} demo issues.`);

  // 5. Demo institutions
  await Institution.deleteMany({ isDemoData: true });
  const demoInstitutions = [
    { name: "[Demo] কাঞ্চনা উচ্চ বিদ্যালয়", category: "school" },
    { name: "[Demo] কাঞ্চনা সরকারি প্রাথমিক বিদ্যালয়", category: "school" },
    { name: "[Demo] কাঞ্চনা কেন্দ্রীয় জামে মসজিদ", category: "mosque" },
    { name: "[Demo] কাঞ্চনা কমিউনিটি ক্লিনিক", category: "health" },
    { name: "[Demo] কাঞ্চনা বাজার", category: "market" },
    { name: "[Demo] কাঞ্চনা খেলার মাঠ", category: "playground" },
    { name: "[Demo] কাঞ্চনা কলেজ", category: "college" },
    { name: "[Demo] কাঞ্চনা মাদ্রাসা", category: "madrasa" },
    { name: "[Demo] কাঞ্চনা কমিউনিটি সেন্টার", category: "community" },
    { name: "[Demo] কাঞ্চনা মন্দির", category: "temple" },
  ];
  for (let i = 0; i < demoInstitutions.length; i++) {
    await Institution.create({
      ...demoInstitutions[i],
      ward: `Ward ${(i % 9) + 1}`,
      isDemoData: true,
    });
  }
  console.log(`[seed] Created ${demoInstitutions.length} demo institutions.`);

  // 6. Demo projects
  await Project.deleteMany({ isDemoData: true });
  const demoProjects = [
    { title: "[Demo] ফ্রি মেডিক্যাল ক্যাম্প", category: "health", status: "COMPLETED" },
    { title: "[Demo] শিক্ষা সহায়ক কর্মসূচী", category: "education", status: "ONGOING" },
    { title: "[Demo] তরুণ ও ক্রীড়া কর্মসূচী", category: "youth", status: "ONGOING" },
    { title: "[Demo] মাদকবিরোধী প্রচারণা", category: "anti-drug", status: "ONGOING" },
    { title: "[Demo] বৃক্ষরোপণ কর্মসূচী", category: "environment", status: "PLANNED" },
  ];
  for (let i = 0; i < demoProjects.length; i++) {
    await Project.create({
      ...demoProjects[i],
      description: "এটি একটি ডেমো/নমুনা প্রকল্প, উন্নয়নের উদ্দেশ্যে তৈরি। বাস্তব প্রকল্প নয়।",
      ward: `Ward ${(i % 9) + 1}`,
      isDemoData: true,
    });
  }
  console.log(`[seed] Created ${demoProjects.length} demo projects.`);

  // 7. Demo activities
  await Activity.deleteMany({ isDemoData: true });
  const demoActivities = [
    "[Demo] মেডিক্যাল ক্যাম্প অনুষ্ঠিত",
    "[Demo] শিক্ষা উপকরণ বিতরণ",
    "[Demo] মাদকবিরোধী সচেতনতা সভা",
    "[Demo] বৃক্ষরোপণ কার্যক্রম",
    "[Demo] দুঃস্থদের মাঝে উপহার সামগ্রী বিতরণ",
  ];
  for (let i = 0; i < demoActivities.length; i++) {
    await Activity.create({
      title: demoActivities[i],
      date: new Date(Date.now() - i * 20 * 24 * 60 * 60 * 1000),
      description: "এটি একটি ডেমো/নমুনা কার্যক্রম, উন্নয়নের উদ্দেশ্যে তৈরি। বাস্তব কার্যক্রম নয়।",
      category: "general",
      isPublished: true,
      isDemoData: true,
    });
  }
  console.log(`[seed] Created ${demoActivities.length} demo activities.`);

  console.log("[seed] Done. Remove demo data anytime with isDemoData: true filters.");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
