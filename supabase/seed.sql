-- HostelHub Development Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- Passwords are bcrypt of 'demo123' for students and 'admin123' for admin

-- =============================================
-- STAFF
-- =============================================
INSERT INTO staff (id, name, role, phone, specialization, employee_id, department) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Ramesh Kumar',    'Electrician',    '9876543210', 'Fan,Light,Electricity,Wi-Fi', 'EMP001', 'Electrical'),
  ('a1000000-0000-0000-0000-000000000002', 'Suresh Plumber',  'Plumber',        '9876543211', 'Water,Plumbing,Bathroom',      'EMP002', 'Plumbing'),
  ('a1000000-0000-0000-0000-000000000003', 'Dinesh Carpenter','Carpenter',       '9876543212', 'Furniture,Door / Lock',        'EMP003', 'Carpentry'),
  ('a1000000-0000-0000-0000-000000000004', 'Mohan Sweeper',   'Cleaning Staff', '9876543213', 'Cleaning',                     'EMP004', 'Housekeeping')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PROFILES (Users)
-- Password hashes:
--   demo123  = $2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny
--   admin123 = $2a$10$HOZQeRdaR6kpT/oZ.py0men6jnwFnCvUqRqR8YxngTqbDC9QmRwUi
-- =============================================
INSERT INTO profiles (id, name, email, student_id, password_hash, role, room, hostel, block, phone, course, year) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Arjun Sharma',  'student@hostelhub.demo', 'STU001', '$2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny', 'student', 'B-204', 'New Boys Hostel',  NULL, '9988776655', 'B.Tech CSE', '3rd Year'),
  ('b1000000-0000-0000-0000-000000000002', 'Priya Patel',   'priya@hostelhub.demo',   'STU002', '$2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny', 'student', 'A-103', 'New Girls Hostel', NULL, '9988776644', 'B.Tech ECE', '2nd Year'),
  ('b1000000-0000-0000-0000-000000000003', 'Rahul Verma',   'rahul@hostelhub.demo',   'STU003', '$2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny', 'student', 'C-210', 'Technova',         NULL, '9988776633', 'B.Tech ME',  '4th Year'),
  ('b1000000-0000-0000-0000-000000000004', 'Sneha Gupta',   'sneha@hostelhub.demo',   'STU004', '$2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny', 'student', 'B-115', 'Old Girls Hostel', NULL, '9988776622', 'B.Tech IT',  '1st Year'),
  ('b1000000-0000-0000-0000-000000000005', 'Karan Singh',   'karan@hostelhub.demo',   'STU005', '$2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny', 'student', 'A-301', 'Old Boys Hostel',  NULL, '9988776611', 'B.Tech CSE', '2nd Year'),
  ('b1000000-0000-0000-0000-000000000006', 'Ananya Joshi',  'ananya@hostelhub.demo',  'STU006', '$2a$10$.w1S/rZy5SLi81eVNxikZurIXSWyvy/lYrpostO1y8BLlqU41T0Ny', 'student', 'C-108', 'Technova',         NULL, '9988776600', 'B.Tech EEE', '3rd Year'),
  ('b1000000-0000-0000-0000-000000000007', 'Admin Manager', 'admin@hostelhub.demo',   NULL,     '$2a$10$HOZQeRdaR6kpT/oZ.py0men6jnwFnCvUqRqR8YxngTqbDC9QmRwUi', 'admin',   NULL,    NULL,               NULL, '9900000001', NULL, NULL),
  ('538f235e-cc52-4dbb-a405-0813ba10cf7b', 'HostelHub Administrator', 'hostelhub.support@gmail.com', NULL, '$2a$10$HOZQeRdaR6kpT/oZ.py0men6jnwFnCvUqRqR8YxngTqbDC9QmRwUi', 'admin', NULL, NULL,               NULL, '9900000000', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- COMPLAINTS
-- =============================================
INSERT INTO complaints (id, complaint_number, student_id, category, title, description, room, hostel, priority, status, assigned_staff_id, assigned_staff_name, created_at, assigned_at, started_at, resolved_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'HH-2026-00124', 'b1000000-0000-0000-0000-000000000001', 'Fan',       'Ceiling Fan Not Working',        'The ceiling fan suddenly stopped working since this morning. It makes a clicking sound when switched on but blades don''t rotate. Very uncomfortable in this heat.',                  'B-204', 'New Boys Hostel',  'urgent', 'resolved',    'a1000000-0000-0000-0000-000000000001', 'Ramesh Kumar',   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 hours', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
  ('c1000000-0000-0000-0000-000000000002', 'HH-2026-00131', 'b1000000-0000-0000-0000-000000000001', 'Wi-Fi',     'Wi-Fi Extremely Slow in Room',   'Internet speed in room B-204 is very slow. Cannot attend online classes. Speed test shows only 0.5 Mbps.',                                                                    'B-204', 'New Boys Hostel',  'medium', 'in_progress', 'a1000000-0000-0000-0000-000000000001', 'Ramesh Kumar',   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '3 hours', NOW() - INTERVAL '1 day',  NULL),
  ('c1000000-0000-0000-0000-000000000003', 'HH-2026-00145', 'b1000000-0000-0000-0000-000000000001', 'Cleaning',  'Common Area Not Cleaned',        'The corridor on 2nd floor has not been cleaned for 3 days. There is a foul smell and garbage is piling up near the stairs.',                                                  'B-204', 'New Boys Hostel',  'normal', 'pending',     NULL,                                    NULL,             NOW() - INTERVAL '1 day',  NULL, NULL, NULL),
  ('c1000000-0000-0000-0000-000000000004', 'HH-2026-00117', 'b1000000-0000-0000-0000-000000000002', 'Water',     'Water Leakage from Ceiling',     'Water is dripping from the ceiling near the window. The wall has become damp and there is a risk of electrical hazard nearby.',                                               'A-103', 'New Girls Hostel', 'medium', 'in_progress', 'a1000000-0000-0000-0000-000000000002', 'Suresh Plumber', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '4 hours', NOW() - INTERVAL '6 days', NULL),
  ('c1000000-0000-0000-0000-000000000005', 'HH-2026-00139', 'b1000000-0000-0000-0000-000000000002', 'Light',     'Room Light Flickering',          'The tube light in my room keeps flickering continuously. It causes eye strain during studying.',                                                                             'A-103', 'New Girls Hostel', 'normal', 'assigned',    'a1000000-0000-0000-0000-000000000001', 'Ramesh Kumar',   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 hours', NULL, NULL),
  ('c1000000-0000-0000-0000-000000000006', 'HH-2026-00108', 'b1000000-0000-0000-0000-000000000003', 'Furniture', 'Study Table Leg Broken',         'One leg of the wooden study table is completely broken. Cannot use it for studying. Need urgent replacement or repair.',                                                     'C-210', 'Technova',         'normal', 'resolved',    'a1000000-0000-0000-0000-000000000003', 'Dinesh Carpenter', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '6 hours', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days'),
  ('c1000000-0000-0000-0000-000000000007', 'HH-2026-00149', 'b1000000-0000-0000-0000-000000000003', 'Door / Lock','Room Door Lock Jammed',        'The door lock is jammed from inside. Have to use extra force to open/close. Afraid of getting locked inside.',                                                               'C-210', 'Technova',         'medium', 'pending',     NULL, NULL, NOW(), NULL, NULL, NULL),
  ('c1000000-0000-0000-0000-000000000008', 'HH-2026-00119', 'b1000000-0000-0000-0000-000000000004', 'Bathroom',  'Bathroom Light Not Working',     'The light in the attached bathroom has completely stopped working. Very difficult to use at night.',                                                                           'B-115', 'Old Girls Hostel', 'urgent', 'assigned',    'a1000000-0000-0000-0000-000000000001', 'Ramesh Kumar', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '2 hours', NULL, NULL),
  ('c1000000-0000-0000-0000-000000000009', 'HH-2026-00133', 'b1000000-0000-0000-0000-000000000005', 'Plumbing',  'Tap Dripping Continuously',      'The tap in the wash basin drips continuously even when fully closed. Lot of water is being wasted day and night.',                                                           'A-301', 'Old Boys Hostel',  'normal', 'resolved',    'a1000000-0000-0000-0000-000000000002', 'Suresh Plumber', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '3 hours', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
  ('c1000000-0000-0000-0000-000000000010', 'HH-2026-00141', 'b1000000-0000-0000-0000-000000000006', 'Electricity','Power Socket Not Working',       'The 5-pin power socket near the study table is not giving output. Checked with a different device — same problem.',                                                           'C-108', 'Technova',         'medium', 'pending',     NULL, NULL, NOW() - INTERVAL '2 days', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- COMPLAINT STATUS HISTORY
-- =============================================
INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by_name, note, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '5 days'),
  ('c1000000-0000-0000-0000-000000000001', 'pending',     'assigned',    'Admin Manager',      'Assigned to Ramesh Kumar',          NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
  ('c1000000-0000-0000-0000-000000000001', 'assigned',    'in_progress', 'Ramesh Kumar',       'Started working on ceiling fan',    NOW() - INTERVAL '4 days'),
  ('c1000000-0000-0000-0000-000000000001', 'in_progress', 'resolved',    'Ramesh Kumar',       'Fan motor replaced, working now',   NOW() - INTERVAL '3 days'),
  ('c1000000-0000-0000-0000-000000000002', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '2 days'),
  ('c1000000-0000-0000-0000-000000000002', 'pending',     'assigned',    'Admin Manager',      'Assigned to Ramesh Kumar',          NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
  ('c1000000-0000-0000-0000-000000000002', 'assigned',    'in_progress', 'Ramesh Kumar',       'Checking router and network cables', NOW() - INTERVAL '1 day'),
  ('c1000000-0000-0000-0000-000000000003', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '1 day'),
  ('c1000000-0000-0000-0000-000000000004', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '7 days'),
  ('c1000000-0000-0000-0000-000000000004', 'pending',     'assigned',    'Admin Manager',      'Assigned to Suresh Plumber',        NOW() - INTERVAL '7 days' + INTERVAL '4 hours'),
  ('c1000000-0000-0000-0000-000000000004', 'assigned',    'in_progress', 'Suresh Plumber',     'Inspecting ceiling and water pipes', NOW() - INTERVAL '6 days'),
  ('c1000000-0000-0000-0000-000000000005', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '3 days'),
  ('c1000000-0000-0000-0000-000000000005', 'pending',     'assigned',    'Admin Manager',      'Assigned to Ramesh Kumar',          NOW() - INTERVAL '3 days' + INTERVAL '5 hours'),
  ('c1000000-0000-0000-0000-000000000006', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '10 days'),
  ('c1000000-0000-0000-0000-000000000006', 'pending',     'assigned',    'Admin Manager',      'Assigned to Dinesh Carpenter',      NOW() - INTERVAL '10 days' + INTERVAL '6 hours'),
  ('c1000000-0000-0000-0000-000000000006', 'assigned',    'in_progress', 'Dinesh Carpenter',   'Started repair work on table',      NOW() - INTERVAL '9 days'),
  ('c1000000-0000-0000-0000-000000000006', 'in_progress', 'resolved',    'Dinesh Carpenter',   'Table leg replaced with new one',   NOW() - INTERVAL '8 days'),
  ('c1000000-0000-0000-0000-000000000007', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW()),
  ('c1000000-0000-0000-0000-000000000008', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '4 days'),
  ('c1000000-0000-0000-0000-000000000008', 'pending',     'assigned',    'Admin Manager',      'Assigned to Ramesh Kumar',          NOW() - INTERVAL '4 days' + INTERVAL '2 hours'),
  ('c1000000-0000-0000-0000-000000000009', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '6 days'),
  ('c1000000-0000-0000-0000-000000000009', 'pending',     'assigned',    'Admin Manager',      'Assigned to Suresh Plumber',        NOW() - INTERVAL '6 days' + INTERVAL '3 hours'),
  ('c1000000-0000-0000-0000-000000000009', 'assigned',    'in_progress', 'Suresh Plumber',     'Identified faulty tap washer',      NOW() - INTERVAL '5 days'),
  ('c1000000-0000-0000-0000-000000000009', 'in_progress', 'resolved',    'Suresh Plumber',     'Replaced tap washer, no more drip', NOW() - INTERVAL '4 days'),
  ('c1000000-0000-0000-0000-000000000010', NULL,          'pending',     'System',             'Complaint submitted by student',   NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- =============================================
-- COMPLAINT FEEDBACK
-- =============================================
INSERT INTO complaint_feedback (complaint_id, student_id, solved, rating, comment, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', true, 5, 'Fan was fixed very quickly. Thank you for the prompt response!', NOW() - INTERVAL '3 days'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', true, 4, 'Table was replaced. Good job, but took a bit longer than expected.', NOW() - INTERVAL '8 days'),
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000005', true, 5, 'Tap fixed same day. Excellent service!', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- =============================================
-- MESS REVIEWS (Today and past 6 days)
-- =============================================
INSERT INTO mess_reviews (student_id, meal_type, review_date, rating, review_text, anonymous) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'breakfast', CURRENT_DATE,              4, 'Good poha today, freshly made!',          false),
  ('b1000000-0000-0000-0000-000000000001', 'lunch',     CURRENT_DATE,              3, 'Dal was too salty. Rice was fine.',        false),
  ('b1000000-0000-0000-0000-000000000002', 'breakfast', CURRENT_DATE,              5, 'Amazing breakfast! Loved the upma.',       false),
  ('b1000000-0000-0000-0000-000000000002', 'lunch',     CURRENT_DATE,              2, 'Roti was very hard. Vegetables were undercooked.', false),
  ('b1000000-0000-0000-0000-000000000003', 'lunch',     CURRENT_DATE,              4, 'Nice paneer dish today.',                  true),
  ('b1000000-0000-0000-0000-000000000003', 'dinner',    CURRENT_DATE,              3, 'Average dinner. Nothing special.',         false),
  ('b1000000-0000-0000-0000-000000000004', 'breakfast', CURRENT_DATE,              3, 'Bread was stale.',                         false),
  ('b1000000-0000-0000-0000-000000000004', 'dinner',    CURRENT_DATE,              5, 'Best dinner of the week! Loved it.',       false),
  ('b1000000-0000-0000-0000-000000000005', 'breakfast', CURRENT_DATE,              4, 'Breakfast was decent today.',              false),
  ('b1000000-0000-0000-0000-000000000006', 'lunch',     CURRENT_DATE,              3, 'Average, could be better.',                true),
  ('b1000000-0000-0000-0000-000000000001', 'breakfast', CURRENT_DATE - 1,          3, 'Tea was cold today.',                      false),
  ('b1000000-0000-0000-0000-000000000001', 'lunch',     CURRENT_DATE - 1,          4, 'Good rajma rice combination.',             false),
  ('b1000000-0000-0000-0000-000000000001', 'dinner',    CURRENT_DATE - 1,          4, 'Dinner was satisfying.',                   false),
  ('b1000000-0000-0000-0000-000000000002', 'breakfast', CURRENT_DATE - 1,          4, 'Breakfast was fresh.',                     true),
  ('b1000000-0000-0000-0000-000000000002', 'lunch',     CURRENT_DATE - 1,          3, 'Too oily today.',                          false),
  ('b1000000-0000-0000-0000-000000000005', 'breakfast', CURRENT_DATE - 1,          5, 'Loved the aloo paratha!',                  false),
  ('b1000000-0000-0000-0000-000000000005', 'dinner',    CURRENT_DATE - 1,          4, 'Dal makhani was excellent.',               false),
  ('b1000000-0000-0000-0000-000000000003', 'breakfast', CURRENT_DATE - 2,          4, 'Nice idli sambar.',                        false),
  ('b1000000-0000-0000-0000-000000000003', 'dinner',    CURRENT_DATE - 2,          4, 'Good biryani on Friday!',                  false),
  ('b1000000-0000-0000-0000-000000000006', 'lunch',     CURRENT_DATE - 2,          2, 'The curry was watery. Needs improvement.', false),
  ('b1000000-0000-0000-0000-000000000001', 'breakfast', CURRENT_DATE - 3,          4, 'Dosa was crispy and well-made.',           false),
  ('b1000000-0000-0000-0000-000000000001', 'lunch',     CURRENT_DATE - 3,          3, 'Rice was slightly undercooked.',           false),
  ('b1000000-0000-0000-0000-000000000002', 'breakfast', CURRENT_DATE - 4,          5, 'Best breakfast in weeks!',                 false),
  ('b1000000-0000-0000-0000-000000000002', 'lunch',     CURRENT_DATE - 4,          4, 'Good quality food.',                       false),
  ('b1000000-0000-0000-0000-000000000005', 'breakfast', CURRENT_DATE - 5,          3, 'Plain breakfast, nothing special.',        false),
  ('b1000000-0000-0000-0000-000000000005', 'lunch',     CURRENT_DATE - 5,          5, 'Special Sunday lunch was superb!',         false),
  ('b1000000-0000-0000-0000-000000000006', 'breakfast', CURRENT_DATE - 6,          4, 'Fresh poori bhaji!',                       false),
  ('b1000000-0000-0000-0000-000000000006', 'dinner',    CURRENT_DATE - 6,          4, 'Nice dinner to end the week.',             false)
ON CONFLICT (student_id, meal_type, review_date) DO NOTHING;

-- =============================================
-- NOTIFICATIONS
-- =============================================
INSERT INTO notifications (user_id, title, message, type, related_complaint_id, is_read, created_at) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Complaint Submitted ✅',    'Your complaint HH-2026-00124 (Ceiling Fan Not Working) has been submitted successfully.',     'complaint', 'c1000000-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '5 days'),
  ('b1000000-0000-0000-0000-000000000001', 'Complaint Assigned 👨‍🔧',  'Your complaint HH-2026-00124 has been assigned to Ramesh Kumar (Electrician).',              'complaint', 'c1000000-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
  ('b1000000-0000-0000-0000-000000000001', 'Work In Progress 🔧',       'Work has started on your complaint HH-2026-00124.',                                           'complaint', 'c1000000-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '4 days'),
  ('b1000000-0000-0000-0000-000000000001', 'Complaint Resolved ✅',      'Your complaint HH-2026-00124 (Ceiling Fan Not Working) has been resolved! Please verify.',  'complaint', 'c1000000-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '3 days'),
  ('b1000000-0000-0000-0000-000000000001', 'Complaint Submitted ✅',    'Your complaint HH-2026-00131 (Wi-Fi Extremely Slow) has been submitted successfully.',        'complaint', 'c1000000-0000-0000-0000-000000000002', true,  NOW() - INTERVAL '2 days'),
  ('b1000000-0000-0000-0000-000000000001', 'Complaint Assigned 👨‍🔧',  'Your complaint HH-2026-00131 has been assigned to Ramesh Kumar (Electrician).',              'complaint', 'c1000000-0000-0000-0000-000000000002', true,  NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
  ('b1000000-0000-0000-0000-000000000001', 'Rate Today''s Dinner 🍽️',  'How was dinner today? Share your feedback to help improve mess quality!',                     'mess',      NULL,                                    false, NOW() - INTERVAL '5 hours'),
  ('b1000000-0000-0000-0000-000000000001', 'Hostel Announcement 📢',   'Water supply will be suspended on Sunday 8-11 AM for maintenance. Please store water.',      'announcement', NULL,                                false, NOW() - INTERVAL '1 day'),
  ('b1000000-0000-0000-0000-000000000001', 'Complaint Submitted ✅',    'Your complaint HH-2026-00145 (Common Area Not Cleaned) has been submitted.',                 'complaint', 'c1000000-0000-0000-0000-000000000003', false, NOW() - INTERVAL '1 day'),
  ('b1000000-0000-0000-0000-000000000002', 'Complaint Assigned 👨‍🔧',  'Your complaint HH-2026-00117 has been assigned to Suresh Plumber.',                          'complaint', 'c1000000-0000-0000-0000-000000000004', true,  NOW() - INTERVAL '7 days' + INTERVAL '4 hours'),
  ('b1000000-0000-0000-0000-000000000002', 'Work In Progress 🔧',       'Work started on HH-2026-00117 (Water Leakage from Ceiling).',                                 'complaint', 'c1000000-0000-0000-0000-000000000004', true,  NOW() - INTERVAL '6 days'),
  ('b1000000-0000-0000-0000-000000000002', 'Rate Today''s Lunch 🍛',    'How was lunch today? Give your rating!',                                                       'mess',      NULL,                                    false, NOW() - INTERVAL '3 hours'),
  ('b1000000-0000-0000-0000-000000000003', 'Complaint Resolved ✅',      'Your complaint HH-2026-00108 (Study Table Leg Broken) has been resolved!',                  'complaint', 'c1000000-0000-0000-0000-000000000006', true,  NOW() - INTERVAL '8 days'),
  ('b1000000-0000-0000-0000-000000000004', 'Complaint Assigned 👨‍🔧',  'Your bathroom light complaint HH-2026-00119 has been assigned to Ramesh Kumar.',             'complaint', 'c1000000-0000-0000-0000-000000000008', false, NOW() - INTERVAL '4 days' + INTERVAL '2 hours')
ON CONFLICT DO NOTHING;
