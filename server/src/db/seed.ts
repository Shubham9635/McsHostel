import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

async function seed() {
  console.log('🌱 Seeding HostelHub database via Supabase...');

  // ---- Staff ----
  const staff = [
    { name: 'Ramesh Kumar',     role: 'Electrician',    phone: '9876543210', specialization: 'Fan,Light,Electricity,Wi-Fi', employee_id: 'EMP001', department: 'Electrical' },
    { name: 'Suresh Plumber',   role: 'Plumber',        phone: '9876543211', specialization: 'Water,Plumbing,Bathroom',      employee_id: 'EMP002', department: 'Plumbing' },
    { name: 'Dinesh Carpenter', role: 'Carpenter',      phone: '9876543212', specialization: 'Furniture,Door / Lock',        employee_id: 'EMP003', department: 'Carpentry' },
    { name: 'Mohan Sweeper',    role: 'Cleaning Staff', phone: '9876543213', specialization: 'Cleaning',                     employee_id: 'EMP004', department: 'Housekeeping' },
  ];

  const { data: insertedStaff, error: staffError } = await supabase
    .from('staff').insert(staff).select();
  if (staffError) { console.error('Staff seed error:', staffError.message); return; }
  console.log(`  ✅ Staff: ${insertedStaff?.length} records`);

  // ---- Users ----
  const demoHash = await bcrypt.hash('demo123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);

  const users = [
    { name: 'Arjun Sharma',  email: 'student@hostelhub.demo', student_id: 'STU001', password_hash: demoHash, role: 'student', room: 'B-204', hostel: 'New Boys Hostel', block: null, phone: '9988776655', course: 'B.Tech CSE', year: '3rd Year' },
    { name: 'Priya Patel',   email: 'priya@hostelhub.demo',   student_id: 'STU002', password_hash: demoHash, role: 'student', room: 'A-103', hostel: 'New Girls Hostel', block: null, phone: '9988776644', course: 'B.Tech ECE', year: '2nd Year' },
    { name: 'Rahul Verma',   email: 'rahul@hostelhub.demo',   student_id: 'STU003', password_hash: demoHash, role: 'student', room: 'C-210', hostel: 'Technova', block: null, phone: '9988776633', course: 'B.Tech ME',  year: '4th Year' },
    { name: 'Sneha Gupta',   email: 'sneha@hostelhub.demo',   student_id: 'STU004', password_hash: demoHash, role: 'student', room: 'B-115', hostel: 'Old Girls Hostel', block: null, phone: '9988776622', course: 'B.Tech IT',  year: '1st Year' },
    { name: 'Karan Singh',   email: 'karan@hostelhub.demo',   student_id: 'STU005', password_hash: demoHash, role: 'student', room: 'A-301', hostel: 'Old Boys Hostel', block: null, phone: '9988776611', course: 'B.Tech CSE', year: '2nd Year' },
    { name: 'Ananya Joshi',  email: 'ananya@hostelhub.demo',  student_id: 'STU006', password_hash: demoHash, role: 'student', room: 'C-108', hostel: 'Technova', block: null, phone: '9988776600', course: 'B.Tech EEE', year: '3rd Year' },
    { name: 'Admin Manager', email: 'admin@hostelhub.demo',   student_id: null,     password_hash: adminHash, role: 'admin', room: null, hostel: null, block: null, phone: '9900000001', course: null, year: null },
    { name: 'Hostel Management', email: 'hostelhub.support@gmail.com', student_id: null, password_hash: adminHash, role: 'admin', room: null, hostel: null, block: null, phone: '9900000000', course: null, year: null },
  ];

  const { data: insertedUsers, error: userError } = await supabase
    .from('profiles').insert(users).select();
  if (userError) { console.error('Users seed error:', userError.message); return; }
  console.log(`  ✅ Users: ${insertedUsers?.length} records`);

  const [stu1, stu2, stu3, stu4, stu5, stu6] = insertedUsers!;
  const [staff1, staff2, staff3, staff4] = insertedStaff!;

  // ---- Complaints ----
  function daysAgo(n: number) {
    const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
  }

  const complaints = [
    { complaint_number: 'HH-2026-00124', student_id: stu1.id, category: 'Fan',       title: 'Ceiling Fan Not Working',       description: 'The ceiling fan suddenly stopped working since this morning.', room: 'B-204', hostel: 'New Boys Hostel', priority: 'urgent', status: 'resolved',    assigned_staff_id: staff1.id, assigned_staff_name: staff1.name, created_at: daysAgo(5), assigned_at: daysAgo(5), started_at: daysAgo(4), resolved_at: daysAgo(3) },
    { complaint_number: 'HH-2026-00131', student_id: stu1.id, category: 'Wi-Fi',     title: 'Wi-Fi Extremely Slow in Room', description: 'Internet speed in room B-204 is very slow. Only 0.5 Mbps.',       room: 'B-204', hostel: 'New Boys Hostel', priority: 'medium', status: 'in_progress', assigned_staff_id: staff1.id, assigned_staff_name: staff1.name, created_at: daysAgo(2), assigned_at: daysAgo(2), started_at: daysAgo(1), resolved_at: null },
    { complaint_number: 'HH-2026-00145', student_id: stu1.id, category: 'Cleaning',  title: 'Common Area Not Cleaned',      description: 'Corridor 2nd floor not cleaned for 3 days.',                      room: 'B-204', hostel: 'New Boys Hostel', priority: 'normal', status: 'pending',     assigned_staff_id: null, assigned_staff_name: null, created_at: daysAgo(1), assigned_at: null, started_at: null, resolved_at: null },
    { complaint_number: 'HH-2026-00117', student_id: stu2.id, category: 'Water',     title: 'Water Leakage from Ceiling',   description: 'Water dripping from ceiling near the window.',                   room: 'A-103', hostel: 'New Girls Hostel', priority: 'medium', status: 'in_progress', assigned_staff_id: staff2.id, assigned_staff_name: staff2.name, created_at: daysAgo(7), assigned_at: daysAgo(7), started_at: daysAgo(6), resolved_at: null },
    { complaint_number: 'HH-2026-00139', student_id: stu2.id, category: 'Light',     title: 'Room Light Flickering',        description: 'Tube light keeps flickering continuously.',                      room: 'A-103', hostel: 'New Girls Hostel', priority: 'normal', status: 'assigned',    assigned_staff_id: staff1.id, assigned_staff_name: staff1.name, created_at: daysAgo(3), assigned_at: daysAgo(3), started_at: null, resolved_at: null },
    { complaint_number: 'HH-2026-00108', student_id: stu3.id, category: 'Furniture', title: 'Study Table Leg Broken',       description: 'One leg of the wooden study table is completely broken.',        room: 'C-210', hostel: 'Technova', priority: 'normal', status: 'resolved',    assigned_staff_id: staff3.id, assigned_staff_name: staff3.name, created_at: daysAgo(10), assigned_at: daysAgo(10), started_at: daysAgo(9), resolved_at: daysAgo(8) },
    { complaint_number: 'HH-2026-00149', student_id: stu3.id, category: 'Door / Lock', title: 'Room Door Lock Jammed',      description: 'Door lock is jammed from inside.',                               room: 'C-210', hostel: 'Technova', priority: 'medium', status: 'pending',     assigned_staff_id: null, assigned_staff_name: null, created_at: daysAgo(0), assigned_at: null, started_at: null, resolved_at: null },
    { complaint_number: 'HH-2026-00119', student_id: stu4.id, category: 'Bathroom',  title: 'Bathroom Light Not Working',   description: 'Light in attached bathroom stopped working.',                    room: 'B-115', hostel: 'Old Girls Hostel', priority: 'urgent', status: 'assigned',    assigned_staff_id: staff1.id, assigned_staff_name: staff1.name, created_at: daysAgo(4), assigned_at: daysAgo(4), started_at: null, resolved_at: null },
    { complaint_number: 'HH-2026-00133', student_id: stu5.id, category: 'Plumbing',  title: 'Tap Dripping Continuously',    description: 'Tap drips even when fully closed.',                              room: 'A-301', hostel: 'Old Boys Hostel', priority: 'normal', status: 'resolved',    assigned_staff_id: staff2.id, assigned_staff_name: staff2.name, created_at: daysAgo(6), assigned_at: daysAgo(6), started_at: daysAgo(5), resolved_at: daysAgo(4) },
    { complaint_number: 'HH-2026-00141', student_id: stu6.id, category: 'Electricity', title: 'Power Socket Not Working',   description: '5-pin power socket not giving output.',                          room: 'C-108', hostel: 'Technova', priority: 'medium', status: 'pending',     assigned_staff_id: null, assigned_staff_name: null, created_at: daysAgo(2), assigned_at: null, started_at: null, resolved_at: null },
  ];

  const { data: insertedComplaints, error: complaintError } = await supabase
    .from('complaints').insert(complaints).select();
  if (complaintError) { console.error('Complaints seed error:', complaintError.message); return; }
  console.log(`  ✅ Complaints: ${insertedComplaints?.length} records`);

  const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10] = insertedComplaints!;

  // ---- Feedback ----
  const feedback = [
    { complaint_id: c1.id, student_id: stu1.id, solved: true, rating: 5, comment: 'Fan was fixed very quickly. Thank you!', created_at: daysAgo(3) },
    { complaint_id: c6.id, student_id: stu3.id, solved: true, rating: 4, comment: 'Table was replaced. Good job!', created_at: daysAgo(8) },
    { complaint_id: c9.id, student_id: stu5.id, solved: true, rating: 5, comment: 'Tap fixed same day. Excellent service!', created_at: daysAgo(4) },
  ];
  const { error: fbError } = await supabase.from('complaint_feedback').insert(feedback);
  if (fbError) console.warn('Feedback seed warning:', fbError.message);
  else console.log(`  ✅ Feedback: ${feedback.length} records`);

  // ---- Status History ----
  const history = [
    { complaint_id: c1.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(5) },
    { complaint_id: c1.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Ramesh Kumar', created_at: daysAgo(5) },
    { complaint_id: c1.id, old_status: 'assigned',    new_status: 'in_progress', changed_by_name: 'Ramesh Kumar',      note: 'Started working', created_at: daysAgo(4) },
    { complaint_id: c1.id, old_status: 'in_progress', new_status: 'resolved',    changed_by_name: 'Ramesh Kumar',      note: 'Fan motor replaced', created_at: daysAgo(3) },
    { complaint_id: c2.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(2) },
    { complaint_id: c2.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Ramesh Kumar', created_at: daysAgo(2) },
    { complaint_id: c2.id, old_status: 'assigned',    new_status: 'in_progress', changed_by_name: 'Ramesh Kumar',      note: 'Checking router', created_at: daysAgo(1) },
    { complaint_id: c3.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(1) },
    { complaint_id: c4.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(7) },
    { complaint_id: c4.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Suresh Plumber', created_at: daysAgo(7) },
    { complaint_id: c4.id, old_status: 'assigned',    new_status: 'in_progress', changed_by_name: 'Suresh Plumber',    note: 'Inspecting pipes', created_at: daysAgo(6) },
    { complaint_id: c5.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(3) },
    { complaint_id: c5.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Ramesh Kumar', created_at: daysAgo(3) },
    { complaint_id: c6.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(10) },
    { complaint_id: c6.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Dinesh Carpenter', created_at: daysAgo(10) },
    { complaint_id: c6.id, old_status: 'assigned',    new_status: 'in_progress', changed_by_name: 'Dinesh Carpenter',  note: 'Started repair', created_at: daysAgo(9) },
    { complaint_id: c6.id, old_status: 'in_progress', new_status: 'resolved',    changed_by_name: 'Dinesh Carpenter',  note: 'Table leg replaced', created_at: daysAgo(8) },
    { complaint_id: c7.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: new Date().toISOString() },
    { complaint_id: c8.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(4) },
    { complaint_id: c8.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Ramesh Kumar', created_at: daysAgo(4) },
    { complaint_id: c9.id, old_status: null,          new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(6) },
    { complaint_id: c9.id, old_status: 'pending',     new_status: 'assigned',    changed_by_name: 'Admin Manager',     note: 'Assigned to Suresh Plumber', created_at: daysAgo(6) },
    { complaint_id: c9.id, old_status: 'assigned',    new_status: 'in_progress', changed_by_name: 'Suresh Plumber',    note: 'Faulty washer found', created_at: daysAgo(5) },
    { complaint_id: c9.id, old_status: 'in_progress', new_status: 'resolved',    changed_by_name: 'Suresh Plumber',    note: 'Washer replaced', created_at: daysAgo(4) },
    { complaint_id: c10.id, old_status: null,         new_status: 'pending',     changed_by_name: 'System',            note: 'Complaint submitted', created_at: daysAgo(2) },
  ];
  const { error: histError } = await supabase.from('complaint_status_history').insert(history);
  if (histError) console.warn('History seed warning:', histError.message);
  else console.log(`  ✅ Status history: ${history.length} records`);

  // ---- Mess Reviews ----
  function reviewDate(daysAgo: number) {
    const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().split('T')[0];
  }
  const today = reviewDate(0);
  const reviews = [
    { student_id: stu1.id, meal_type: 'breakfast', review_date: today,            rating: 4, review_text: 'Good poha today!',         anonymous: false },
    { student_id: stu1.id, meal_type: 'lunch',     review_date: today,            rating: 3, review_text: 'Dal was too salty.',        anonymous: false },
    { student_id: stu2.id, meal_type: 'breakfast', review_date: today,            rating: 5, review_text: 'Amazing upma!',            anonymous: false },
    { student_id: stu2.id, meal_type: 'lunch',     review_date: today,            rating: 2, review_text: 'Roti was hard.',           anonymous: false },
    { student_id: stu3.id, meal_type: 'lunch',     review_date: today,            rating: 4, review_text: 'Nice paneer.',             anonymous: true },
    { student_id: stu4.id, meal_type: 'dinner',    review_date: today,            rating: 5, review_text: 'Best dinner of week!',     anonymous: false },
    { student_id: stu5.id, meal_type: 'breakfast', review_date: today,            rating: 4, review_text: 'Decent breakfast.',        anonymous: false },
    { student_id: stu1.id, meal_type: 'breakfast', review_date: reviewDate(1),    rating: 3, review_text: 'Tea was cold.',            anonymous: false },
    { student_id: stu1.id, meal_type: 'lunch',     review_date: reviewDate(1),    rating: 4, review_text: 'Good rajma rice.',         anonymous: false },
    { student_id: stu5.id, meal_type: 'breakfast', review_date: reviewDate(1),    rating: 5, review_text: 'Loved the aloo paratha!', anonymous: false },
    { student_id: stu3.id, meal_type: 'breakfast', review_date: reviewDate(2),    rating: 4, review_text: 'Nice idli sambar.',        anonymous: false },
    { student_id: stu6.id, meal_type: 'lunch',     review_date: reviewDate(2),    rating: 2, review_text: 'Curry was watery.',        anonymous: false },
    { student_id: stu2.id, meal_type: 'breakfast', review_date: reviewDate(4),    rating: 5, review_text: 'Best breakfast in weeks!', anonymous: false },
    { student_id: stu5.id, meal_type: 'lunch',     review_date: reviewDate(5),    rating: 5, review_text: 'Special Sunday lunch was superb!', anonymous: false },
  ];
  const { error: reviewError } = await supabase.from('mess_reviews').insert(reviews);
  if (reviewError) console.warn('Reviews seed warning:', reviewError.message);
  else console.log(`  ✅ Mess reviews: ${reviews.length} records`);

  console.log('\n✅ HostelHub database seeded successfully!');
  console.log('\n🔑 Demo accounts:');
  console.log('  Student: student@hostelhub.demo / demo123');
  console.log('  Admin:   admin@hostelhub.demo   / admin123');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
