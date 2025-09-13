const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed the database...');

  // Hash password for all users (password: password123)
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('Password hashed for all users: password123');

  // First, let's create some users if they don't exist
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'dr.smith@vetclinic.com' },
      update: {},
      create: {
        email: 'dr.smith@vetclinic.com',
        name: 'Dr. Sarah Smith',
        password: hashedPassword,
        bio: 'Emergency veterinarian with 8 years of experience. Passionate about saving lives.',
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'dr.johnson@vetclinic.com' },
      update: {},
      create: {
        email: 'dr.johnson@vetclinic.com',
        name: 'Dr. Michael Johnson',
        password: hashedPassword,
        bio: 'Small animal veterinarian specializing in feline medicine.',
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'dr.williams@vetclinic.com' },
      update: {},
      create: {
        email: 'dr.williams@vetclinic.com',
        name: 'Dr. Emily Williams',
        password: hashedPassword,
        bio: 'Veterinary surgeon with expertise in orthopedic procedures.',
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'vet.tech@vetclinic.com' },
      update: {},
      create: {
        email: 'vet.tech@vetclinic.com',
        name: 'Jessica Martinez',
        password: hashedPassword,
        bio: 'Licensed veterinary technician passionate about preventive care.',
        role: 'USER'
      }
    })
  ]);

  console.log('Users created:', users.length);

  // Create tags with random IDs
  const tagNames = [
    'EmergencyVet', 'ForeignObject', 'Surgery', 'DentalHealth', 'PreventiveCare',
    'PetCare', 'Reunion', 'HappyEnding', 'WhyILoveBeingAVet', 'WinterSafety',
    'SeasonalTips', 'FelineDiabetes', 'TreatmentProtocol', 'VetConference',
    'CommunityService', 'FreeClinic', 'Vaccinations', 'CaseStudy', 'Hyperthyroidism',
    'Diagnosis', 'EarlyDetection', 'AnnualExam', 'Technology', 'DigitalXRay',
    'Diagnostics', 'EndOfLifeCare', 'Compassion', 'Remembering'
  ];

  const tags = [];
  for (const tagName of tagNames) {
    try {
      const tag = await prisma.tag.create({
        data: { name: tagName }
      });
      tags.push(tag);
    } catch (error) {
      // Tag already exists, find it
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName }
      });
      if (existingTag) {
        tags.push(existingTag);
      }
    }
  }

  console.log('Tags created:', tags.length);

  // Function to extract hashtags from content
  function extractHashtags(content) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1]);
    }
    return hashtags;
  }

  // Function to remove hashtags from content
  function removeHashtags(content) {
    return content.replace(/#\w+/g, '').trim();
  }

  // Create realistic posts
  const posts = [
    {
      title: "Late Night Emergency - Foreign Object Removal",
      content: "Just finished a 3-hour surgery removing a tennis ball from a Golden Retriever's stomach. The owner thought it was just indigestion, but X-rays showed the ball was lodged in the pylorus. Surgery went smoothly and Max is recovering well. Always remember: if your dog swallows something unusual, don't wait - bring them in immediately! #EmergencyVet #ForeignObject #Surgery",
      authorId: users[0].id,
      type: 'TEXT'
    },
    {
      title: "Dental Health Month - What You Need to Know",
      content: "February is Pet Dental Health Month! Did you know that 80% of dogs and 70% of cats over 3 years old have some form of dental disease? Regular brushing, dental chews, and annual cleanings can prevent serious health issues. I've seen too many cases where dental disease led to heart problems. Start your pet's dental routine today! #DentalHealth #PreventiveCare #PetCare",
      authorId: users[1].id,
      type: 'TEXT'
    },
    {
      title: "Reunion After 6 Months",
      content: "Today was magical! A family came in with their cat who had been missing for 6 months. They found him injured on the side of the road. After weeks of treatment and recovery, he's finally back home. The look on the children's faces when they saw their beloved Whiskers again... this is why I became a vet. Sometimes miracles do happen! #Reunion #HappyEnding #WhyILoveBeingAVet",
      authorId: users[2].id,
      type: 'TEXT'
    },
    {
      title: "Winter Safety Tips for Your Pets",
      content: "With temperatures dropping, here are essential winter safety tips: 1) Keep antifreeze away - it's deadly to pets 2) Wipe paws after walks to remove salt and chemicals 3) Provide extra bedding for outdoor pets 4) Watch for signs of hypothermia 5) Consider pet-safe ice melt products. Stay warm and safe this winter! #WinterSafety #PetCare #SeasonalTips",
      authorId: users[3].id,
      type: 'TEXT'
    },
    {
      title: "New Treatment Protocol for Feline Diabetes",
      content: "Attended an amazing conference on feline diabetes management. The new insulin protocols are showing 85% remission rates in cats with early intervention and proper diet management. Key factors: low-carb diet, weight management, and regular monitoring. Excited to implement these protocols in our clinic. Anyone else using these new guidelines? #FelineDiabetes #TreatmentProtocol #VetConference",
      authorId: users[0].id,
      type: 'TEXT'
    },
    {
      title: "Free Vaccination Clinic This Saturday",
      content: "Join us this Saturday from 9 AM to 2 PM for our free vaccination clinic! We'll be providing rabies, DHPP, and FVRCP vaccines for pets in need. This is our way of giving back to the community. Please bring proof of income if you need assistance. Together, we can keep all pets healthy! #CommunityService #FreeClinic #Vaccinations",
      authorId: users[1].id,
      type: 'TEXT'
    },
    {
      title: "Interesting Case: Cat with Unusual Behavior",
      content: "Interesting case today: 3-year-old cat presenting with sudden aggression and excessive vocalization. Owner thought it was behavioral, but blood work revealed hyperthyroidism. After starting medication, the cat's personality completely changed back to normal. Always rule out medical causes before assuming behavioral issues! #CaseStudy #Hyperthyroidism #Diagnosis",
      authorId: users[2].id,
      type: 'TEXT'
    },
    {
      title: "Why Annual Checkups Matter",
      content: "Just caught early-stage kidney disease in a 7-year-old cat during a routine checkup. The owner said 'he seems fine,' but blood work told a different story. Early detection means we can slow progression and give this cat many more healthy years. Annual exams aren't just routine - they're lifesaving! #PreventiveCare #EarlyDetection #AnnualExam",
      authorId: users[3].id,
      type: 'TEXT'
    },
    {
      title: "New Digital X-Ray System Installed",
      content: "Excited to announce our new digital X-ray system is up and running! The image quality is incredible, and we can now share results instantly with specialists. This will significantly improve our diagnostic capabilities. First case: clear images of a dog's fractured leg - much better detail than our old system! #Technology #DigitalXRay #Diagnostics",
      authorId: users[0].id,
      type: 'TEXT'
    },
    {
      title: "Saying Goodbye to a Beloved Patient",
      content: "Today we said goodbye to Buddy, a 15-year-old Labrador who had been our patient for 12 years. His family was devastated, but they made the right choice for his comfort. These moments are the hardest part of our job, but also the most important. Rest in peace, Buddy. You were loved. #EndOfLifeCare #Compassion #Remembering",
      authorId: users[1].id,
      type: 'TEXT'
    }
  ];

  // Create posts with tags
  for (const postData of posts) {
    // Extract hashtags from content
    const hashtags = extractHashtags(postData.content);
    
    // Remove hashtags from content
    const cleanContent = removeHashtags(postData.content);
    
    // Create or find tags for hashtags
    const tagConnections = [];
    for (const hashtag of hashtags) {
      try {
        // Try to create tag if it doesn't exist
        await prisma.tag.create({
          data: { name: hashtag }
        });
      } catch (error) {
        // Tag already exists, that's fine
      }
      tagConnections.push({ name: hashtag });
    }
    
    const post = await prisma.post.create({
      data: {
        ...postData,
        content: cleanContent,
        tags: {
          connect: tagConnections
        }
      }
    });
    
    console.log(`Created post: ${post.title} with tags: ${hashtags.join(', ')}`);
  }

  // Add sample comments to some posts
  const postsWithComments = await prisma.post.findMany({
    take: 5, // Get first 5 posts
    orderBy: { createdAt: 'desc' }
  });

  const sampleComments = [
    {
      content: "Great work Dr. Smith! I've seen similar cases and early intervention is key. Thanks for sharing this case study.",
      postId: postsWithComments[0].id,
      authorId: users[1].id
    },
    {
      content: "This is so important! I always tell my clients about dental care but many don't realize the connection to heart disease.",
      postId: postsWithComments[1].id,
      authorId: users[2].id
    },
    {
      content: "What a heartwarming story! These moments make all the difficult cases worth it. Thank you for sharing.",
      postId: postsWithComments[2].id,
      authorId: users[3].id
    },
    {
      content: "Excellent winter safety tips! I'll be sharing these with all my clients. The antifreeze warning is especially important.",
      postId: postsWithComments[3].id,
      authorId: users[0].id
    },
    {
      content: "I've been using these new protocols for 6 months now and the results are amazing! 90% of my feline diabetes cases are in remission.",
      postId: postsWithComments[4].id,
      authorId: users[2].id
    },
    {
      content: "This is fantastic! I wish more clinics would offer free services to the community. You're making a real difference.",
      postId: postsWithComments[0].id,
      authorId: users[3].id
    },
    {
      content: "I had a similar case last week! The owner was convinced it was behavioral until we ran the blood work. Hyperthyroidism can cause such dramatic personality changes.",
      postId: postsWithComments[2].id,
      authorId: users[1].id
    },
    {
      content: "This is why I always recommend annual blood work, even for seemingly healthy pets. Early detection saves lives!",
      postId: postsWithComments[3].id,
      authorId: users[2].id
    }
  ];

  for (const commentData of sampleComments) {
    const comment = await prisma.comment.create({
      data: commentData
    });
    console.log(`Created comment: ${comment.content.substring(0, 50)}...`);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
