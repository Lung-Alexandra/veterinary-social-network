-- Insert sample users with properly hashed passwords (password123)
INSERT INTO "User" (email, name, password, bio, role) VALUES
('dr.smith@vetclinic.com', 'Dr. Sarah Smith', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emergency veterinarian with 8 years of experience. Passionate about saving lives.', 'USER'),
('dr.johnson@vetclinic.com', 'Dr. Michael Johnson', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Small animal veterinarian specializing in feline medicine.', 'USER'),
('dr.williams@vetclinic.com', 'Dr. Emily Williams', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Veterinary surgeon with expertise in orthopedic procedures.', 'USER'),
('vet.tech@vetclinic.com', 'Jessica Martinez', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Licensed veterinary technician passionate about preventive care.', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Insert tags (all hashtags from posts)
INSERT INTO "Tag" (name) VALUES
('EmergencyVet'),
('ForeignObject'),
('Surgery'),
('DentalHealth'),
('PreventiveCare'),
('PetCare'),
('Reunion'),
('HappyEnding'),
('WhyILoveBeingAVet'),
('WinterSafety'),
('SeasonalTips'),
('FelineDiabetes'),
('TreatmentProtocol'),
('VetConference'),
('CommunityService'),
('FreeClinic'),
('Vaccinations'),
('CaseStudy'),
('Hyperthyroidism'),
('Diagnosis'),
('EarlyDetection'),
('AnnualExam'),
('Technology'),
('DigitalXRay'),
('Diagnostics'),
('EndOfLifeCare'),
('Compassion'),
('Remembering')
ON CONFLICT (name) DO NOTHING;

-- Insert sample posts (without hashtags in content)
INSERT INTO "Post" (title, content, "authorId", "createdAt", type) VALUES
('Late Night Emergency - Foreign Object Removal', 'Just finished a 3-hour surgery removing a tennis ball from a Golden Retriever''s stomach. The owner thought it was just indigestion, but X-rays showed the ball was lodged in the pylorus. Surgery went smoothly and Max is recovering well. Always remember: if your dog swallows something unusual, don''t wait - bring them in immediately!', (SELECT id FROM "User" WHERE email = 'dr.smith@vetclinic.com'), NOW() - INTERVAL '1 day', 'TEXT'),

('Dental Health Month - What You Need to Know', 'February is Pet Dental Health Month! Did you know that 80% of dogs and 70% of cats over 3 years old have some form of dental disease? Regular brushing, dental chews, and annual cleanings can prevent serious health issues. I''ve seen too many cases where dental disease led to heart problems. Start your pet''s dental routine today!', (SELECT id FROM "User" WHERE email = 'dr.johnson@vetclinic.com'), NOW() - INTERVAL '2 days', 'TEXT'),

('Reunion After 6 Months', 'Today was magical! A family came in with their cat who had been missing for 6 months. They found him injured on the side of the road. After weeks of treatment and recovery, he''s finally back home. The look on the children''s faces when they saw their beloved Whiskers again... this is why I became a vet. Sometimes miracles do happen!', (SELECT id FROM "User" WHERE email = 'dr.williams@vetclinic.com'), NOW() - INTERVAL '3 days', 'TEXT'),

('Winter Safety Tips for Your Pets', 'With temperatures dropping, here are essential winter safety tips: 1) Keep antifreeze away - it''s deadly to pets 2) Wipe paws after walks to remove salt and chemicals 3) Provide extra bedding for outdoor pets 4) Watch for signs of hypothermia 5) Consider pet-safe ice melt products. Stay warm and safe this winter!', (SELECT id FROM "User" WHERE email = 'vet.tech@vetclinic.com'), NOW() - INTERVAL '4 days', 'TEXT'),

('New Treatment Protocol for Feline Diabetes', 'Attended an amazing conference on feline diabetes management. The new insulin protocols are showing 85% remission rates in cats with early intervention and proper diet management. Key factors: low-carb diet, weight management, and regular monitoring. Excited to implement these protocols in our clinic. Anyone else using these new guidelines?', (SELECT id FROM "User" WHERE email = 'dr.smith@vetclinic.com'), NOW() - INTERVAL '5 days', 'TEXT'),

('Free Vaccination Clinic This Saturday', 'Join us this Saturday from 9 AM to 2 PM for our free vaccination clinic! We''ll be providing rabies, DHPP, and FVRCP vaccines for pets in need. This is our way of giving back to the community. Please bring proof of income if you need assistance. Together, we can keep all pets healthy!', (SELECT id FROM "User" WHERE email = 'dr.johnson@vetclinic.com'), NOW() - INTERVAL '6 days', 'TEXT'),

('Interesting Case: Cat with Unusual Behavior', 'Interesting case today: 3-year-old cat presenting with sudden aggression and excessive vocalization. Owner thought it was behavioral, but blood work revealed hyperthyroidism. After starting medication, the cat''s personality completely changed back to normal. Always rule out medical causes before assuming behavioral issues!', (SELECT id FROM "User" WHERE email = 'dr.williams@vetclinic.com'), NOW() - INTERVAL '7 days', 'TEXT'),

('Why Annual Checkups Matter', 'Just caught early-stage kidney disease in a 7-year-old cat during a routine checkup. The owner said ''he seems fine,'' but blood work told a different story. Early detection means we can slow progression and give this cat many more healthy years. Annual exams aren''t just routine - they''re lifesaving!', (SELECT id FROM "User" WHERE email = 'vet.tech@vetclinic.com'), NOW() - INTERVAL '8 days', 'TEXT'),

('New Digital X-Ray System Installed', 'Excited to announce our new digital X-ray system is up and running! The image quality is incredible, and we can now share results instantly with specialists. This will significantly improve our diagnostic capabilities. First case: clear images of a dog''s fractured leg - much better detail than our old system!', (SELECT id FROM "User" WHERE email = 'dr.smith@vetclinic.com'), NOW() - INTERVAL '9 days', 'TEXT'),

('Saying Goodbye to a Beloved Patient', 'Today we said goodbye to Buddy, a 15-year-old Labrador who had been our patient for 12 years. His family was devastated, but they made the right choice for his comfort. These moments are the hardest part of our job, but also the most important. Rest in peace, Buddy. You were loved.', (SELECT id FROM "User" WHERE email = 'dr.johnson@vetclinic.com'), NOW() - INTERVAL '10 days', 'TEXT');

-- Connect posts to tags (all hashtags from each post)
INSERT INTO "_PostToTag" ("A", "B") VALUES
-- Late Night Emergency - Foreign Object Removal
((SELECT id FROM "Post" WHERE title = 'Late Night Emergency - Foreign Object Removal'), (SELECT id FROM "Tag" WHERE name = 'EmergencyVet')),
((SELECT id FROM "Post" WHERE title = 'Late Night Emergency - Foreign Object Removal'), (SELECT id FROM "Tag" WHERE name = 'ForeignObject')),
((SELECT id FROM "Post" WHERE title = 'Late Night Emergency - Foreign Object Removal'), (SELECT id FROM "Tag" WHERE name = 'Surgery')),

-- Dental Health Month - What You Need to Know
((SELECT id FROM "Post" WHERE title = 'Dental Health Month - What You Need to Know'), (SELECT id FROM "Tag" WHERE name = 'DentalHealth')),
((SELECT id FROM "Post" WHERE title = 'Dental Health Month - What You Need to Know'), (SELECT id FROM "Tag" WHERE name = 'PreventiveCare')),
((SELECT id FROM "Post" WHERE title = 'Dental Health Month - What You Need to Know'), (SELECT id FROM "Tag" WHERE name = 'PetCare')),

-- Reunion After 6 Months
((SELECT id FROM "Post" WHERE title = 'Reunion After 6 Months'), (SELECT id FROM "Tag" WHERE name = 'Reunion')),
((SELECT id FROM "Post" WHERE title = 'Reunion After 6 Months'), (SELECT id FROM "Tag" WHERE name = 'HappyEnding')),
((SELECT id FROM "Post" WHERE title = 'Reunion After 6 Months'), (SELECT id FROM "Tag" WHERE name = 'WhyILoveBeingAVet')),

-- Winter Safety Tips for Your Pets
((SELECT id FROM "Post" WHERE title = 'Winter Safety Tips for Your Pets'), (SELECT id FROM "Tag" WHERE name = 'WinterSafety')),
((SELECT id FROM "Post" WHERE title = 'Winter Safety Tips for Your Pets'), (SELECT id FROM "Tag" WHERE name = 'PetCare')),
((SELECT id FROM "Post" WHERE title = 'Winter Safety Tips for Your Pets'), (SELECT id FROM "Tag" WHERE name = 'SeasonalTips')),

-- New Treatment Protocol for Feline Diabetes
((SELECT id FROM "Post" WHERE title = 'New Treatment Protocol for Feline Diabetes'), (SELECT id FROM "Tag" WHERE name = 'FelineDiabetes')),
((SELECT id FROM "Post" WHERE title = 'New Treatment Protocol for Feline Diabetes'), (SELECT id FROM "Tag" WHERE name = 'TreatmentProtocol')),
((SELECT id FROM "Post" WHERE title = 'New Treatment Protocol for Feline Diabetes'), (SELECT id FROM "Tag" WHERE name = 'VetConference')),

-- Free Vaccination Clinic This Saturday
((SELECT id FROM "Post" WHERE title = 'Free Vaccination Clinic This Saturday'), (SELECT id FROM "Tag" WHERE name = 'CommunityService')),
((SELECT id FROM "Post" WHERE title = 'Free Vaccination Clinic This Saturday'), (SELECT id FROM "Tag" WHERE name = 'FreeClinic')),
((SELECT id FROM "Post" WHERE title = 'Free Vaccination Clinic This Saturday'), (SELECT id FROM "Tag" WHERE name = 'Vaccinations')),

-- Interesting Case: Cat with Unusual Behavior
((SELECT id FROM "Post" WHERE title = 'Interesting Case: Cat with Unusual Behavior'), (SELECT id FROM "Tag" WHERE name = 'CaseStudy')),
((SELECT id FROM "Post" WHERE title = 'Interesting Case: Cat with Unusual Behavior'), (SELECT id FROM "Tag" WHERE name = 'Hyperthyroidism')),
((SELECT id FROM "Post" WHERE title = 'Interesting Case: Cat with Unusual Behavior'), (SELECT id FROM "Tag" WHERE name = 'Diagnosis')),

-- Why Annual Checkups Matter
((SELECT id FROM "Post" WHERE title = 'Why Annual Checkups Matter'), (SELECT id FROM "Tag" WHERE name = 'PreventiveCare')),
((SELECT id FROM "Post" WHERE title = 'Why Annual Checkups Matter'), (SELECT id FROM "Tag" WHERE name = 'EarlyDetection')),
((SELECT id FROM "Post" WHERE title = 'Why Annual Checkups Matter'), (SELECT id FROM "Tag" WHERE name = 'AnnualExam')),

-- New Digital X-Ray System Installed
((SELECT id FROM "Post" WHERE title = 'New Digital X-Ray System Installed'), (SELECT id FROM "Tag" WHERE name = 'Technology')),
((SELECT id FROM "Post" WHERE title = 'New Digital X-Ray System Installed'), (SELECT id FROM "Tag" WHERE name = 'DigitalXRay')),
((SELECT id FROM "Post" WHERE title = 'New Digital X-Ray System Installed'), (SELECT id FROM "Tag" WHERE name = 'Diagnostics')),

-- Saying Goodbye to a Beloved Patient
((SELECT id FROM "Post" WHERE title = 'Saying Goodbye to a Beloved Patient'), (SELECT id FROM "Tag" WHERE name = 'EndOfLifeCare')),
((SELECT id FROM "Post" WHERE title = 'Saying Goodbye to a Beloved Patient'), (SELECT id FROM "Tag" WHERE name = 'Compassion')),
((SELECT id FROM "Post" WHERE title = 'Saying Goodbye to a Beloved Patient'), (SELECT id FROM "Tag" WHERE name = 'Remembering'))
ON CONFLICT DO NOTHING;

-- Insert sample comments
INSERT INTO "Comment" (content, "authorId", "postId", "createdAt") VALUES
('Great work Dr. Smith! I''ve seen similar cases and early intervention is key. Thanks for sharing this case study.', (SELECT id FROM "User" WHERE email = 'dr.johnson@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Late Night Emergency - Foreign Object Removal'), NOW() - INTERVAL '1 hour'),

('This is so important! I always tell my clients about dental care but many don''t realize the connection to heart disease.', (SELECT id FROM "User" WHERE email = 'dr.williams@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Dental Health Month - What You Need to Know'), NOW() - INTERVAL '2 hours'),

('What a heartwarming story! These moments make all the difficult cases worth it. Thank you for sharing.', (SELECT id FROM "User" WHERE email = 'vet.tech@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Reunion After 6 Months'), NOW() - INTERVAL '3 hours'),

('Excellent winter safety tips! I''ll be sharing these with all my clients. The antifreeze warning is especially important.', (SELECT id FROM "User" WHERE email = 'dr.smith@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Winter Safety Tips for Your Pets'), NOW() - INTERVAL '4 hours'),

('I''ve been using these new protocols for 6 months now and the results are amazing! 90% of my feline diabetes cases are in remission.', (SELECT id FROM "User" WHERE email = 'dr.williams@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'New Treatment Protocol for Feline Diabetes'), NOW() - INTERVAL '5 hours'),

('This is fantastic! I wish more clinics would offer free services to the community. You''re making a real difference.', (SELECT id FROM "User" WHERE email = 'vet.tech@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Late Night Emergency - Foreign Object Removal'), NOW() - INTERVAL '6 hours'),

('I had a similar case last week! The owner was convinced it was behavioral until we ran the blood work. Hyperthyroidism can cause such dramatic personality changes.', (SELECT id FROM "User" WHERE email = 'dr.johnson@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Interesting Case: Cat with Unusual Behavior'), NOW() - INTERVAL '7 hours'),

('This is why I always recommend annual blood work, even for seemingly healthy pets. Early detection saves lives!', (SELECT id FROM "User" WHERE email = 'dr.williams@vetclinic.com'), (SELECT id FROM "Post" WHERE title = 'Why Annual Checkups Matter'), NOW() - INTERVAL '8 hours');
